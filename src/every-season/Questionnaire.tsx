/** The Every Season welcome: one question per screen, each with a small live illustration. */
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bubbles, CheckCards, Chevron, Cluster, Constellation, Cycle, Face, Family, Info, Learn, Lock, LockIcon, Mark, Pin, Ring, Shield, Slots, Tick } from "./art";
import { ALCOHOL, CHILDREN, CONDS, CONTRA, DAYS, FAMILY, IDENTITY, LANG, LEARN, MOODS, MOVE, PERIODS, SCREEN_BANDS, SLEEP, SMOKE, STAGES, SUPPORT, TOPICS, labelOf, type Opt, type Profile } from "./content";
import { YEAR_NOW, ageOf, answered, checksFor, contraRelevant, periodsRelevant, personal, placeOf, plan } from "./engine";
import { es, useEs } from "./store";
import { Meter, usePersona } from "./ui";

type Field = keyof Profile;
type Screen = {
  id: string; section: string; kind: "welcome" | "name" | "year" | "multi" | "single" | "mood" | "checks" | "postcode" | "deeper" | "habits" | "consent" | "build" | "summary";
  title?: string; why?: string; field?: Field; list?: Opt[]; max?: number; ordered?: boolean; exclusive?: string[];
  art?: "cluster" | "slots" | "family" | "cycle" | "shield" | "constellation" | "learn"; deep?: boolean; hidden?: boolean; when?: (p: Profile) => boolean;
};
const SCREENS: Screen[] = [
  { id: "welcome", section: "Welcome", kind: "welcome" },
  { id: "name", section: "About you", kind: "name", title: "First, what should we call you?", why: "So the app speaks to you, not at you." },
  { id: "year", section: "About you", kind: "year", title: "What year were you born?", why: "Some checks and information depend on age." },
  { id: "stages", section: "Right now", kind: "multi", field: "stages", list: STAGES, title: "What's going on for you right now?", why: "Pick any that fit, so we start in the right place.", art: "cluster", exclusive: ["unsure"] },
  { id: "focus", section: "Right now", kind: "multi", field: "focus", list: TOPICS, max: 3, ordered: true, title: "What would you most like help with?", why: "Choose up to three, in order. They'll lead your home screen.", art: "slots" },
  { id: "children", section: "Right now", kind: "single", field: "children", list: CHILDREN, title: "Do you have children?", why: "Some information is only useful at certain stages.", art: "family" },
  { id: "periods", section: "Your body", kind: "single", field: "periods", list: PERIODS, title: "How are your periods at the moment?", why: "Heavy or painful periods are common, and there's real help for them.", art: "cycle", when: periodsRelevant },
  { id: "contra", section: "Your body", kind: "single", field: "contra", list: CONTRA, title: "What contraception do you use, if any?", why: "So information fits what you actually use.", art: "shield", when: contraRelevant },
  { id: "conds", section: "Your body", kind: "multi", field: "conds", list: CONDS, title: "Is there anything you live with?", why: "So we don't show you things that don't apply.", art: "constellation", exclusive: ["none", "skip"] },
  { id: "mood", section: "Your mind", kind: "mood", title: "How have you been feeling lately?", why: "We care how you're going, not just your body." },
  { id: "checks", section: "Checks", kind: "checks", title: "When did you last have these checks?", why: "We'll remind you when they're due. Nothing more.", when: (p) => (ageOf(p) ?? 0) >= 25 },
  { id: "postcode", section: "Where and how", kind: "postcode", title: "What's your postcode?", why: "To show services and clinics near you." },
  { id: "learn", section: "Where and how", kind: "multi", field: "learn", list: LEARN, title: "How do you like to take things in?", why: "Pick any. We'll lean that way.", art: "learn" },
  { id: "deeper", section: "Going deeper", kind: "deeper" },
  { id: "family", section: "Going deeper", kind: "multi", field: "family", list: FAMILY, deep: true, title: "Any of these in your close family?", why: "Family history can change when some checks start.", exclusive: ["none", "unsure"] },
  { id: "sleep", section: "Going deeper", kind: "single", field: "sleep", list: SLEEP, deep: true, title: "How's your sleep?", why: "Sleep touches everything, and what helps depends on why it's broken." },
  { id: "move", section: "Going deeper", kind: "single", field: "move", list: MOVE, deep: true, title: "How often do you get to move your body?", why: "So suggestions start where you are, not where an app thinks you should be." },
  { id: "identity", section: "Going deeper", kind: "single", field: "identity", list: IDENTITY, deep: true, title: "Are you Aboriginal or Torres Strait Islander?", why: "Some checks start earlier and some services are made for you. Optional, always." },
  { id: "lang", section: "Going deeper", kind: "single", field: "lang", list: LANG, deep: true, title: "What language do you speak at home?", why: "We'll offer translated resources where we have them." },
  { id: "support", section: "Going deeper", kind: "multi", field: "support", list: SUPPORT, deep: true, title: "Who's in your corner?", why: "So we can suggest ways to share the load." },
  { id: "days", section: "Going deeper", kind: "multi", field: "days", list: DAYS, deep: true, title: "What fills your days?", why: "So tips fit around real life, like shift work or caring." },
  { id: "habits", section: "Going deeper", kind: "habits", deep: true, title: "Alcohol and smoking", why: "No judgement. They change some advice, like bone and heart health." },
  { id: "consent", section: "Privacy", kind: "consent", title: "You're in charge of your information", why: "Change any of these at any time in Settings." },
  { id: "build", section: "Building", kind: "build" },
  { id: "summary", section: "Something's changed", kind: "summary", hidden: true },
];
const DEEP_COUNT = SCREENS.filter((s) => s.deep).length;
const at = (id: string) => SCREENS.findIndex((s) => s.id === id);

