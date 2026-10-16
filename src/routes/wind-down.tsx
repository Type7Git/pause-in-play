import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Muted, Pill, Row, ScreenTitle, prefersReducedMotion } from "@/components/mm/ui";
import { MoveStrip } from "@/components/mm/MoveFigure";

export const Route = createFileRoute("/wind-down")({
  head: () => ({
    meta: [
      { title: "Relax and Restore · Lumenera" },
      { name: "description", content: "Guided relaxations and gentle rest poses. Nothing to win here. Just rest." },
      { property: "og:title", content: "Relax and Restore · Lumenera" },
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
  { title: "In the zone", sub: "Clear the noise before you focus", lines: ["Sit comfortably, feet on the floor, hands resting wherever they land.", "Breathe in through your nose for four. Out slowly for six.", "Pick one thing you want to give your attention to. Just one.", "Picture it in front of you, like a single open tab.", "When another thought knocks, notice it, and let it wait outside.", "Bring your attention back. Every time you do, that's the practice.", "Let your shoulders drop and your jaw soften.", "One more slow breath. You're ready. Start with the smallest first step."] },
  { title: "My happy place", sub: "Visit somewhere that feels like you", lines: ["Close your eyes, or let your gaze rest softly on the floor.", "Think of a place where you feel safe and at ease. Real or imagined.", "Notice what you can see there. The colours, the light.", "Listen. Maybe waves, birds, a kettle, or nothing at all.", "Feel the air on your skin and the ground beneath you.", "Breathe in, and imagine the air of that place filling your chest.", "Stay as long as you like. Nothing needs you right now.", "This place is yours. You can come back any time, in a single breath."] },
];
const LINE_MS = 6500;

/** Restorative yoga shapes, held still. Figures come from the Move illustrations. */
const POSES: { name: string; figure: string; how: string[]; note?: string }[] = [
  { name: "Child's pose", figure: "Child's pose", how: ["Kneel, big toes together, knees as wide as feels good.", "Fold forward and rest your forehead on the floor, a cushion or your stacked hands.", "Let your back widen with each breath out."], note: "A pillow between your heels and bottom helps if your knees complain." },
  { name: "Legs up the wall", figure: "Legs up the wall", how: ["Sit side-on to a wall, then swing your legs up as you lie back.", "Shuffle as close to the wall as is comfortable. Knees can bend.", "Arms by your sides, palms up. Let the floor hold you."], note: "Skip this one if lying flat or legs-up is uncomfortable for you." },
  { name: "Reclined butterfly", figure: "Reclined butterfly", how: ["Lie on your back, soles of your feet together, knees falling open.", "Rest a cushion under each knee so nothing strains.", "One hand on your belly, one on your chest. Breathe slowly."] },
  { name: "Rest on your back", figure: "Rest on your back", how: ["Lie on your back, legs long or knees bent with feet flat.", "Let your arms rest a little away from your body.", "Feel each part of you get heavier, from your feet up to your face."], note: "A rolled towel under your knees takes pressure off your lower back." },
];
const REST_SECONDS = 120;

function RestPose({ pose }: { pose: (typeof POSES)[number] }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const mm = left === null ? "" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <li className="flex flex-col gap-2.5 rounded-2xl border border-line bg-sunk p-3">
      <b className="font-display text-base">{pose.name}</b>
      <MoveStrip name={pose.figure} />
      <ol className="list-decimal pl-5 text-sm">{pose.how.map((h) => <li key={h}>{h}</li>)}</ol>
      {pose.note && <p className="text-[12.5px] text-muted-foreground">{pose.note}</p>}
      {left === null ? (
        <Pill variant="ghost" size="sm" onClick={() => setLeft(REST_SECONDS)}>Rest here for 2 minutes</Pill>
      ) : left > 0 ? (
        <div className="flex items-center gap-3" role="timer" aria-live="off">
          <span className="font-display text-xl font-bold tabular-nums">{mm}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-card"><i className="petal-bar block h-full transition-[width] duration-1000 ease-linear" style={{ width: `${((REST_SECONDS - left) / REST_SECONDS) * 100}%` }} /></div>
          <button type="button" onClick={() => setLeft(null)} className="min-h-11 px-2 text-sm font-bold text-muted-foreground">Stop</button>
        </div>
      ) : (
        <p role="status" className="text-sm font-bold text-sage">Lovely. Take your time coming out of it.</p>
      )}
    </li>
  );
}

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
      <ScreenTitle eyebrow="Relax and Restore" title="Nothing to win here. Just rest." />
      <Card>
        <ul className="flex flex-col gap-2">
          {SESSIONS.map((s, i) => (
            <Row key={s.title}>
              <span className="min-w-0"><b>{s.title}</b><br /><small className="text-[12.5px] text-muted-foreground">{s.sub}</small></span>
              <Pill variant="ghost" size="sm" onClick={() => begin(i)}>Begin</Pill>
            </Row>
          ))}
        </ul>
        <p className="rounded-xl bg-gold-soft px-3 py-2 text-[12.5px] text-muted-foreground">Guided audio goes here. Text is shown for now.</p>
      </Card>

      {session && (
        <Card ref={player}>
          <p className="eyebrow">{session.title}</p>
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

      <Card>
        <h2 className="font-display text-lg font-bold">Rest poses</h2>
        <Muted>Gentle yoga shapes to stay in, not stretch through. Use as many cushions as you like. Stop if anything hurts.</Muted>
        <ul className="flex flex-col gap-3">{POSES.map((p) => <RestPose key={p.name} pose={p} />)}</ul>
      </Card>

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
