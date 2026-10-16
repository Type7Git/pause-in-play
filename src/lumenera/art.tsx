/** Lumenera illustrations. Soft, slow, decorative (aria-hidden): the words carry the meaning. */
import { useEffect, useId, useRef, type CSSProperties } from "react";
import { CONDS, CONTRA, STAGE_SHORT, TOPICS, TOPIC_SHORT, labelOf, type CheckId, type HubId, type Item, type Profile } from "./content";
import type { Tone } from "./engine";

const S = (o: Record<string, string | number>) => o as CSSProperties;
/** useId() can contain characters that break url(#id) references in SVG, so keep it alphanumeric. */
const useSvgId = () => "es" + useId().replace(/[^a-zA-Z0-9]/g, "");

export const Tick = ({ stroke = "var(--btn-ink)" }: { stroke?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
);
export const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const Chevron = ({ dir = "right" }: { dir?: "left" | "right" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} /></svg>
);
export const Info = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--lilac)" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" strokeLinecap="round" /></svg>
);
export const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
);

/* ---------- brand mark and welcome ---------- */
/** The Lumenera flower: swirling petals for flow, an open ring for rhythm. Blooms open, then turns slowly. */
const PETAL = "M60 60 C 40 56, 30 36, 42 20 C 52 8, 72 10, 74 26 C 76 42, 70 54, 60 60 Z";
const INNER = "M60 60 C 52 54, 48 42, 54 35 C 59 30, 67 32, 67 40 C 67 49, 64 55, 60 60 Z";
export function Flower({ size = 96, still = false, className = "" }: { size?: number; still?: boolean; className?: string }) {
  const g = useSvgId();
  return (
    <svg className={`flower ${still ? "still" : ""} ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id={`${g}r`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="var(--rose-ink, #a8486b)" /><stop offset="1" stopColor="var(--rose, #cf6f8d)" stopOpacity=".75" /></linearGradient>
        <linearGradient id={`${g}l`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="var(--lilac-ink, #6f5aa6)" /><stop offset="1" stopColor="var(--lilac, #9d89cc)" stopOpacity=".75" /></linearGradient>
        <linearGradient id={`${g}o`} x1="0" x2="1"><stop offset="0" stopColor="var(--rose, #cf6f8d)" /><stop offset="1" stopColor="var(--lilac, #9d89cc)" /></linearGradient>
      </defs>
      <path className="ribbon" d="M17.8 92 A 53 53 0 1 1 102.2 92" fill="none" stroke={`url(#${g}o)`} strokeWidth="2.6" strokeLinecap="round" />
      <circle className="ribbon-dot" cx="102.2" cy="92" r="3.6" fill="var(--lilac, #9d89cc)" />
      <g className="spin"><g transform="translate(60 60) scale(.86) translate(-60 -60)">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`rotate(${i * 72} 60 60)`}><path className="petal" d={PETAL} fill={`url(#${g}${i % 2 ? "l" : "r"})`} opacity=".9" style={{ animationDelay: `${0.1 + i * 0.12}s` }} /></g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`i${i}`} transform={`rotate(${36 + i * 72} 60 60)`}><path className="petal" d={INNER} fill="#fff" opacity=".55" style={{ animationDelay: `${0.7 + i * 0.08}s` }} /></g>
        ))}
        <circle className="petal" cx="60" cy="60" r="7.5" fill="#f3c58a" style={{ animationDelay: "1.1s" }} />
        <circle cx="57.5" cy="57.5" r="2.4" fill="#fff" opacity=".8" />
      </g></g>
    </svg>
  );
}
/** Static flower for the browser tab icon. */
export const FLOWER_ICON = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="58" fill="#fbf1f3"/>${[0, 1, 2, 3, 4].map((i) => `<path d="${PETAL}" fill="${i % 2 ? "#8a73bf" : "#c25f80"}" opacity=".9" transform="rotate(${i * 72} 60 60)"/>`).join("")}${[0, 1, 2, 3, 4].map((i) => `<path d="${INNER}" fill="#fff" opacity=".5" transform="rotate(${36 + i * 72} 60 60)"/>`).join("")}<circle cx="60" cy="60" r="7.5" fill="#f3c58a"/></svg>`)}`;
const BUB: [number, number, number, number][] = [[8, 26, 9, 0], [22, 40, 12, 3], [38, 18, 8, 6], [55, 34, 11, 1.5], [70, 22, 10, 4.5], [84, 44, 13, 2], [92, 16, 7, 7], [14, 14, 10, 8.5], [46, 28, 14, 9.5], [64, 50, 12, 5.5]];
export const Bubbles = () => (
  <div className="bubbles" aria-hidden="true">
    {BUB.map(([x, d, dur, delay], i) => <span key={i} className={i % 3 === 1 ? "l" : ""} style={{ left: `${x}%`, width: d, height: d, animationDuration: `${dur}s`, animationDelay: `-${delay}s` }} />)}
  </div>
);

