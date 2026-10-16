/** One piece of content, with an experience that fits its format: read, watch, listen or try. */
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ItemArt, SpaceArt } from "./art";
import { FORMAT_LABEL, HUBS, type Item } from "./content";
import { plan, rank } from "./engine";
import { useEs } from "./store";
import { NeedsProfile, TopBar } from "./ui";

const spaceName = (it: Item) => (it.space === "checks" ? "Checks" : HUBS[it.space].short);
const tintOf = (it: Item) => (it.space === "checks" ? "rose" : HUBS[it.space].tint);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function ItemPage({ item }: { item: Item }) {
  const { profile, done, ready } = useEs();
  const stage = useRef<HTMLElement>(null);
  const [read, setRead] = useState(0);
  const [helpful, setHelpful] = useState<null | boolean>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const f = () => setRead(Math.min(100, (el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * 100));
    el.addEventListener("scroll", f, { passive: true });
    return () => el.removeEventListener("scroll", f);
  }, [ready, done]);
  useEffect(() => { stage.current?.scrollTo({ top: 0 }); setHelpful(null); }, [item.id]);

  const title = FORMAT_LABEL[item.format];
  if (!ready) return <><TopBar title={title} /><main className="stage" /></>;
  if (!done) return <><TopBar title={title} /><main className="stage"><NeedsProfile /></main></>;
  const pl = plan(profile);
  const ids = pl.spaces.map((s) => s.id);
  const mine = rank(profile, ids, pl.mindFirst, pl.lowMood, item.space).find((x) => x.id === item.id);
  const reasons = mine?.reasons.filter((r) => !r.startsWith("It's part of")).slice(0, 3) ?? [];
  const next = pl.picks.find((x) => x.id !== item.id) ?? rank(profile, ids, pl.mindFirst, pl.lowMood, item.space).find((x) => x.id !== item.id);

  return (
    <>
      <TopBar title={`${title} · ${spaceName(item)}`} back={item.space === "checks" ? "/luma/home" : `/luma/space/${item.space}`} />
      <main className="stage" ref={stage} key={`item-${item.id}`}>
        <div className={`detail tint-${tintOf(item)}`} key={item.id}>
          {item.format === "read" && !item.tool ? <div className="readbar" aria-hidden="true"><i style={{ width: `${read}%` }} /></div> : null}
          {item.format === "watch" ? <Player item={item} /> : item.format === "listen" ? null : item.tool ? null : <div className="dhero"><span className="art-box"><ItemArt item={item} /></span></div>}
          <div className="dtitle" style={{ animationDelay: ".05s" }}>
            <span className="eyebrow" style={{ color: "var(--tint-ink)" }}>{FORMAT_LABEL[item.format]} · {item.mins} min</span>
            <h1 tabIndex={-1}>{item.title}</h1>
            <p>{item.summary}</p>
            <span className="sample">Sample content</span>
          </div>
          {item.format === "listen" ? <Audio item={item} /> : null}
          {item.tool ? <Tool item={item} /> : null}
          {reasons.length ? (
            <div className="panel" style={{ animationDelay: ".08s" }}>
              <h2>Why you're seeing this</h2>
              <div className="chips">{reasons.map((r) => <span key={r} className="chip">{r}</span>)}</div>
            </div>
          ) : null}
          {item.format !== "listen" ? (
            <div className="prose" style={{ animationDelay: ".14s" }}>{item.body.map((t, i) => <p key={i}>{t}</p>)}</div>
          ) : null}
          <div className="helpful" style={{ animationDelay: ".18s" }} aria-live="polite">
            {helpful === null ? (
              <><span>Was this helpful?</span><button type="button" className="soft-btn" onClick={() => setHelpful(true)}>Yes</button><button type="button" className="soft-btn" onClick={() => setHelpful(false)}>Not really</button></>
            ) : <span>{helpful ? "Thank you. We'll show you more like this." : "Thanks for telling us. We'll adjust what you see."}</span>}
          </div>
          {next ? (
            <section style={{ animationDelay: ".22s" }}>
              <div className="sec-h"><h2>Up next for you</h2></div>
              <Link to="/luma/item/$id" params={{ id: next.id }} className={`row tint-${tintOf(next)}`}>
                <span className="art-box"><ItemArt item={next} /></span>
                <span className="tx"><span className="meta">{FORMAT_LABEL[next.format]} · {next.mins} min</span><b>{next.title}</b></span>
              </Link>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}

/* ---------- a faux video: plays through captions so the demo feels alive ---------- */
function usePlayback(steps: number, perStep = 4) {
  const [t, setT] = useState(0);
  const [on, setOn] = useState(false);
  const total = steps * perStep;
  useEffect(() => {
    if (!on) return;
    const h = window.setInterval(() => setT((x) => { if (x + 0.1 >= total) { setOn(false); return total; } return x + 0.1; }), 100);
    return () => clearInterval(h);
  }, [on, total]);
  const toggle = () => { if (t >= total) setT(0); setOn((o) => !o); };
  return { t, on, total, toggle, step: Math.min(steps - 1, Math.floor(t / perStep)) };
}
function Player({ item }: { item: Item }) {
  const pb = usePlayback(item.body.length);
  const shown = item.mins * 60;
  return (
    <div className={`player ${pb.on ? "on" : ""}`}>
      <div className="screen-v">
        <span className="art-box" style={{ position: "absolute", inset: 0 }}><SpaceArt id={item.space === "checks" ? "mind" : item.space} /></span>
        <button type="button" className="playbtn" aria-label={pb.on ? "Pause video" : "Play video"} onClick={pb.toggle}>
          {pb.on ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>}
        </button>
        {pb.t > 0 ? <div className="caption" key={pb.step} aria-live="polite">{item.body[pb.step]}</div> : null}
      </div>
      <div className="prog"><i style={{ width: `${(pb.t / pb.total) * 100}%` }} /></div>
      <div className="ctrl"><span>{mmss((pb.t / pb.total) * shown)} / {mmss(shown)}</span><span>Captions on</span></div>
    </div>
  );
}
function Audio({ item }: { item: Item }) {
  const pb = usePlayback(item.body.length, 5);
  const shown = item.mins * 60;
  return (
    <>
      <div className="audio">
        <svg className={`eq ${pb.on ? "play" : ""}`} width="180" height="70" viewBox="0 0 180 70" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={8 + i * 24} y={i % 2 ? 18 : 6} width="14" height={i % 2 ? 52 : 64} rx="7" fill={i % 2 ? "var(--lilac)" : "var(--rose)"} />)}
        </svg>
        <button type="button" className="big" aria-label={pb.on ? "Pause" : "Play"} onClick={pb.toggle}>
          {pb.on ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z" /></svg>}
        </button>
        <div className="scrub"><i style={{ width: `${(pb.t / pb.total) * 100}%` }} /></div>
        <div className="times"><span>{mmss((pb.t / pb.total) * shown)}</span><span>{mmss(shown)}</span></div>
      </div>
      <div className="prose" aria-label="Transcript">
        <span className="sub" style={{ margin: 0 }}>Transcript</span>
        {item.body.map((t, i) => <p key={i} style={{ opacity: pb.t === 0 || i === pb.step ? 1 : 0.45, transition: "opacity .4s" }}>{t}</p>)}
      </div>
    </>
  );
}

/* ---------- interactive tools ---------- */
function Tool({ item }: { item: Item }) {
  switch (item.tool) {
    case "breathe": return <Breathe />;
    case "cycle": return <CycleLog />;
    case "week": return <Weeks />;
    case "pelvic": return <Squeeze />;
    case "move": return <Move />;
    case "compare": return <Compare />;
    default: return null;
  }
}

function Breathe() {
  const [on, setOn] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("out");
  const [left, setLeft] = useState(60);
  useEffect(() => {
    if (!on) return;
    let p: "in" | "out" = "in";
    setPhase("in");
    let t: number;
    const flip = () => { p = p === "in" ? "out" : "in"; setPhase(p); t = window.setTimeout(flip, p === "in" ? 4000 : 6000); };
    t = window.setTimeout(flip, 4000);
    const tick = window.setInterval(() => setLeft((l) => { if (l <= 1) { setOn(false); return 0; } return l - 1; }), 1000);
    return () => { clearTimeout(t); clearInterval(tick); };
  }, [on]);
  return (
    <div className="tool">
      <h2>{on ? `${left} seconds` : left === 0 ? "That's your minute. Well done." : "One minute, just breathing"}</h2>
      <div className="orb-wrap"><div className={`orb ${on ? phase : ""}`} /><span className="say" aria-live="polite">{on ? (phase === "in" ? "Breathe in" : "And out") : ""}</span></div>
      <p>In for 4, out for 6. Let your shoulders drop.</p>
      <button type="button" className="primary" onClick={() => { if (!on) setLeft(60); setOn((o) => !o); }}>{on ? "Stop" : left === 0 ? "Again" : "Start"}</button>
    </div>
  );
}

function CycleLog() {
  const today = (new Date().getDate() - 1) % 28;
  const [days, setDays] = useState<number[]>([]);
  const t = (i: number) => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
  return (
    <div className="tool">
      <h2>Tap the days you bled</h2>
      <div className="cyc-days" role="group" aria-label="Days of your cycle">
        {Array.from({ length: 28 }, (_, i) => <button key={i} type="button" aria-pressed={days.includes(i)} className={i === today ? "today" : ""} aria-label={`Day ${i + 1}${i === today ? ", today" : ""}`} onClick={() => t(i)}>{i + 1}</button>)}
      </div>
      <p aria-live="polite">{days.length ? `${days.length} day${days.length === 1 ? "" : "s"} logged. Patterns show up after two or three cycles.` : "Ten seconds a day is plenty."} Demo only, nothing is saved.</p>
    </div>
  );
}

function Weeks() {
  const [w, setW] = useState(20);
  const tri = w < 14 ? "First trimester: tiredness and nausea are common, and your first antenatal visits happen now." : w < 28 ? "Second trimester: many people feel more energy, and first movements are often felt between 16 and 22 weeks." : "Third trimester: go to sleep on your side, and get to know your baby's usual pattern of movements.";
  const size = 30 + ((w - 4) / 36) * 100;
  return (
    <div className="tool">
      <div className="grow">
        <div className="seed-box"><div className="seed" style={{ width: size, height: size }} /></div>
        <b>Week {w}</b>
        <label className="sr" htmlFor="es-week">Week of pregnancy</label>
        <input id="es-week" type="range" min={4} max={40} value={w} onChange={(e) => setW(Number(e.target.value))} />
        <p aria-live="polite">{tri}</p>
      </div>
    </div>
  );
}

function Squeeze() {
  const [held, setHeld] = useState(false);
  const [fill, setFill] = useState(0);
  const [reps, setReps] = useState(0);
  const timer = useRef<number | null>(null);
  const start = (e?: PointerEvent) => { e?.preventDefault(); if (reps >= 10) setReps(0); setHeld(true); const t0 = Date.now(); timer.current = window.setInterval(() => setFill(Math.min(1, (Date.now() - t0) / 5000)), 50); };
  const stop = () => {
    if (!held) return;
    if (timer.current) clearInterval(timer.current);
    setHeld(false);
    setFill((f) => { if (f >= 1) setReps((r) => Math.min(10, r + 1)); return 0; });
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const C = 2 * Math.PI * 76;
  return (
    <div className="tool">
      <h2>{reps >= 10 ? "Ten done. Lovely work." : "Press and hold for 5 seconds"}</h2>
      <button type="button" className={`squeeze ${held ? "held" : ""}`} aria-label="Hold to squeeze, release to let go" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !held) start(); }} onKeyUp={stop}>
        <svg viewBox="0 0 170 170" aria-hidden="true"><circle cx="85" cy="85" r="76" fill="none" stroke="var(--surface)" strokeWidth="10" /><circle cx="85" cy="85" r="76" fill="none" stroke="var(--rose)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - fill)} /></svg>
        <span className="core" aria-live="polite">{held ? (fill >= 1 ? "Now let go" : "Squeeze and lift") : "Hold me"}</span>
      </button>
      <div className="reps" aria-label={`${reps} of 10`}>{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < reps ? "on" : ""} />)}</div>
      <p>Squeeze as if stopping wind and a wee at the same time, then fully relax.</p>
    </div>
  );
}