export function Questionnaire({ mode }: { mode: "changed" | "build" | undefined }) {
  const navigate = useNavigate();
  const pickPersona = usePersona();
  const { profile: a } = useEs();
  const [idx, setIdx] = useState(() => (mode === "build" ? at("build") : mode === "changed" ? at("summary") : 0));
  const [history, setHistory] = useState<number[]>(() => (mode === "changed" ? [-1] : []));
  const [returnTo, setReturnTo] = useState<number | null>(null);
  const [deeperChain, setDeeperChain] = useState(false);
  const [dir, setDir] = useState(1);
  const [still, setStill] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const s = SCREENS[idx]!;

  useEffect(() => { if (mode === "changed") es.snapshot(); }, [mode]);
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
    if (s.kind !== "welcome") stageRef.current?.querySelector("h1")?.focus({ preventScroll: true });
  }, [idx, s.kind]);

  const visible = (x: Screen, p: Profile = a) => !x.hidden && (!x.deep || p.deeper === true) && (!x.when || x.when(p));
  const go = (to: number, d = 1) => { setDir(d); setStill(false); setIdx(to); };
  const push = () => setHistory((h) => [...h, idx]);
  const next = (p: Profile = a) => {
    if (deeperChain && s.deep) {
      for (let i = idx + 1; i < SCREENS.length; i++) if (SCREENS[i]!.deep && visible(SCREENS[i]!, p)) { push(); go(i); return; }
      setDeeperChain(false);
    }
    if (returnTo !== null && s.kind !== "deeper") { const r = returnTo; setReturnTo(null); push(); go(r); return; }
    for (let i = idx + 1; i < SCREENS.length; i++) if (visible(SCREENS[i]!, p)) { push(); go(i); return; }
  };
  const back = () => {
    const h = [...history];
    const prev = h.pop();
    if (prev === undefined) return;
    setHistory(h);
    setReturnTo(null);
    if (prev === -1) { void navigate({ to: "/every-season/home" }); return; }
    go(prev, -1);
  };
  const set = (p: Partial<Profile>) => { setStill(true); es.patch(p); };

  // Build animation, then the home.
  const [built, setBuilt] = useState(0);
  useEffect(() => {
    if (s.kind !== "build") return;
    setBuilt(0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = reduced ? 150 : 650;
    const timers = [1, 2, 3].map((n) => window.setTimeout(() => setBuilt(n), t * n));
    timers.push(window.setTimeout(() => { es.finish(); void navigate({ to: "/every-season/home", replace: true }); }, t * 4 + (reduced ? 0 : 400)));
    return () => timers.forEach(clearTimeout);
  }, [s.kind, navigate]);

  const flow = SCREENS.filter((x) => visible(x) && x.kind !== "build");
  const progress = s.kind === "build" ? 100 : Math.round((Math.max(0, flow.indexOf(s)) / Math.max(1, flow.length - 1)) * 100);

  let body: ReactNode = null;
  let foot: ReactNode = null;
  const deepRing = () => <Ring p={personal(a)} sub={`${SCREENS.filter((x) => x.deep && answered(a, x.id)).length} of ${DEEP_COUNT}`} />;

  switch (s.kind) {
    case "welcome":
      body = (
        <>
          <div className="art welcome-art"><Bubbles /><div className="logo"><Mark /><span className="name">Every Season</span><span className="tag">Women's health, for every stage of life</span></div></div>
          <div className="qhead"><h1 tabIndex={-1}>Let's make this yours.</h1><p className="why" style={{ fontSize: 15 }}>A few questions, about 3 minutes. Your answers shape what you see, and you can change them any time.</p></div>
          <p className="why"><LockIcon /><span>Private by default. Stored in Australia, never sold.</span></p>
        </>
      );
      foot = <><Cont onClick={next} label="Start" /><button type="button" className="ghost" onClick={() => pickPersona("sam")}>Show me an example instead</button></>;
      break;
    case "name": {
      const n = (a.name ?? "").trim();
      body = (
        <>
          <div className="art lilac"><div className="greet"><div className="hi">Hi, {n || <span style={{ color: "var(--muted)" }}>there</span>}<span className="caret" /></div><div className="pr">{a.pronouns && a.pronouns !== "skip" ? a.pronouns : ""}</div><div className="rule" style={{ width: `${n ? Math.min(90, 30 + n.length * 6) : 30}%` }} /></div></div>
          <Head s={s} />
          <label className="field" htmlFor="es-name">Your first name or a nickname<input id="es-name" type="text" autoComplete="given-name" maxLength={30} value={a.name ?? ""} placeholder="e.g. Sam" onChange={(e) => set({ name: e.target.value.replace(/\s+/g, " ").trimStart() })} onKeyDown={(e) => { if (e.key === "Enter" && n) next(); }} /></label>
          <p className="sub">Pronouns (optional)</p>
          <Seg a={a} set={set} field="pronouns" list={["she/her", "they/them", "she/they", "skip"].map((id) => ({ id, label: id === "skip" ? "Prefer not to say" : id }))} />
        </>
      );
      foot = <><Cont onClick={next} disabled={!n} /><Skip onClick={next} /></>;
      break;
    }
    case "year": {
      const A = ageOf(a);
      const pct = A ? Math.min(100, Math.max(0, ((A - 12) / 70) * 100)) : 30;
      const marks: [string, number][] = [["Teens", 15], ["20s", 25], ["30s", 35], ["40s", 45], ["50s", 55], ["60s", 65], ["70s+", 75]];
      const setYear = (y: number) => set({ year: Math.min(YEAR_NOW - 16, Math.max(1936, y)) });
      body = (
        <>
          <div className="art"><div className="life" aria-hidden="true"><div className="line" />{marks.map(([l, v]) => <span key={l} className="tickl" style={{ left: `${((v - 12) / 70) * 100}%` }}>{l}</span>)}<div className="dot" style={{ left: `${pct}%` }} /><div className="you" style={{ left: `${pct}%` }}>{A ? `You're ${A}` : "Slide below"}</div></div></div>
          <Head s={s} />
          <div className="year-pick">
            <div className="year-num"><button type="button" className="iconbtn" aria-label="One year earlier" onClick={() => setYear((a.year ?? 1985) - 1)}>&minus;</button><b className={a.year ? "" : "empty"}>{a.year ?? "Choose"}</b><button type="button" className="iconbtn" aria-label="One year later" onClick={() => setYear((a.year ?? 1985) + 1)}>+</button></div>
            <label className="sr" htmlFor="es-year">Year of birth</label>
            <input id="es-year" type="range" min={1936} max={YEAR_NOW - 16} step={1} value={a.year ?? 1985} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
        </>
      );
      foot = <Cont onClick={next} disabled={!a.year} />;
      break;
    }
    case "multi":
    case "single": {
      const f = s.field!;
      const v = a[f] as string | string[] | undefined;
      const arr = Array.isArray(v) ? v : [];
      const isOn = (id: string) => (s.kind === "multi" ? arr.includes(id) : v === id);
      const toggle = (id: string) => {
        if (s.kind === "single") return set({ [f]: v === id ? undefined : id });
        let n = [...arr];
        if (n.includes(id)) n = n.filter((x) => x !== id);
        else if (s.exclusive?.includes(id)) n = [id];
        else { n = n.filter((x) => !s.exclusive?.includes(x)); if (s.max && n.length >= s.max) n = n.slice(1); n.push(id); }
        set({ [f]: n });
      };
      const art = s.deep ? deepRing() : s.art === "cluster" ? <Cluster sel={a.stages ?? []} /> : s.art === "slots" ? <Slots focus={a.focus ?? []} /> : s.art === "family" ? <Family c={a.children} /> : s.art === "cycle" ? <Cycle p={a.periods} /> : s.art === "shield" ? <Shield c={a.contra} /> : s.art === "constellation" ? <Constellation conds={a.conds ?? []} /> : s.art === "learn" ? <Learn on={a.learn ?? []} /> : null;
      const lilac = s.deep || s.art === "learn" || s.art === "constellation";
      body = (
        <>
          {art ? <div className={`art${lilac ? " lilac" : ""}`}>{art}</div> : null}
          <Head s={s} />
          <div className={s.list!.length <= 6 || s.kind === "single" ? "opts list" : "opts"} role="group" aria-label={s.title}>
            {s.list!.map((o, i) => <OptBtn key={o.id} o={o} i={i} on={isOn(o.id)} onClick={() => toggle(o.id)} suffix={s.ordered && isOn(o.id) ? <span className="num">#{arr.indexOf(o.id) + 1}</span> : undefined} />)}
          </div>
          {s.ordered ? <p className="why" style={{ marginTop: -6 }}><span>{arr.length}/3 chosen. Tap again to remove.</span></p> : null}
          {s.id === "support" && arr.includes("alone") ? <div className="note"><b>You don't have to do this alone.</b>PeriPals lets you invite one trusted person to share the load, at your pace.</div> : null}
          {s.id === "identity" && ["ab", "ts", "both"].includes(String(v)) ? <div className="note"><b>Thank you for telling us.</b>We'll show health checks you can have earlier, and services run by and for Aboriginal and Torres Strait Islander women.</div> : null}
        </>
      );
      foot = <><Cont onClick={next} disabled={s.kind === "multi" ? !arr.length : !v} /><Skip onClick={next} label={s.deep ? "Skip this one" : "Skip for now"} /></>;
      break;
    }
    case "mood": {
      const m = a.mood ?? 0;
      body = (
        <>
          <div className={`art${m && m <= 2 ? " lilac" : ""}`}><Face m={m || 3} /></div>
          <Head s={s} />
          <div className="opts" role="group" aria-label="How you've been feeling">{MOODS.map((label, i) => <OptBtn key={label} o={{ id: String(i + 1), label }} i={i} on={m === i + 1} onClick={() => set({ mood: i + 1 })} />)}</div>
          {m && m <= 2 ? <div className="support"><b>Thank you for being honest. That sounds hard.</b>We'll keep gentle support close by. If you need someone now, Lifeline is there 24/7 on 13 11 14, and your GP can help too.</div> : null}
        </>
      );
      foot = <><Cont onClick={next} disabled={!m} /><Skip onClick={next} label="Prefer not to say" /></>;
      break;
    }
    case "checks": {
      const A = ageOf(a) ?? 0;
      body = (
        <>
          <div className="art"><CheckCards checks={checksFor(a)} /></div>
          <Head s={s} />
          {A <= 74 ? <><p className="sub">Cervical screening</p><Seg a={a} set={set} field="cervical" list={SCREEN_BANDS} /></> : null}
          {A >= 40 ? <><p className="sub">Mammogram (breast screen)</p><Seg a={a} set={set} field="mammo" list={SCREEN_BANDS} offset={5} /></> : null}
        </>
      );
      foot = <><Cont onClick={next} disabled={!(a.cervical || a.mammo)} /><Skip onClick={next} label="Not sure, skip" /></>;
      break;
    }
    case "postcode": {
      const st = placeOf(a.postcode);
      body = (
        <>
          <div className="art"><Pin label={st ? st.area : "Somewhere in Australia"} /></div>
          <Head s={s} />
          <label className="field" htmlFor="es-pc">Postcode<input id="es-pc" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="postal-code" value={a.postcode ?? ""} placeholder="e.g. 7000" onChange={(e) => set({ postcode: e.target.value.replace(/\D/g, "").slice(0, 4) })} onKeyDown={(e) => { if (e.key === "Enter" && st) next(); }} /></label>
          {st?.tas ? <div className="note"><b>Women's health clinics in Hobart and Launceston</b>You'll see local services and booking links throughout the app.</div> : null}
        </>
      );
      foot = <><Cont onClick={next} disabled={!st} /><Skip onClick={next} /></>;
      break;
    }
    case "deeper":
      body = (
        <>
          <div className="art lilac"><Ring p={personal(a)} sub="personalised" ghost={100} /></div>
          <div className="qhead"><h1 tabIndex={-1}>Want it even more personal?</h1><p className="why" style={{ fontSize: 15 }}>{DEEP_COUNT} more questions, about 2 minutes. Things like family history, sleep and who's in your corner. Every one is optional, and you can answer them later instead.</p></div>
        </>
      );
      foot = <><button type="button" className="primary" onClick={() => { es.patch({ deeper: true }); next({ ...a, deeper: true }); }}>Yes, go deeper</button><button type="button" className="ghost" onClick={() => { es.patch({ deeper: false }); next({ ...a, deeper: false }); }}>Not now, I'll do it later</button></>;
      break;
    case "habits":
      body = (
        <>
          <div className="art lilac">{deepRing()}</div>
          <Head s={s} />
          <p className="sub">Alcohol</p><Seg a={a} set={set} field="alcohol" list={ALCOHOL} />
          <p className="sub">Smoking or vaping</p><Seg a={a} set={set} field="smoke" list={SMOKE} offset={3} />
        </>
      );
      foot = <><Cont onClick={next} disabled={!(a.alcohol || a.smoke)} /><Skip onClick={next} label="Skip this one" /></>;
      break;
    case "consent": {
      const T: [keyof Profile["consent"], string, string][] = [["tailor", "Use my answers to shape the app", "This is what builds your home screen."], ["clinic", "Let me share a summary with my clinic", "Only ever when you choose to send it."], ["research", "Help women's health research", "De-identified. You can opt out any time."], ["remind", "Gentle reminders", "Checks that are due, and nothing pushy."]];
      body = (
        <>
          <div className="art lilac"><Lock /></div>
          <Head s={s} />
          <div className="consent">{T.map(([k, t, d], i) => (
            <button key={k} type="button" className="toggle" role="switch" aria-checked={a.consent[k]} style={{ animationDelay: `${0.05 + i * 0.05}s` }} onClick={() => set({ consent: { ...a.consent, [k]: !a.consent[k] } })}>
              <span className="tx"><b>{t}</b><span>{d}</span></span><span className="sw" aria-hidden="true" />
            </button>
          ))}</div>
          <p className="why"><LockIcon /><span>Stored in Australia. Never sold. See, download or delete everything from Settings.</span></p>
        </>
      );
      foot = <Cont onClick={next} label="Build my space" />;
      break;
    }
    case "build": {
      const pl = plan(a);
      const sats = [...pl.spaces.map((x) => ({ periods: "Periods", contra: "Sexual health", fertility: "Fertility", baby: "After baby", meno: "Menopause" })[x.id]), "Checks", "Mind"].slice(0, 5);
      body = (
        <div className="build">
          <div className="orbit" aria-hidden="true"><div className="core" />{sats.map((t, i) => <div key={t} className="sat" style={{ ["--a" as string]: `${i * (360 / sats.length)}deg`, animationDelay: `${i * 0.08}s` }}>{t}</div>)}</div>
          <h1 tabIndex={-1}>Building your space{a.name ? `, ${a.name}` : ""}</h1>
          <div className="steps">{["Choosing your focus", "Checking what's due", "Picking something for today"].map((t, i) => <div key={t} className={built > i ? "done" : ""}><span className="tick"><Tick /></span>{t}</div>)}</div>
        </div>
      );
      break;
    }
    case "summary": {
      const rows = SCREENS.filter((x) => visible(x) && x.title && x.kind !== "consent");
      body = (
        <>
          <div className="qhead"><h1 tabIndex={-1}>Something's changed?</h1><p className="why" style={{ fontSize: 15 }}>Life moves. Tap anything to update it, then rebuild your space.</p></div>
          <div className="summary">{rows.map((x, i) => (
            <button key={x.id} type="button" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => { setReturnTo(at("summary")); push(); go(at(x.id)); }}>
              <span><b>{x.title}</b><em>{valueText(x, a)}</em></span><small>Change</small>
            </button>
          ))}</div>
          {a.deeper !== true ? <button type="button" className="persona" onClick={() => { es.patch({ deeper: true }); setReturnTo(at("summary")); setDeeperChain(true); push(); go(at("family")); }}><i className="l" /><span>Answer the deeper questions<small>{DEEP_COUNT} optional questions, about 2 minutes</small></span></button> : null}
        </>
      );
      foot = <button type="button" className="primary" onClick={() => { setHistory([]); go(at("build")); }}>Rebuild my space</button>;
      break;
    }
  }

  const canBack = history.length > 0 && s.kind !== "build";
  return (
    <>
      <header className="top">
        {canBack ? <button type="button" className="iconbtn" aria-label="Back" onClick={back}><Chevron dir="left" /></button> : <span className="iconbtn hide" />}
        <div className="where"><small>{s.section}</small><div className="bar" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div></div>
        <Meter />
      </header>
      <main className="stage" ref={stageRef} aria-live="polite" key="welcome">
        <section key={idx} className={`screen ${still ? "still" : `enter ${dir < 0 ? "back" : ""}`}`}>{body}</section>
      </main>
      {foot ? <footer className="actions">{foot}</footer> : null}
    </>
  );
}

function Cont({ label = "Continue", disabled = false, onClick }: { label?: string; disabled?: boolean; onClick: () => void }) {
  return <button type="button" className="primary" disabled={disabled} onClick={() => onClick()}>{label}</button>;
}
function Skip({ label = "Skip for now", onClick }: { label?: string; onClick: () => void }) {
  return <button type="button" className="ghost" onClick={() => onClick()}>{label}</button>;
}
function Head({ s }: { s: Screen }) {
  return <div className="qhead"><h1 tabIndex={-1}>{s.title}</h1>{s.why ? <p className="why"><Info /><span><b>Why we ask:</b> {s.why}</span></p> : null}</div>;
}
function OptBtn({ o, on, i, onClick, suffix }: { o: Opt; on: boolean; i: number; onClick: () => void; suffix?: ReactNode }) {
  return (
    <button type="button" className="opt" aria-pressed={on} style={{ animationDelay: `${0.05 + i * 0.035}s` }} onClick={onClick}>
      <span className="tick"><Tick /></span><span>{o.label}</span>{suffix}
    </button>
  );
}
type SegField = "cervical" | "mammo" | "alcohol" | "smoke" | "pronouns";
function Seg({ field, list, offset = 0, a, set }: { field: SegField; list: Opt[]; offset?: number; a: Profile; set: (p: Partial<Profile>) => void }) {
  return <div className="seg" role="group">{list.map((o, i) => <OptBtn key={o.id} o={o} i={i + offset} on={a[field] === o.id} onClick={() => set({ [field]: a[field] === o.id ? undefined : o.id })} />)}</div>;
}

function valueText(x: Screen, a: Profile): string {
  if (x.kind === "name") return a.name || "Not set";
  if (x.kind === "year") return a.year ? `${a.year} (age ${ageOf(a)})` : "Not set";
  if (x.kind === "mood") return a.mood ? MOODS[a.mood - 1]! : "Skipped";
  if (x.kind === "checks") return [a.cervical && `Cervical: ${labelOf(SCREEN_BANDS, a.cervical).toLowerCase()}`, a.mammo && `Mammogram: ${labelOf(SCREEN_BANDS, a.mammo).toLowerCase()}`].filter(Boolean).join(" · ") || "Skipped";
  if (x.kind === "postcode") return a.postcode || "Skipped";
  if (x.kind === "habits") return [a.alcohol && `Alcohol: ${labelOf(ALCOHOL, a.alcohol).toLowerCase()}`, a.smoke && `Smoking: ${labelOf(SMOKE, a.smoke).toLowerCase()}`].filter(Boolean).join(" · ") || "Skipped";
  const v = x.field ? a[x.field] : undefined;
  if (Array.isArray(v)) return v.length ? v.map((id) => labelOf(x.list!, id)).join(", ") : "Skipped";
  return typeof v === "string" && v ? labelOf(x.list!, v) : "Skipped";
}