/* ---------- personal ring ---------- */
export function Ring({ p, sub, ghost }: { p: number; sub: string; ghost?: number }) {
  const id = useSvgId();
  const C = 2 * Math.PI * 60;
  const ref = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => { el.style.strokeDashoffset = String(C * (1 - p / 100)); }));
    return () => cancelAnimationFrame(r);
  }, [p, C]);
  return (
    <svg className="bigring" viewBox="0 0 150 150" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="var(--rose)" /><stop offset="1" stopColor="var(--lilac)" /></linearGradient></defs>
      <circle cx="75" cy="75" r="60" fill="none" stroke="var(--surface)" strokeWidth="12" />
      {ghost ? <circle cx="75" cy="75" r="60" fill="none" stroke="var(--lilac)" strokeOpacity=".3" strokeWidth="12" strokeDasharray={C} strokeDashoffset={C * (1 - ghost / 100)} transform="rotate(-90 75 75)" strokeLinecap="round" /> : null}
      <circle ref={ref} className="fill" cx="75" cy="75" r="60" fill="none" stroke={`url(#${id})`} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} transform="rotate(-90 75 75)" />
      <text x="75" y="80" textAnchor="middle" fontSize="30">{p}%</text>
      <text x="75" y="102" textAnchor="middle" fontSize="11" style={{ fontFamily: "Figtree, sans-serif", fill: "var(--ink-2)" }}>{sub}</text>
    </svg>
  );
}
export function MeterRing({ p }: { p: number }) {
  const id = useSvgId();
  return (
    <>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <defs><linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="var(--rose)" /><stop offset="1" stopColor="var(--lilac)" /></linearGradient></defs>
        <circle className="track" cx="22" cy="22" r="18" fill="none" strokeWidth="4" />
        <circle className="fill" cx="22" cy="22" r="18" fill="none" stroke={`url(#${id})`} strokeWidth="4" strokeLinecap="round" strokeDasharray="113.1" strokeDashoffset={113.1 * (1 - p / 100)} />
      </svg>
      <b>{p}%</b>
    </>
  );
}

