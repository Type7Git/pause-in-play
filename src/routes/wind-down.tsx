import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { RecordedByErin } from "@/components/mm/Erin";
import { Card, Muted, Pill, Row, ScreenTitle, prefersReducedMotion } from "@/components/mm/ui";

export const Route = createFileRoute("/wind-down")({
  head: () => ({
    meta: [
      { title: "Wind down · Midlife Mind" },
      { name: "description", content: "Quiet, guided wind-down sessions. Nothing to win here. Just rest." },
      { property: "og:title", content: "Wind down · Midlife Mind" },
      { property: "og:description", content: "Nothing to win here. Just rest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WindDown,
});

/** Add an `audio` URL per session once Erin's recordings are ready. */
type Session = { title: string; sub: string; lines: string[]; audio?: string };
const SESSIONS: Session[] = [
  { title: "3am mind", sub: "Back to sleep without the to-do list", lines: ["You are awake, and that is all right.", "Let the list wait. It will still be there at breakfast.", "Feel the weight of your head on the pillow.", "Breathe out a little longer than you breathe in.", "Set each worry on a shelf, one at a time.", "Nothing to solve now. Just rest."] },
  { title: "Cool down", sub: "A body scan for night sweats", lines: ["Notice the air on your face.", "Let your shoulders drop away from your ears.", "Imagine cool water running slowly down your arms.", "Your feet are heavy and still.", "Each breath out lets a little warmth leave.", "Rest here as long as you like."] },
  { title: "Heavy blanket", sub: "Gentle muscle relaxation", lines: ["Curl your toes for five seconds, then let go.", "Tense your calves, hold, and release.", "Make soft fists, then open your hands.", "Lift your shoulders, then let them fall.", "Let your face go smooth.", "Your whole body is heavy now, like a warm blanket."] },
];
const LINE_MS = 6500;

function WindDown() {
  const [active, setActive] = useState<number | null>(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dark, setDark] = useState(false);
  const iv = useRef<ReturnType<typeof setInterval>>(undefined);
  const fade = useRef<ReturnType<typeof setTimeout>>(undefined);
  const audio = useRef<HTMLAudioElement>(null);
  const player = useRef<HTMLElement>(null);

  const stop = () => { clearInterval(iv.current); clearTimeout(fade.current); audio.current?.pause(); setActive(null); };
  useEffect(() => () => { clearInterval(iv.current); clearTimeout(fade.current); }, []);

  const showLine = (i: number) => {
    setVisible(false);
    fade.current = setTimeout(() => { setIdx(i); setVisible(true); }, prefersReducedMotion() ? 0 : 400);
  };

  const begin = (s: number) => {
    clearInterval(iv.current);
    setActive(s);
    setIdx(0);
    setVisible(true);
    let i = 0;
    const n = SESSIONS[s]!.lines.length;
    iv.current = setInterval(() => {
      i++;
      if (i > n) return clearInterval(iv.current);
      showLine(i);
    }, LINE_MS);
    requestAnimationFrame(() => player.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" }));
  };

  const session = active !== null ? SESSIONS[active]! : null;
  const line = session ? (idx < session.lines.length ? session.lines[idx] : "Rest well.") : "";

  return (
    <>
      <BackButton />
      <svg viewBox="0 0 340 90" aria-hidden="true" className="h-[90px] w-full">
        <path d="M196 58A26 26 0 0 1 168 20 26 26 0 1 0 196 58z" fill="var(--color-night-ink)" opacity=".8" />
        {[[40, 30], [80, 60], [120, 20], [230, 30], [270, 64], [300, 22], [150, 72]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 1.4 : 2} fill="var(--color-night-ink)" opacity=".5" />
        ))}
      </svg>
      <ScreenTitle eyebrow="Wind down" title="Nothing to win here. Just rest." />
      <Card>
        <ul className="flex flex-col gap-2">
          {SESSIONS.map((s, i) => (
            <Row key={s.title}>
              <span className="min-w-0"><b>{s.title}</b><br /><small className="text-[12.5px] text-muted-foreground">{s.sub}</small></span>
              <Pill variant="ghost" size="sm" onClick={() => begin(i)}>Begin</Pill>
            </Row>
          ))}
        </ul>
        <RecordedByErin />
        <p className="rounded-xl bg-gold-soft px-3 py-2 text-[12.5px] text-muted-foreground">Erin-recorded audio goes here. Text is shown for now.</p>
      </Card>

      {session && (
        <Card ref={player}>
          <p className="eyebrow">{session.title}</p>
          <RecordedByErin />
          {session.audio && <audio ref={audio} src={session.audio} autoPlay controls className="w-full" />}
          <p className={`min-h-[140px] font-display text-[22px] font-medium leading-normal transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`} aria-live="polite">{line}</p>
          <div className="h-1 overflow-hidden rounded-full bg-sunk">
            <i className="petal-bar block h-full transition-[width] duration-500" style={{ width: `${Math.round((Math.min(idx + 1, session.lines.length) / session.lines.length) * 100)}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill variant="ghost" size="sm" onClick={() => setDark(true)}>Turn screen off</Pill>
            <Pill variant="ghost" size="sm" onClick={stop}>Stop</Pill>
          </div>
        </Card>
      )}

      {dark && (
        <button aria-label="Tap anywhere to wake" onClick={() => setDark(false)} className="fixed inset-0 z-20 grid cursor-pointer place-items-center bg-night">
          <span className="animate-glow size-2.5 rounded-full bg-night-2" />
          <span className="absolute bottom-7 text-xs text-night-muted/50">Tap anywhere to wake</span>
        </button>
      )}
      <Muted className="sr-only">No scores on this screen.</Muted>
    </>
  );
}