const SESSIONS = [
  { id: "stretch", name: "Gentle stretch", energy: "low", moves: ["Neck rolls", "Cat and cow", "Side reach", "Hamstring stretch", "Slow breaths"] },
  { id: "balance", name: "Balance and steady", energy: "some", moves: ["Heel to toe walk", "Single leg stand", "Sit to stand", "Calf raises", "Slow breaths"] },
  { id: "strength", name: "Strong bones", energy: "plenty", moves: ["Wall push-ups", "Squats to a chair", "Step-ups", "Bent-over rows", "Stretch it out"] },
] as const;
function Move() {
  const [energy, setEnergy] = useState<"low" | "some" | "plenty">("some");
  const [pick, setPick] = useState<string>("balance");
  const [step, setStep] = useState(-1);
  const s = SESSIONS.find((x) => x.id === pick)!;
  useEffect(() => {
    if (step < 0 || step >= s.moves.length) return;
    const t = window.setTimeout(() => setStep((x) => x + 1), 2500);
    return () => clearTimeout(t);
  }, [step, s.moves.length]);
  const running = step >= 0 && step < s.moves.length;
  return (
    <div className="tool">
      <h2>How's your energy today?</h2>
      <div className="energy">{(["low", "some", "plenty"] as const).map((e) => <button key={e} type="button" className="opt" style={{ animation: "none" }} aria-pressed={energy === e} onClick={() => { setEnergy(e); setPick(SESSIONS.find((x) => x.energy === e)!.id); setStep(-1); }}>{e === "low" ? "Low" : e === "some" ? "Some" : "Plenty"}</button>)}</div>
      <div className="sessions">{SESSIONS.map((x) => <button key={x.id} type="button" className={`sess ${x.energy !== energy ? "dim" : ""}`} aria-pressed={pick === x.id} onClick={() => { setPick(x.id); setStep(-1); }}><span className="tx"><b>{x.name}</b><span>10 minutes · {x.moves.slice(0, 3).join(", ")}</span></span></button>)}</div>
      {running ? (
        <div className="grow" aria-live="polite"><div className="seed-box" style={{ height: 110 }}><div className="seed a-breathe" style={{ width: 70, height: 70 }} /></div><b style={{ fontSize: 22 }}>{s.moves[step]}</b><p>Move {step + 1} of {s.moves.length}. Demo pace, a few seconds each.</p></div>
      ) : step >= s.moves.length ? <p aria-live="polite"><b>Done. That counts.</b> Every bit of movement adds up.</p> : null}
      <button type="button" className="primary" onClick={() => setStep(running ? -1 : 0)}>{running ? "Stop" : `Start ${s.name.toLowerCase()}`}</button>
    </div>
  );
}