/* ---------- questionnaire art ---------- */
const CLUSTER: [number, number, number][] = [[50, 50, 96], [22, 34, 80], [78, 34, 80], [24, 76, 70], [76, 76, 70], [50, 14, 58], [50, 88, 58]];
export function Cluster({ sel }: { sel: string[] }) {
  if (!sel.length) return <div className="cluster"><div className="empty"><span>Pick any<br />that fit</span></div></div>;
  return (
    <div className="cluster" aria-hidden="true">
      {sel.map((id, i) => {
        const [x, y, d] = CLUSTER[i % CLUSTER.length]!;
        return <div key={id} className={`b ${i % 2 ? "l" : ""}`} style={{ left: `calc(${x}% - ${d / 2}px)`, top: `calc(${y}% - ${d / 2}px)`, width: d, height: d, animationDelay: `0s,${i * 0.4}s` }}>{STAGE_SHORT[id] ?? id}</div>;
      })}
    </div>
  );
}
export const Slots = ({ focus }: { focus: string[] }) => (
  <div className="slots" aria-hidden="true">
    {[0, 1, 2].map((i) => <div key={i + (focus[i] ?? "")} className={`slot ${focus[i] ? "on" : ""}`}><span className="n">{i + 1}</span><span className="t">{focus[i] ? TOPIC_SHORT[focus[i]!] ?? labelOf(TOPICS, focus[i]) : ""}</span></div>)}
  </div>
);
const KIDS: Record<string, [number, string][]> = { none: [], u1: [[28, "l"]], u5: [[38, "l"]], school: [[46, "l"], [40, ""]], teen: [[56, "l"], [52, ""]], adult: [[66, "l"], [62, ""]], skip: [] };
export function Family({ c }: { c: string | undefined }) {
  if (c === "pregnant") return <div className="fam" aria-hidden="true"><i className="belly" style={{ width: 84, height: 84 }} /></div>;
  if (!c) return <div className="fam" aria-hidden="true"><i className="ring" style={{ width: 72, height: 72 }} /></div>;
  return (
    <div className="fam" aria-hidden="true">
      <i style={{ width: 72, height: 72 }} />
      {(KIDS[c] ?? []).map(([s, l], i) => <i key={c + i} className={l} style={{ width: s, height: s, animationDelay: `${0.1 + i * 0.12}s,${i * 0.5}s` }} />)}
    </div>
  );
}
const CYCLE_LBL: Record<string, [string, string]> = { regular: ["28", "day rhythm"], heavy: ["Heavy", "or painful"], irregular: ["Varies", "month to month"], none: ["Paused", "right now"], skip: ["Private", "that's fine"] };
export function Cycle({ p }: { p: string | undefined }) {
  const lbl = (p && CYCLE_LBL[p]) || ["Your", "cycle"];
  return (
    <div className="cycle-wrap" aria-hidden="true">
      <svg className="spin-40" width="150" height="150" viewBox="0 0 150 150">
        {Array.from({ length: 28 }, (_, i) => {
          const ang = (i / 28) * Math.PI * 2 - Math.PI / 2;
          let r = 3.2, fill = "var(--line)", op = 1;
          if (p === "regular" && i < 5) { r = 5.5; fill = "var(--rose)"; }
          if (p === "heavy" && i < 7) { r = 7; fill = "var(--rose)"; }
          if (p === "irregular" && [0, 1, 2, 9, 10, 19, 20, 21, 22].includes(i)) { r = 5; fill = i > 15 ? "var(--lilac)" : "var(--rose)"; }
          if (p === "none") op = 0.35;
          return <circle key={i} cx={75 + Math.cos(ang) * 60} cy={75 + Math.sin(ang) * 60} r={r} fill={fill} opacity={op} />;
        })}
      </svg>
      <div className="lbl"><b>{lbl[0]}</b>{lbl[1]}</div>
    </div>
  );
}
export const Shield = ({ c }: { c: string | undefined }) => (
  <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
    <path className="draw" d="M70 18 L112 34 V70 C112 96 92 114 70 122 C48 114 28 96 28 70 V34 Z" fill="none" stroke="var(--rose)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M70 30 L102 42 V70 C102 90 87 104 70 110 C53 104 38 90 38 70 V42 Z" fill="var(--surface)" opacity=".8" />
    <text x="70" y="76" textAnchor="middle" fontFamily="Figtree, sans-serif" fontSize="12" fontWeight="700" fill="var(--ink-2)">{c ? labelOf(CONTRA, c).split(" (")[0] : "Your choice"}</text>
  </svg>
);
const PTS: [number, number][] = [[60, 46], [150, 30], [236, 52], [100, 110], [196, 112], [270, 104]];
export function Constellation({ conds }: { conds: string[] }) {
  const sel = conds.filter((x) => x !== "none" && x !== "skip");
  if (!sel.length) return (
    <svg viewBox="0 0 320 150" width="100%" height="150" className="const" aria-hidden="true">
      <circle cx="160" cy="75" r="26" fill="var(--surface)" stroke="var(--lilac)" strokeWidth="2" strokeDasharray="4 5" />
      <text x="160" y="79" textAnchor="middle">{conds.length ? (conds.includes("none") ? "None" : "Private") : "Optional"}</text>
    </svg>
  );
  return (
    <svg viewBox="0 0 320 150" width="100%" height="150" className="const" aria-hidden="true">
      {sel.slice(1).map((_, i) => <line key={`l${i}`} x1={PTS[i]![0]} y1={PTS[i]![1]} x2={PTS[i + 1]![0]} y2={PTS[i + 1]![1]} style={{ animationDelay: `${i * 0.15}s` }} />)}
      {sel.map((id, i) => <g key={id}><circle cx={PTS[i]![0]} cy={PTS[i]![1]} r="9" fill={i % 2 ? "var(--lilac)" : "var(--rose)"} style={{ animationDelay: `${i * 0.12}s` }} /><text x={PTS[i]![0]} y={PTS[i]![1] + 26} textAnchor="middle">{labelOf(CONDS, id).split(" ")[0]}</text></g>)}
    </svg>
  );
}
export function Learn({ on }: { on: string[] }) {
  const c = (k: string) => `k ${on.includes(k) ? "on" : ""}`;
  return (
    <div className="learn" aria-hidden="true">
      <div className={c("read")}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round"><path d="M5 6h14M5 11h14M5 16h9" /></svg></div>
      <div className={c("watch")}><svg width="28" height="28" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="var(--rose)" /></svg></div>
      <div className={c("listen")}><svg className="eq" width="28" height="28" viewBox="0 0 24 24"><rect x="4" y="6" width="4" height="14" rx="2" fill="var(--lilac)" /><rect x="10" y="3" width="4" height="17" rx="2" fill="var(--rose)" /><rect x="16" y="8" width="4" height="12" rx="2" fill="var(--lilac)" /></svg></div>
      <div className={c("do")}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg></div>
    </div>
  );
}
const MOUTH: Record<number, string> = { 1: "M44 92 Q65 74 86 92", 2: "M44 90 Q65 80 86 90", 3: "M46 86 Q65 88 84 86", 4: "M44 82 Q65 96 86 82", 5: "M42 80 Q65 104 88 80" };
export function Face({ m }: { m: number }) {
  const bg = m <= 2 ? "var(--lilac-soft)" : m >= 4 ? "var(--rose-soft)" : "var(--surface)";
  return (
    <svg className="face" viewBox="0 0 130 130" aria-hidden="true">
      <circle className="bg" cx="65" cy="65" r="58" fill={bg} stroke={m <= 2 ? "var(--lilac)" : "var(--rose)"} strokeWidth="3" />
      <circle cx="48" cy="56" r="5" fill="var(--ink)" /><circle cx="82" cy="56" r="5" fill="var(--ink)" />
      {m >= 4 ? <><circle cx="38" cy="74" r="7" fill="var(--rose)" opacity=".3" /><circle cx="92" cy="74" r="7" fill="var(--rose)" opacity=".3" /></> : null}
      <path d={MOUTH[m]} fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
export const Pin = ({ label }: { label: string }) => (
  <div className="pin-wrap" aria-hidden="true">
    <span className="ring" /><span className="ring" />
    <svg className="pin" viewBox="0 0 52 70"><path d="M26 2C13 2 3 12 3 25c0 17 23 42 23 42s23-25 23-42C49 12 39 2 26 2z" fill="var(--rose)" /><circle cx="26" cy="25" r="9" fill="var(--surface)" /></svg>
    <span className="state">{label}</span>
  </div>
);
export const Lock = () => (
  <svg className="lock" viewBox="0 0 110 120" aria-hidden="true">
    <g className="shackle"><path d="M32 54V38a23 23 0 0 1 46 0v16" fill="none" stroke="var(--lilac)" strokeWidth="9" strokeLinecap="round" /></g>
    <rect x="18" y="52" width="74" height="60" rx="16" fill="var(--rose)" />
    <circle cx="55" cy="78" r="8" fill="var(--surface)" /><rect x="51" y="80" width="8" height="16" rx="4" fill="var(--surface)" />
  </svg>
);

/* ---------- check icons and the calendar hero ---------- */
export function CheckIcon({ id, size = 26 }: { id: CheckId; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (id === "cervical") return <svg {...p}><path d="M12 3c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10z" /><path d="M10 14a2 2 0 0 0 2 2" /></svg>;
  if (id === "breast") return <svg {...p}><path d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.6-7.5 10-7.5 10z" /></svg>;
  if (id === "skin") return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" /></svg>;
  if (id === "mind") return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" /><path d="M9 9.5h.01M15 9.5h.01" strokeWidth="2.6" /></svg>;
  if (id === "life") return <svg {...p}><path d="M4 18h4v-4h4v-4h4V6h4" /><circle cx="4" cy="18" r="1.4" fill="currentColor" /><circle cx="20" cy="6" r="1.4" fill="currentColor" /></svg>;
  return <svg {...p}><path d="M7.5 7.5l9 9" strokeWidth="3.4" /><g fill="currentColor" stroke="none"><circle cx="5.6" cy="7.8" r="2.4" /><circle cx="7.8" cy="5.6" r="2.4" /><circle cx="16.2" cy="18.4" r="2.4" /><circle cx="18.4" cy="16.2" r="2.4" /></g></svg>;
}
export const ToneGlyph = ({ tone }: { tone: Tone }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {tone === "ok" ? <path d="M5 12l5 5L20 7" /> : tone === "soon" ? <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></> : tone === "overdue" ? <><path d="M12 7v6" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></> : <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>}
  </svg>
);
export function CalendarArt({ tone }: { tone: Tone }) {
  const ring = `var(--${tone === "overdue" ? "over" : tone}-ring)`;
  return (
    <svg viewBox="0 0 320 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className="a-bob2"><circle cx="58" cy="52" r="10" fill="var(--surface)" opacity=".7" /><circle cx="270" cy="160" r="14" fill="var(--surface)" opacity=".6" /></g>
      <g style={{ animation: "es-flip .7s cubic-bezier(.2,.8,.2,1) both", transformOrigin: "160px 50px" }}>
        <rect x="92" y="38" width="136" height="142" rx="22" fill="var(--surface)" />
        <rect x="92" y="38" width="136" height="34" rx="17" fill={ring} />
        <rect x="92" y="56" width="136" height="16" fill={ring} />
        <circle cx="122" cy="38" r="5" fill="var(--surface-2)" /><circle cx="198" cy="38" r="5" fill="var(--surface-2)" />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={114 + (i % 4) * 31} cy={92 + Math.floor(i / 4) * 26} r="5" fill="var(--line)" />)}
        <circle cx="176" cy="118" r="17" fill="none" stroke={ring} strokeWidth="4" className="draw" style={{ animationDelay: ".5s", strokeDasharray: 110, strokeDashoffset: 110 }} />
      </g>
      <circle cx="252" cy="58" r="22" fill={ring} className={tone === "overdue" ? "a-beat" : "a-breathe"} opacity=".9" />
      <g transform="translate(240 46)" style={{ color: "var(--surface)" }}><ToneGlyph tone={tone} /></g>
    </svg>
  );
}

/* ---------- space illustrations: header + visual, one per area of life ---------- */
export function SpaceArt({ id }: { id: HubId }) {
  const g = useSvgId();
  const defs = (
    <defs>
      <linearGradient id={`${g}a`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--rose)" /><stop offset="1" stopColor="var(--lilac)" /></linearGradient>
      <radialGradient id={`${g}b`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></radialGradient>
    </defs>
  );
  const grad = `url(#${g}a)`;
  const shine = `url(#${g}b)`;
  const motes = (
    <g>
      {[[40, 170, 6, 0], [90, 190, 4, 2], [250, 180, 7, 3.5], [290, 200, 5, 1], [200, 196, 4, 5]].map(([x, y, r, d], i) => <circle key={i} className="a-rise" cx={x} cy={y} r={r} fill={i % 2 ? "var(--lilac)" : "var(--rose)"} opacity=".5" style={{ animationDelay: `-${d}s` }} />)}
    </g>
  );
  const box = { viewBox: "0 0 320 200", preserveAspectRatio: "xMidYMid slice", "aria-hidden": true } as const;
  switch (id) {
    case "periods":
      return (
        <svg {...box}>{defs}{motes}
          <circle cx="160" cy="100" r="78" fill="var(--surface)" opacity=".55" />
          <g className="spin-60" style={S({ transformOrigin: "160px 100px" })}>
            {Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2 - Math.PI / 2; const on = i < 5; return <circle key={i} cx={160 + Math.cos(a) * 64} cy={100 + Math.sin(a) * 64} r={on ? 6.5 - i * 0.5 : 3.2} fill={on ? "var(--rose)" : i > 12 && i < 17 ? "var(--lilac)" : "var(--line)"} />; })}
          </g>
          <g className="a-bob"><path d="M160 66c-14 16-22 27-22 39a22 22 0 0 0 44 0c0-12-8-23-22-39z" fill={grad} /><path d="M160 66c-14 16-22 27-22 39a22 22 0 0 0 44 0c0-12-8-23-22-39z" fill={shine} /></g>
        </svg>
      );
    case "contra":
      return (
        <svg {...box}>{defs}{motes}
          <g className="a-orbit" style={S({ transformOrigin: "160px 100px" })}><circle cx="160" cy="24" r="7" fill="var(--lilac)" /><circle cx="236" cy="100" r="5" fill="var(--rose)" /><circle cx="96" cy="150" r="6" fill="var(--lilac)" opacity=".7" /></g>
          <circle cx="160" cy="100" r="76" fill="none" stroke="var(--surface)" strokeWidth="2" strokeDasharray="3 8" opacity=".9" />
          <g className="a-bob">
            <path d="M160 46 L204 62 V98 C204 126 184 144 160 152 C136 144 116 126 116 98 V62 Z" fill="var(--surface)" />
            <path className="draw" d="M160 46 L204 62 V98 C204 126 184 144 160 152 C136 144 116 126 116 98 V62 Z" fill="none" stroke={grad} strokeWidth="4" strokeLinejoin="round" />
            <path className="a-beat" d="M160 124s-20-11.7-20-26.6A11.4 11.4 0 0 1 160 89.7a11.4 11.4 0 0 1 20 7.7c0 14.9-20 26.6-20 26.6z" fill="var(--rose)" />
          </g>
        </svg>
      );
    case "fertility":
      return (
        <svg {...box}>{defs}{motes}
          <path d="M160 190 C160 160 158 140 160 112" stroke="var(--ok-ring)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path className="a-bob2" d="M160 160 C140 156 128 144 126 130 C142 130 156 140 160 160z" fill="var(--ok-ring)" opacity=".75" />
          <g className="a-petal" style={S({ transformOrigin: "160px 96px" })}>
            {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx="160" cy="66" rx="17" ry="30" fill={i % 2 ? "var(--lilac)" : "var(--rose)"} opacity=".8" transform={`rotate(${i * 60} 160 96)`} />)}
          </g>
          <circle cx="160" cy="96" r="18" fill="var(--surface)" /><circle className="a-breathe" cx="160" cy="96" r="10" fill={grad} />
        </svg>
      );
    case "baby":
      return (
        <svg {...box}>{defs}{motes}
          <path d="M60 170 A100 100 0 0 1 260 170" fill="none" stroke="var(--surface)" strokeWidth="14" strokeLinecap="round" opacity=".7" />
          <g className="a-bob"><circle cx="138" cy="108" r="44" fill={grad} /><circle cx="138" cy="108" r="44" fill={shine} /></g>
          <g className="a-bob2"><circle cx="194" cy="128" r="24" fill="var(--lilac)" /><circle cx="194" cy="128" r="24" fill={shine} /></g>
          <path className="a-heart" d="M168 92s-10-5.8-10-13.3A5.7 5.7 0 0 1 168 75a5.7 5.7 0 0 1 10 3.7c0 7.5-10 13.3-10 13.3z" fill="var(--rose)" />
          <path className="a-heart" style={{ animationDelay: "-2s" }} d="M150 70s-7-4-7-9.3A4 4 0 0 1 150 58a4 4 0 0 1 7 2.7c0 5.3-7 9.3-7 9.3z" fill="var(--lilac)" />
        </svg>
      );
    case "meno":
      return (
        <svg {...box}>{defs}{motes}
          <g className="a-arc"><circle cx="160" cy="70" r="30" fill={grad} /><circle cx="160" cy="70" r="30" fill={shine} /></g>
          <g className="a-wave"><path d="M0 140 Q40 120 80 140 T160 140 T240 140 T320 140 T400 140 T480 140 V210 H0z" fill="var(--surface)" opacity=".85" /></g>
          <g className="a-wave" style={{ animationDuration: "14s" }}><path d="M0 160 Q40 146 80 160 T160 160 T240 160 T320 160 T400 160 T480 160 V210 H0z" fill="var(--lilac)" opacity=".35" /></g>
          <g transform="translate(232 40)" className="a-bob2">
            {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="0" cy="-9" rx="6" ry="10" fill="var(--rose)" opacity=".7" transform={`rotate(${r})`} />)}
            <circle r="5" fill="var(--soon-ring)" />
          </g>
        </svg>
      );
    case "body":
      return (
        <svg {...box}>{defs}{motes}
          <path d="M20 168 Q90 140 160 160 T300 150" fill="none" stroke="var(--surface)" strokeWidth="10" strokeLinecap="round" opacity=".8" />
          <g className="a-bob">
            <circle cx="160" cy="58" r="16" fill={grad} />
            <path className="a-line" d="M160 76 C 158 100 156 116 160 136" stroke="var(--rose)" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M160 92 C 136 82 118 66 108 48" stroke="var(--lilac)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M160 92 C 184 82 202 66 212 48" stroke="var(--lilac)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M160 136 C 146 150 136 160 124 166 M160 136 C 174 150 184 160 196 166" stroke="var(--rose)" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
          <circle className="a-breathe" cx="160" cy="100" r="74" fill="none" stroke="var(--surface)" strokeWidth="2" strokeDasharray="3 9" />
        </svg>
      );
    case "meds":
      return (
        <svg {...box}>{defs}{motes}
          <rect x="96" y="40" width="128" height="122" rx="20" fill="var(--surface)" opacity=".8" />
          <line x1="96" y1="100" x2="224" y2="100" stroke="var(--line)" strokeWidth="3" />
          <g className="a-bob"><g transform="rotate(-24 136 76)"><rect x="116" y="66" width="44" height="20" rx="10" fill="var(--rose)" /><rect x="138" y="66" width="22" height="20" rx="10" fill="var(--lilac)" /><rect x="138" y="66" width="10" height="20" fill="var(--lilac)" /></g></g>
          <g className="a-bob2"><circle cx="190" cy="76" r="12" fill={grad} /><circle cx="186" cy="72" r="4" fill="#fff" opacity=".6" /></g>
          <g className="a-bob"><rect x="118" y="116" width="26" height="32" rx="7" fill="var(--lilac)" opacity=".8" /><rect x="114" y="110" width="34" height="9" rx="4" fill="var(--rose)" /></g>
          <g className="a-beat"><circle cx="190" cy="132" r="15" fill="var(--ok-ring)" /><path d="M183 132l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
        </svg>
      );
    case "mind":
      return (
        <svg {...box}>{defs}{motes}
          {[70, 52, 34].map((r, i) => <circle key={r} className="a-breathe" cx="160" cy="100" r={r} fill={i === 2 ? grad : i ? "var(--lilac)" : "var(--surface)"} opacity={i === 2 ? 1 : i ? 0.35 : 0.7} style={{ animationDelay: `${i * 0.5}s` }} />)}
          <circle cx="160" cy="100" r="34" fill={shine} />
        </svg>
      );
  }
}

