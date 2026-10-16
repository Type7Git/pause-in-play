import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { SproutMic } from "@/components/mm/icons";
import { Sprout } from "@/components/mm/Sprout";
import { Card, Chip, Field, Muted, Pill, Row } from "@/components/mm/ui";
import { enablePush } from "@/lib/push";
import { savePushToken } from "@/lib/push.functions";
import { remindAtFor, useRewards } from "@/lib/rewards";
import { REMIND_LABEL, type Filed, type Remind } from "@/lib/voice-file";
import { fileVoiceNote, transcribeVoice } from "@/lib/voice.functions";

export const Route = createFileRoute("/tell-enera")({
  head: () => ({
    meta: [
      { title: "Tell Enera · Lumenera" },
      { name: "description", content: "Say what you're doing or where you put something, and Enera files it for you to check." },
      { property: "og:title", content: "Tell Enera · Lumenera" },
      { property: "og:description", content: "Speak a note; Enera sorts it into Side Quest Saver or the VIT Department." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TellSprout,
});

type Phase = "idle" | "explain" | "listening" | "thinking" | "heard";
type Draft = { type: "quest" | "vit" | "unsure"; doing: string; next: string; remind: Remind; thing: string; location: string };
const REMINDS: Remind[] = ["none", "10min", "30min", "tonight"];
const VIT_BADGE_AT = 6;

type SR = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null };
const getSR = (): (new () => SR) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

function TellSprout() {
  const { addQuest, addVit, earn, user, vit } = useRewards();
  const [phase, setPhase] = useState<Phase>("idle");
  const [micOk, setMicOk] = useState(true);
  const [note, setNote] = useState("");
  const [typed, setTyped] = useState("");
  const [heard, setHeard] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [crisis, setCrisis] = useState("");
  const [saved, setSaved] = useState<null | "quest" | "vit">(null);
  const stopRef = useRef<() => void>(() => {});
  const asked = useRef(false);

  useEffect(() => {
    asked.current = localStorage.getItem("midlife-mind:mic-explained") === "1";
    if (!getSR() && !(navigator.mediaDevices && "MediaRecorder" in window)) setMicOk(false);
    return () => stopRef.current();
  }, []);

  const sort = async (text: string) => {
    const t = text.trim();
    if (!t) { setPhase("idle"); setNote("Enera didn't catch anything. Try again, or type it."); return; }
    setHeard(t); setPhase("thinking"); setNote("Got it."); setCrisis(""); setSaved(null);
    const r: Filed = await fileVoiceNote({ data: { text: t.slice(0, 600) } });
    if (r.type === "crisis") { setCrisis(r.text); setDraft(null); setPhase("heard"); return; }
    if (r.type === "error") { setDraft({ type: "unsure", doing: t, next: "", remind: "none", thing: t, location: "" }); setNote(r.text); setPhase("heard"); return; }
    setDraft({ type: r.type, doing: r.doing || (r.type === "unsure" ? t : ""), next: r.next_step, remind: r.remind, thing: r.thing || (r.type === "unsure" ? t : ""), location: r.location });
    setPhase("heard");
  };

  const denied = () => { setMicOk(false); setPhase("idle"); setNote("No problem. You can type it instead."); };

  const listen = async () => {
    if (phase === "listening") { stopRef.current(); return; }
    if (!asked.current) { setPhase("explain"); return; }
    setDraft(null); setCrisis(""); setSaved(null);
    const Rec = getSR();
    if (Rec) {
      const rec = new Rec();
      rec.lang = "en-AU"; rec.interimResults = true; rec.continuous = true;
      let text = ""; let silence = 0; let failed = false;
      const total = window.setTimeout(() => rec.stop(), 30_000);
      const arm = () => { clearTimeout(silence); silence = window.setTimeout(() => rec.stop(), 3_000); };
      rec.onresult = (e) => { text = Array.from(e.results).map((r) => r[0]!.transcript).join(" "); setHeard(text); arm(); };
      rec.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { failed = true; denied(); } };
      rec.onend = () => { clearTimeout(total); clearTimeout(silence); if (!failed) void sort(text); };
      stopRef.current = () => rec.stop();
      setPhase("listening"); setNote("Listening…"); setHeard("");
      rec.start(); arm();
      return;
    }
    // Fallback: record a short clip, transcribe on the server, discard it.
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { denied(); return; }
    const mr = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => chunks.push(e.data);
    const ctx = new AudioContext();
    const an = ctx.createAnalyser(); ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize); let quietSince = Date.now();
    const tick = window.setInterval(() => {
      an.getByteTimeDomainData(buf);
      const loud = buf.some((v) => Math.abs(v - 128) > 12);
      if (loud) quietSince = Date.now(); else if (Date.now() - quietSince > 3_000) mr.stop();
    }, 200);
    const total = window.setTimeout(() => mr.state !== "inactive" && mr.stop(), 30_000);
    mr.onstop = async () => {
      clearInterval(tick); clearTimeout(total); stream.getTracks().forEach((t) => t.stop()); void ctx.close();
      setPhase("thinking"); setNote("Got it.");
      const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
      const b64 = await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1] ?? ""); fr.readAsDataURL(blob); });
      const r = await transcribeVoice({ data: { audio: b64, mime: blob.type || "audio/webm" } });
      if ("error" in r) { setPhase("idle"); setNote(r.error); return; }
      void sort(r.text);
    };
    stopRef.current = () => mr.state !== "inactive" && mr.stop();
    setPhase("listening"); setNote("Listening…"); setHeard("");
    mr.start();
  };

  const nudge = (remindAt: string | null) => {
    if (remindAt && user && "Notification" in window && Notification.permission === "default") {
      void enablePush().then(async (r) => { if (r.status === "registered") await savePushToken({ data: { token: r.token } }); });
    }
  };

  const save = () => {
    if (!draft) return;
    if (draft.type === "quest" && draft.doing.trim()) {
      const remindAt = remindAtFor(REMIND_LABEL[draft.remind]);
      addQuest({ doing: draft.doing.trim(), next: draft.next.trim(), remindAt });
      earn(3, "Mission parked. Go handle the side quest", "Side Quest Saver");
      nudge(remindAt); setSaved("quest");
    } else if (draft.type === "vit" && draft.thing.trim() && draft.location.trim()) {
      const count = addVit(draft.thing.trim(), draft.location.trim());
      earn(3, "Filed. The department thanks you", count >= VIT_BADGE_AT ? "VIT Department head" : undefined);
      setSaved("vit");
    } else return;
    setDraft(null); setHeard(""); setPhase("idle"); setNote("");
  };
  const discard = () => { setDraft(null); setHeard(""); setPhase("idle"); setNote(""); };
  const set = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  void vit;

  const listening = phase === "listening";
  return (
    <>
      <BackButton />
      <div className="flex flex-col items-center gap-2 text-center">
        <Sprout size={64} mood={listening ? "thinking" : "happy"} />
        <p className="eyebrow">Tell Enera</p>
        <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">Just say it. Enera will file it.</h1>
        <Muted>Say what you're in the middle of, or where you put something. Enera sorts it into Side Quest Saver or the Very Important Thing Department, and you check it before it's saved.</Muted>
      </div>

      {phase === "explain" && (
        <Card role="dialog" aria-label="Microphone">
          <p>Enera needs your microphone to hear you. Your voice isn't stored.</p>
          <Row>
            <Pill onClick={() => { localStorage.setItem("midlife-mind:mic-explained", "1"); asked.current = true; setPhase("idle"); void listen(); }}>OK, let's go</Pill>
            <Pill variant="ghost" onClick={() => denied()}>I'll type instead</Pill>
          </Row>
        </Card>
      )}

      {micOk && phase !== "explain" && (
        <div className="flex flex-col items-center gap-3 py-2">
          <button
            type="button" onClick={() => void listen()} disabled={phase === "thinking"}
            aria-label={listening ? "Stop listening" : "Start speaking to Enera"} aria-pressed={listening}
            className="press relative grid size-24 place-items-center rounded-full bg-sage text-card shadow-lift disabled:opacity-60"
          >
            {listening && <><span className="mm-ring absolute inset-0 rounded-full border-2 border-sage" /><span className="mm-ring mm-ring-2 absolute inset-0 rounded-full border-2 border-sage" /></>}
            <SproutMic className="size-10" />
          </button>
          <p role="status" className="font-bold text-muted-foreground">{note || "Tap the mic and just say it."}</p>
        </div>
      )}
      {!micOk && note && <p role="status" className="text-center font-bold text-muted-foreground">{note}</p>}

      {!draft && !crisis && (
        <form onSubmit={(e) => { e.preventDefault(); if (typed.trim()) { void sort(typed); setTyped(""); } }} className="flex items-end gap-2">
          <div className="flex-1"><Field label="Or type it" maxLength={600} placeholder="e.g. My passport is in the top drawer" value={typed} onChange={(e) => setTyped(e.target.value)} /></div>
          <Pill type="submit" variant="ghost" disabled={!typed.trim() || phase === "thinking"}>Sort it</Pill>
        </form>
      )}

      {heard && (phase === "heard" || listening) && (
        <div>
          <p className="eyebrow mb-1">Enera heard:</p>
          <blockquote className="rounded-[14px] bg-sunk px-4 py-3 italic">“{heard}”</blockquote>
        </div>
      )}

      {crisis && (
        <Card className="border-rose bg-rose-soft">
          <p className="whitespace-pre-line">{crisis}</p>
          <Row>
            <a href="tel:131114" className="press inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-bold text-card">Call Lifeline 13 11 14</a>
            <a href="tel:000" className="press inline-flex min-h-11 items-center rounded-full border border-line bg-card px-5 font-bold">Call 000</a>
          </Row>
          <Pill variant="ghost" onClick={() => { setCrisis(""); setHeard(""); setPhase("idle"); setNote(""); }}>Back</Pill>
        </Card>
      )}

      {draft?.type === "unsure" && (
        <Card>
          <p className="font-bold">Enera wasn't sure where this goes. Is it…</p>
          <Row>
            <Pill onClick={() => set({ type: "quest" })}>Something I'm doing</Pill>
            <Pill variant="ghost" onClick={() => set({ type: "vit" })}>Where I put something</Pill>
          </Row>
          <Pill variant="ghost" size="sm" onClick={discard}>Discard</Pill>
        </Card>
      )}

      {draft?.type === "quest" && (
        <Card>
          <span className="w-fit rounded-full bg-plum-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-plum">Side Quest Saver</span>
          <Field label="What I'm doing" required value={draft.doing} onChange={(e) => set({ doing: e.target.value })} />
          <Field label="The very next step" value={draft.next} onChange={(e) => set({ next: e.target.value })} />
          <div className="flex flex-col gap-1.5 text-[13px] font-bold text-muted-foreground" role="group" aria-label="Nudge me">
            Nudge me
            <div className="flex flex-wrap gap-2">
              {REMINDS.map((r) => <Chip key={r} pressed={draft.remind === r} onClick={() => set({ remind: r })}>{REMIND_LABEL[r]}</Chip>)}
            </div>
          </div>
          <Row>
            <Pill onClick={save} disabled={!draft.doing.trim()}>Park it</Pill>
            <Pill variant="ghost" onClick={() => set({ type: "vit", thing: draft.thing || draft.doing })}>It's a thing to remember</Pill>
          </Row>
          <Pill variant="ghost" size="sm" onClick={discard}>Discard</Pill>
        </Card>
      )}

      {draft?.type === "vit" && (
        <Card>
          <span className="w-fit rounded-full bg-gold-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-ink">Very Important Thing Department</span>
          <Field label="The thing" required value={draft.thing} onChange={(e) => set({ thing: e.target.value })} />
          <Field label="Where it lives" required value={draft.location} onChange={(e) => set({ location: e.target.value })} />
          <Row>
            <Pill onClick={save} disabled={!draft.thing.trim() || !draft.location.trim()}>File it</Pill>
            <Pill variant="ghost" onClick={() => set({ type: "quest", doing: draft.doing || draft.thing })}>It's something I'm doing</Pill>
          </Row>
          <Pill variant="ghost" size="sm" onClick={discard}>Discard</Pill>
        </Card>
      )}

      {saved && (
        <Card className="flex-row items-center gap-3" role="status">
          <Sprout size={44} mood="wave" />
          <div className="flex flex-1 flex-col gap-1">
            <p className="font-bold">{saved === "quest" ? "Parked. Enera's keeping an eye on it." : "Filed. Enera knows where it lives."}</p>
            <Link to={saved === "quest" ? "/side-quest" : "/remember"} className="font-bold text-plum underline underline-offset-2">
              Open {saved === "quest" ? "Side Quest Saver" : "the VIT Department"} →
            </Link>
          </div>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">Your voice is turned into text and not stored. Only the text you save is kept.</p>
    </>
  );
}