const OPTIONS = [
  { id: "implant", name: "Implant", works: 99.9, often: "Lasts up to 3 years", sti: false },
  { id: "hiud", name: "Hormonal IUD", works: 99.8, often: "Lasts 5 years or more", sti: false },
  { id: "ciud", name: "Copper IUD", works: 99.2, often: "Lasts 5 to 10 years", sti: false },
  { id: "pill", name: "The pill", works: 93, often: "Every day", sti: false },
  { id: "condoms", name: "Condoms", works: 88, often: "Every time", sti: true },
] as const;
function Compare() {
  const [on, setOn] = useState<string>("implant");
  const o = OPTIONS.find((x) => x.id === on)!;
  return (
    <div className="tool">
      <h2>Tap an option to compare</h2>
      <div className="energy">{OPTIONS.map((x) => <button key={x.id} type="button" className="opt" style={{ animation: "none" }} aria-pressed={on === x.id} onClick={() => setOn(x.id)}>{x.name}</button>)}</div>
      <div className="bars" aria-live="polite">
        <div className="r"><b>How well it works, in real life</b><div className="t"><i style={{ width: `${(o.works - 80) * 5}%` }} /></div><span>About {o.works}% effective with typical use</span></div>
        <div className="r"><b>How often you think about it</b><span>{o.often}</span></div>
        <div className="r"><b>Protects against STIs</b><span>{o.sti ? "Yes" : "No. Use condoms too if that matters for you"}</span></div>
      </div>
    </div>
  );
}