/* ---------- item art: each format moves differently ---------- */
export function ItemArt({ item }: { item: Pick<Item, "format" | "tool" | "id"> }) {
  const g = useSvgId();
  const box = { viewBox: "0 0 240 140", preserveAspectRatio: "xMidYMid slice", "aria-hidden": true } as const;
  const grad = <defs><linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--rose)" /><stop offset="1" stopColor="var(--lilac)" /></linearGradient></defs>;
  const G = `url(#${g})`;
  const t = item.tool;
  if (t === "breathe") return <svg {...box}>{grad}<circle className="a-breathe" cx="120" cy="70" r="44" fill="var(--surface)" opacity=".7" /><circle className="a-breathe" style={{ animationDelay: ".4s" }} cx="120" cy="70" r="28" fill={G} /></svg>;
  if (t === "cycle") return (
    <svg {...box}>{grad}<g className="spin-60" style={S({ transformOrigin: "120px 70px" })}>{Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return <circle key={i} cx={120 + Math.cos(a) * 44} cy={70 + Math.sin(a) * 44} r="6" fill="var(--line)" className={i < 4 ? "a-tap" : ""} style={{ animationDelay: `${i * 0.4}s` }} />; })}</g><circle cx="120" cy="70" r="18" fill="var(--surface)" /><path d="M120 60c-5 6-8 10-8 14a8 8 0 0 0 16 0c0-4-3-8-8-14z" fill="var(--rose)" /></svg>
  );
  if (t === "week") return <svg {...box}>{grad}<line x1="34" y1="104" x2="206" y2="104" stroke="var(--surface)" strokeWidth="6" strokeLinecap="round" /><rect className="a-grow" x="34" y="101" width="172" height="6" rx="3" fill={G} /><circle className="a-breathe" cx="120" cy="58" r="26" fill={G} opacity=".85" /></svg>;
  if (t === "pelvic") return <svg {...box}>{grad}<circle cx="120" cy="70" r="40" fill="none" stroke="var(--surface)" strokeWidth="10" /><circle cx="120" cy="70" r="40" fill="none" stroke={G} strokeWidth="10" strokeLinecap="round" className="a-line" transform="rotate(-90 120 70)" style={{ strokeDasharray: 252, strokeDashoffset: 252 }} /><circle className="a-breathe" cx="120" cy="70" r="16" fill="var(--rose)" /></svg>;
  if (t === "move") return <svg {...box}>{grad}<path d="M20 110 Q70 40 120 90 T220 60" fill="none" stroke="var(--surface)" strokeWidth="6" strokeLinecap="round" /><path className="a-line" d="M20 110 Q70 40 120 90 T220 60" fill="none" stroke={G} strokeWidth="6" strokeLinecap="round" /><circle className="a-bob" cx="120" cy="56" r="14" fill="var(--rose)" /></svg>;
  if (t === "compare") return <svg {...box}>{grad}{[56, 96, 136, 176].map((x, i) => <rect key={x} className="a-bar" style={{ animationDelay: `${i * 0.2}s`, animationDuration: "2.4s" }} x={x} y={30 + i * 12} width="22" height={90 - i * 12} rx="8" fill={i % 2 ? "var(--lilac)" : "var(--rose)"} />)}</svg>;
  if (item.format === "watch") return <svg {...box}>{grad}<rect x="40" y="22" width="160" height="96" rx="18" fill="var(--surface)" opacity=".75" /><circle className="a-ripple" cx="120" cy="70" r="24" fill="none" stroke="var(--rose)" strokeWidth="2" /><circle cx="120" cy="70" r="24" fill={G} /><path d="M113 58l18 12-18 12z" fill="#fff" /></svg>;
  if (item.format === "listen") return <svg {...box}>{grad}<path d="M72 84v-14a48 48 0 0 1 96 0v14" fill="none" stroke="var(--surface)" strokeWidth="8" strokeLinecap="round" />{[84, 98, 112, 126, 140, 154].map((x, i) => <rect key={x} className="a-bar" style={{ animationDelay: `${(i % 3) * 0.2 + i * 0.05}s` }} x={x} y={i % 2 ? 62 : 52} width="8" height={i % 2 ? 46 : 56} rx="4" fill={i % 2 ? "var(--lilac)" : "var(--rose)"} />)}</svg>;
  return (
    <svg {...box}>{grad}
      <g className="a-bob"><rect x="66" y="16" width="108" height="112" rx="14" fill="var(--surface)" /><path d="M150 16v26l8-6 8 6V16" fill="var(--rose)" /></g>
      {[44, 62, 80, 98].map((y, i) => <line key={y} className="a-line" style={{ animationDelay: `${i * 0.3}s` }} x1="82" y1={y} x2={i === 3 ? 128 : 156} y2={y} stroke={i ? "var(--line)" : G} strokeWidth="6" strokeLinecap="round" />)}
    </svg>
  );
}

/** Small card of the checks the questionnaire has found so far. */
export function CheckCards({ checks }: { checks: { id: string; name: string; tone: Tone; status: string }[] }) {
  if (!checks.length) return null;
  return (
    <div className="cal" aria-hidden="true">
      {checks.slice(0, 2).map((x) => <div className="c" key={x.id}><div className="h">{x.id === "cervical" ? "Cervical" : x.id === "breast" ? "Breast" : "Bones"}</div><div className="bd"><b>{x.name}</b><span className={`pill tone-${x.tone}`}>{x.status}</span></div></div>)}
    </div>
  );
}

export const profileFirstName = (p: Profile) => p.name?.trim() || "";
