/**
 * Speech to text for Enera's chat, Tell Enera and the dictate buttons.
 * Uses the browser's live recognition where it works, else records a short clip for server transcription
 * (the audio is never stored). Android Chrome repeats earlier words inside each new result, so results are
 * merged rather than joined; see joinResults (tested).
 */
import { transcribeVoice } from "./voice.functions";

type Alt = { transcript: string };
type Result = ArrayLike<Alt> & { isFinal: boolean };
type SR = {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<Result> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
export const getSR = (): (new () => SR) | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};
const canRecord = () => typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && "MediaRecorder" in window;
export const voiceSupported = () => !!getSR() || canRecord();
const isAndroid = () => typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
/**
 * Turns recognition results into one clean transcript. Some browsers (notably Android Chrome) send each
 * result as the whole phrase so far ("hello", "hello my", "hello my name"), so a result that repeats or
 * extends the one before replaces it instead of being added again.
 */
export function joinResults(texts: string[]): string {
  const parts: string[] = [];
  for (const raw of texts) {
    const t = raw.trim().replace(/\s+/g, " ");
    if (!t) continue;
    const last = parts[parts.length - 1];
    if (last !== undefined) {
      const a = norm(last), b = norm(t), all = norm(parts.join(" "));
      if (b === a || a.startsWith(b) || all.endsWith(b)) continue; // a repeat
      if (b.startsWith(a)) { parts[parts.length - 1] = t; continue; } // the same phrase, grown
      if (b.startsWith(all)) { parts.splice(0, parts.length, t); continue; } // everything so far, grown
    }
    parts.push(t);
  }
  return parts.join(" ");
}
const resultTexts = (results: ArrayLike<Result>) => Array.from(results).map((r) => r[0]?.transcript ?? "");

export type Listening = { stop: () => void };
export type ListenOptions = {
  /** Live words while she speaks. */
  onWords?: (text: string) => void;
  /** Called once with the final words ("" if nothing was heard). */
  onDone: (text: string) => void;
  /** A message to show: mic blocked, couldn't hear, or the service failed. */
  onProblem: (message: string, blocked: boolean) => void;
  /** Stop after this much quiet (ms). */
  silenceMs?: number;
  /** Never listen longer than this (ms). */
  maxMs?: number;
};

/** Start listening. Returns a handle to stop early; onDone always fires once. */
export async function listen(o: ListenOptions): Promise<Listening> {
  const silenceMs = o.silenceMs ?? 2_500, maxMs = o.maxMs ?? 30_000;
  let done = false;
  const finish = (text: string) => { if (done) return; done = true; o.onDone(text.trim().slice(0, 600)); };
  const Rec = getSR();
  if (Rec) {
    const rec = new Rec();
    rec.lang = "en-AU"; rec.interimResults = true; rec.maxAlternatives = 1;
    // Continuous mode on Android repeats and stalls; one utterance at a time is reliable there.
    rec.continuous = !isAndroid();
    let text = "", silence = 0, fallback = false;
    let stopFallback = () => {};
    const total = window.setTimeout(() => rec.stop(), maxMs);
    const arm = () => { clearTimeout(silence); silence = window.setTimeout(() => rec.stop(), silenceMs); };
    rec.onresult = (e) => { text = joinResults(resultTexts(e.results)); o.onWords?.(text); arm(); };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") { done = true; o.onProblem("The microphone is off for Lumenera. You can turn it on in your settings, or type instead.", true); return; }
      if (e.error === "no-speech" || e.error === "aborted") return; // onend reports nothing heard
      // The live service isn't available here (common in app web views): record a clip instead.
      if (canRecord()) fallback = true;
      else { done = true; o.onProblem("Voice isn't available right now. You can type instead.", false); }
    };
    rec.onend = () => {
      clearTimeout(total); clearTimeout(silence);
      if (fallback && !done && !text) { void record(o, silenceMs, maxMs, finish).then((h) => { stopFallback = h.stop; }); return; }
      finish(text);
    };
    try { rec.start(); arm(); } catch { clearTimeout(total); return record(o, silenceMs, maxMs, finish); }
    return { stop: () => { try { rec.stop(); } catch { /* already stopped */ } stopFallback(); } };
  }
  return record(o, silenceMs, maxMs, finish);
}

/** Record a short clip and transcribe it on the server; the clip is discarded. */
async function record(o: ListenOptions, silenceMs: number, maxMs: number, finish: (t: string) => void): Promise<Listening> {
  let stream: MediaStream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch { o.onProblem("The microphone is off for Lumenera. You can turn it on in your settings, or type instead.", true); return { stop: () => {} }; }
  const mr = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  let ctx: AudioContext | null = null, tick = 0;
  try {
    ctx = new AudioContext();
    const an = ctx.createAnalyser(); ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize); let quietSince = Date.now(), spoke = false;
    tick = window.setInterval(() => {
      an.getByteTimeDomainData(buf);
      if (buf.some((v) => Math.abs(v - 128) > 12)) { quietSince = Date.now(); spoke = true; }
      else if (spoke && Date.now() - quietSince > silenceMs && mr.state !== "inactive") mr.stop();
    }, 200);
  } catch { /* no silence detection: the time limit still applies */ }
  const total = window.setTimeout(() => mr.state !== "inactive" && mr.stop(), maxMs);
  mr.onstop = async () => {
    clearInterval(tick); clearTimeout(total); stream.getTracks().forEach((t) => t.stop()); void ctx?.close();
    o.onWords?.("…");
    try {
      const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
      if (blob.size < 1000) { finish(""); return; }
      const b64 = await new Promise<string>((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1] ?? ""); fr.onerror = rej; fr.readAsDataURL(blob); });
      const r = await transcribeVoice({ data: { audio: b64, mime: blob.type || "audio/webm" } });
      if ("error" in r) { o.onProblem(r.error, false); finish(""); return; }
      finish(joinResults([r.text]));
    } catch {
      o.onProblem("That didn't come through. Try again, or type instead.", false);
      finish("");
    }
  };
  mr.start();
  return { stop: () => { if (mr.state !== "inactive") mr.stop(); } };
}
