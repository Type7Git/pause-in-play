import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Muted, Pill } from "@/components/mm/ui";
import { supabase } from "@/integrations/supabase/client";
import { TYPE_STYLE, useBody, type Move, type Session } from "@/lib/body";
import { useRewards } from "@/lib/rewards";
import { SafetyCard } from "./move.index";

export const Route = createFileRoute("/move/$key")({
  head: () => ({ meta: [{ title: "Movement session · Pause in Play" }, { name: "description", content: "A short guided movement session with easier versions for every move." }, { property: "og:title", content: "Movement session · Pause in Play" }, { property: "og:description", content: "Short guided movement, at your pace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SessionScreen,
});

const FEEL = [{ k: "better", l: "Better" }, { k: "same", l: "About the same" }, { k: "tired_glad", l: "Tired, but glad" }] as const;

function SessionScreen() {
  const { key } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["movement-session", key],
    queryFn: async () => {
      const [s, m] = await Promise.all([
        supabase.from("movement_sessions").select("*").eq("key", key).eq("status", "approved").maybeSingle(),
        supabase.from("session_moves").select("*").eq("session_key", key).order("order"),
      ]);
      return { session: s.data as unknown as Session | null, moves: (m.data ?? []) as unknown as Move[] };
    },
  });
  const body = useBody();
  const { earn } = useRewards();
  const [mode, setMode] = useState<"overview" | "play" | "done">("overview");
  const [feel, setFeel] = useState<string | null>(null);

  if (isLoading) return <Muted>Getting ready…</Muted>;
  const s = data?.session;
  if (!s) return <><BackButton /><Muted>This session isn't available yet.</Muted><Link to="/move" className="font-bold text-plum">See all sessions →</Link></>;
  const moves = data!.moves;

  const finish = (via: "player" | "tick") => {
    const first = !body.log.length;
    body.update((b) => ({ ...b, log: [...b.log, { session_key: s.key, type: s.type, minutes: s.minutes, completed_at: new Date().toISOString(), via }] }));
    earn(3, "Done. That counts.", first ? "Moving gently" : undefined);
    setMode("done");
  };

  if (mode === "play") return <Player session={s} moves={moves} onExit={() => setMode("overview")} onFinish={() => finish("player")} />;
  if (mode === "done") return (
    <>
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="grid size-20 animate-heart-pop place-items-center rounded-full bg-sage-soft"><Check className="size-10 text-sage" aria-hidden="true" /></span>
        <h1>Done. That counts.</h1>
        <Muted>{s.minutes} minutes of {s.type.toLowerCase()}, ticked off.</Muted>
      </div>
      <Card>
        <h3>How do you feel?</h3>
        <div className="flex flex-wrap gap-2">{FEEL.map((f) => <Chip key={f.k} pressed={feel === f.k} onClick={() => setFeel(f.k)}>{f.l}</Chip>)}</div>
        {feel && <Muted>Thanks for noticing. This stays with you, it isn't saved anywhere.</Muted>}
      </Card>
      <Link to="/move" className="press rounded-full bg-plum px-5 py-3 text-center font-bold text-shell">Back to Move today</Link>
    </>
  );

  return (
    <>
      <BackButton />
      {body.ready && !body.safetySeen && <SafetyCard onDone={() => body.update((b) => ({ ...b, safetySeen: true }))} />}
      <div className="flex flex-col gap-1">
        <p className="eyebrow">{s.type} · {s.minutes} min</p>
        <h1>{s.title}</h1>
        <p>{s.description}</p>
        <span className="flex flex-wrap gap-1">{s.benefit_tags.map((t) => <span key={t} className="rounded-full bg-sunk px-2 py-0.5 text-xs">{t}</span>)}</span>
      </div>
      <Card>
        <ol className="flex flex-col gap-2">
          {moves.map((m, i) => (
            <li key={m.order} className="flex items-start gap-3">
              <b className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${TYPE_STYLE[s.type].tile}`}>{i + 1}</b>
              <span className="flex-1">{m.move}{m.caution_flag && <span className="ml-2 text-xs font-bold text-rose">check first</span>}</span>
              <span className="text-sm text-muted-foreground">{m.seconds}s</span>
            </li>
          ))}
        </ol>
      </Card>
      <Pill onClick={() => setMode("play")} disabled={!moves.length}>Start</Pill>
      <Pill variant="ghost" onClick={() => finish("tick")}>Already done it? Just tick it off</Pill>
    </>
  );
}

function Player({ session, moves, onExit, onFinish }: { session: Session; moves: Move[]; onExit: () => void; onFinish: () => void }) {
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(moves[0]!.seconds);
  const [paused, setPaused] = useState(false);
  const [easier, setEasier] = useState(false);
  const m = moves[i]!;
  const last = i === moves.length - 1;
  const go = (n: number) => { if (n >= moves.length) return onFinish(); const k = Math.max(0, n); setI(k); setLeft(moves[k]!.seconds); setEasier(false); };
  const goRef = useRef(go); goRef.current = go;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [paused, i]);
  useEffect(() => { if (left <= 0) goRef.current(i + 1); }, [left, i]);

  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    const get = () => nav.wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => {});
    void get();
    const vis = () => { if (document.visibilityState === "visible") void get(); };
    document.addEventListener("visibilitychange", vis);
    return () => { document.removeEventListener("visibilitychange", vis); void lock?.release().catch(() => {}); };
  }, []);

  const R = 70, C = 2 * Math.PI * R;
  return (
    <>
      <button type="button" onClick={onExit} className="self-start text-sm font-bold text-plum">← Leave session</button>
      <p className="eyebrow text-center">Move {i + 1} of {moves.length}</p>
      <div className="relative mx-auto size-[180px]" role="timer" aria-live="off" aria-label={`${Math.max(0, left)} seconds left`}>
        <svg viewBox="0 0 180 180" className="size-full" aria-hidden="true">
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--mm-sunk)" strokeWidth="12" />
          <circle cx="90" cy="90" r={R} fill="none" stroke={TYPE_STYLE[session.type].stroke} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - Math.max(0, left) / m.seconds)} transform="rotate(-90 90 90)" className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
        </svg>
        <b className="absolute inset-0 grid place-items-center font-display text-4xl tabular-nums">{Math.max(0, left)}</b>
      </div>
      <h1 className="text-center" aria-live="polite">{m.move}</h1>
      <p>{easier && m.easier_version ? m.easier_version : m.how}</p>
      {m.caution_flag && m.caution_text && <p className="rounded-2xl bg-rose-soft p-3 text-sm">{m.caution_text}</p>}
      {m.easier_version && <Chip pressed={easier} onClick={() => setEasier(!easier)}>Make it easier</Chip>}
      <div className="grid grid-cols-3 gap-2">
        <Pill variant="ghost" onClick={() => go(i - 1)} disabled={i === 0}>Back</Pill>
        <Pill variant="ghost" onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</Pill>
        <Pill onClick={() => go(i + 1)}>{last ? "Finish" : "Next"}</Pill>
      </div>
    </>
  );
}
