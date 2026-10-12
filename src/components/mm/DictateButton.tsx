import { useEffect, useRef, useState } from "react";
import { MicIcon } from "@/routes/tell-sprout";
import { transcribeVoice } from "@/lib/voice.functions";

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
const getSR = (): (new () => SR) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/**
 * Small mic button that dictates into a single field. Uses live speech
 * recognition where available, else records a short clip for server-side
 * transcription (audio is discarded). Calls onText with the heard words.
 */
export function DictateButton({ onText, label }: { onText: (text: string) => void; label: string }) {
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  const [supported, setSupported] = useState(true);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!getSR() && !(navigator.mediaDevices && "MediaRecorder" in window)) setSupported(false);
    return () => stopRef.current();
  }, []);

  const finish = (text: string) => {
    setListening(false);
    const t = text.trim();
    if (t) { onText(t); setNote(""); } else setNote("Didn't catch that — try again.");
  };
  const denied = () => { setListening(false); setNote("Microphone is off for this browser."); };

  const toggle = async () => {
    if (listening) { stopRef.current(); return; }
    setNote("");
    const Rec = getSR();
    if (Rec) {
      const rec = new Rec();
      rec.lang = "en-AU"; rec.interimResults = false; rec.continuous = false;
      let text = ""; let failed = false;
      const total = window.setTimeout(() => rec.stop(), 15_000);
      rec.onresult = (e) => { text = Array.from(e.results).map((r) => r[0]!.transcript).join(" "); };
      rec.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { failed = true; denied(); } };
      rec.onend = () => { clearTimeout(total); if (!failed) finish(text); };
      stopRef.current = () => rec.stop();
      setListening(true);
      rec.start();
      return;
    }
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { denied(); return; }
    const mr = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => chunks.push(e.data);
    const total = window.setTimeout(() => mr.state !== "inactive" && mr.stop(), 15_000);
    mr.onstop = async () => {
      clearTimeout(total); stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
      const b64 = await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1] ?? ""); fr.readAsDataURL(blob); });
      const r = await transcribeVoice({ data: { audio: b64, mime: blob.type || "audio/webm" } });
      if ("error" in r) { setListening(false); setNote(r.error); return; }
      finish(r.text);
    };
    stopRef.current = () => mr.state !== "inactive" && mr.stop();
    setListening(true);
    mr.start();
  };

  if (!supported) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={listening ? `Stop dictating ${label}` : `Dictate ${label}`}
        aria-pressed={listening}
        className="press relative grid size-11 place-items-center rounded-full border-[1.5px] border-line bg-card text-plum aria-pressed:border-sage aria-pressed:bg-sage-soft aria-pressed:text-sage"
      >
        {listening && <span className="mm-ring absolute inset-0 rounded-full border-2 border-sage" />}
        <MicIcon className="size-5" />
      </button>
      {note && <span role="status" className="text-xs font-bold text-muted-foreground">{note}</span>}
    </span>
  );
}
