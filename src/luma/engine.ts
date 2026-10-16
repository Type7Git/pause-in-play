/** Luma tailoring: plain rules then ranking, so every card can say why it's there. */
import { CHECK_INFO, CONDS, CONTRA, LEARN, LIBRARY, PERIODS, SPACES, STAGES, TOPICS, CHILDREN, labelOf, type CheckId, type Item, type Profile, type SpaceId } from "./content";

export const YEAR_NOW = new Date().getFullYear();
export const ageOf = (p: Profile) => (p.year ? YEAR_NOW - p.year : null);
export const has = (p: Profile, k: "stages" | "focus" | "conds" | "family" | "learn" | "support" | "days", v: string) => (p[k] ?? []).includes(v);
export const periodsRelevant = (p: Profile) => !has(p, "stages", "post") && !has(p, "stages", "pregnant") && (ageOf(p) ?? 30) < 58;
export const contraRelevant = (p: Profile) => (ageOf(p) ?? 30) < 55 && !has(p, "stages", "post") && !has(p, "stages", "pregnant") && !has(p, "stages", "trying");

/** Postcode → state and (in Tasmania) the nearest city area. */
export function placeOf(pc: string | undefined) {
  if (!/^\d{4}$/.test(pc ?? "")) return null;
  const n = Number(pc);
  const ranges: [number, number, string, string][] = [[800, 899, "Northern Territory", "NT"], [2600, 2618, "ACT", "ACT"], [2900, 2920, "ACT", "ACT"], [2000, 2999, "New South Wales", "NSW"], [3000, 3999, "Victoria", "Victoria"], [4000, 4999, "Queensland", "Queensland"], [5000, 5799, "South Australia", "SA"], [6000, 6797, "Western Australia", "WA"], [7000, 7799, "Tasmania", "Tasmania"]];
  const hit = ranges.find(([lo, hi]) => n >= lo && n <= hi);
  if (!hit) return null;
  const tas = hit[2] === "Tasmania";
  const city = tas ? (n < 7100 ? "Hobart" : n >= 7248 && n <= 7260 ? "Launceston" : null) : null;
  return { state: hit[2], short: hit[3], tas, city, area: city ? `${city} area, Tasmania` : hit[2] };
}

/* ---------- checks: green up to date, orange due soon, soft red overdue ---------- */
export type Tone = "ok" | "soon" | "overdue" | "info";
export type Check = { id: CheckId; name: string; tone: Tone; status: string; detail: string };

export function checksFor(p: Profile): Check[] {
  const A = ageOf(p);
  if (A === null) return [];
  const out: Check[] = [];
  const C = CHECK_INFO;
  if (A < 25) out.push({ id: "cervical", name: C.cervical.name, tone: "info", status: "From age 25", detail: "Your first screen is due at 25." });
  else if (A <= 74) {
    const v = p.cervical;
    if (v === "recent") out.push({ id: "cervical", name: C.cervical.name, tone: "ok", status: "Up to date", detail: "Your last screen was in the last 2 years. Next one is a few years away." });
    else if (v === "mid") out.push({ id: "cervical", name: C.cervical.name, tone: "soon", status: "Due soon", detail: "Your last screen was 2 to 5 years ago, so your next is coming up." });
    else if (v === "old" || v === "never") out.push({ id: "cervical", name: C.cervical.name, tone: "overdue", status: "Overdue", detail: v === "never" ? "You haven't had one yet. It's quick, and you can collect the sample yourself." : "Your last screen was more than 5 years ago." });
    else out.push({ id: "cervical", name: C.cervical.name, tone: "soon", status: "Check your date", detail: "Not sure when you last had one? Your GP can look it up." });
  }
  if (A >= 50 && A <= 74) {
    const v = p.mammo;
    if (v === "recent") out.push({ id: "breast", name: C.breast.name, tone: "ok", status: "Up to date", detail: "Your last mammogram was in the last 2 years." });
    else if (v === "mid" || v === "old" || v === "never") out.push({ id: "breast", name: C.breast.name, tone: "overdue", status: "Overdue", detail: v === "never" ? "You haven't had one yet. It's free every 2 years from 50." : "It's been more than 2 years since your last mammogram." });
    else out.push({ id: "breast", name: C.breast.name, tone: "soon", status: "Check your date", detail: "Free every 2 years from 50. BreastScreen can tell you when you last went." });
  } else if (A >= 40 && A < 50) {
    out.push(has(p, "family", "breast")
      ? { id: "breast", name: C.breast.name, tone: "soon", status: "Talk to your GP", detail: "With family history, your GP may suggest starting screening earlier." }
      : { id: "breast", name: C.breast.name, tone: "info", status: "Optional from 40", detail: "Free from 40 if you'd like one. Invitations start at 50." });
  } else if (A > 74) out.push({ id: "breast", name: C.breast.name, tone: "info", status: "Your choice", detail: "You can still book a free mammogram every 2 years." });
  if ((has(p, "stages", "post") && A >= 50) || has(p, "family", "bones")) out.push({ id: "bones", name: C.bones.name, tone: has(p, "family", "bones") ? "soon" : "info", status: "Ask your GP", detail: has(p, "family", "bones") ? "Because osteoporosis runs in your family." : "Worth a conversation after menopause." });
  return out;
}

/* ---------- spaces and picks ---------- */
const topicSpace = (t: string, A: number, kids: string | undefined): SpaceId | null =>
  (({ periods: "periods", contra: "contra", sexual: "contra", fertility: "fertility", pregnancy: "fertility", parenting: "baby", meno: "meno", sleep: A >= 40 ? "meno" : null, pelvic: kids === "u1" ? "baby" : A >= 40 ? "meno" : null, move: A >= 45 ? "meno" : null }) as Record<string, SpaceId | null>)[t] ?? null;

const STAGE_REASON: Record<string, string> = { periods: "You're having periods", trying: "You're trying to get pregnant", pregnant: "You're pregnant", baby: "You've had a baby this year", peri: "You've noticed signs of perimenopause", post: "You're post-menopause", unsure: "You weren't sure of your stage yet" };
const SLEEP_REASON: Record<string, string> = { falling: "You have trouble falling asleep", waking: "You're waking at 3am", sweats: "Night sweats wake you", shift: "You do shift work", baby: "A little one wakes you" };
export type Pick = Item & { score: number; reasons: string[] };
export type Plan = { spaces: { id: SpaceId; why: string | undefined }[]; checks: Check[]; picks: Pick[]; mindFirst: boolean; lowMood: boolean; age: number };

export function plan(p: Profile): Plan {
  const A = ageOf(p) ?? 35;
  const focus = p.focus ?? [];
  const st = p.stages ?? [];
  const score: Partial<Record<SpaceId, number>> = {};
  const why: Partial<Record<SpaceId, string[]>> = {};
  const add = (s: SpaceId | null, n: number, r: string) => { if (!s) return; score[s] = (score[s] ?? 0) + n; (why[s] ??= []).push(r); };
  focus.forEach((t, i) => add(topicSpace(t, A, p.children), [9, 6, 3][i] ?? 1, `you put ${labelOf(TOPICS, t).toLowerCase()} in your top 3`));
  if (st.includes("periods")) { add("periods", 4, "you're having periods"); if (!st.includes("trying") && !st.includes("pregnant")) add("contra", 2, "you're having periods"); }
  if (st.includes("trying")) add("fertility", 7, "you're trying to get pregnant");
  if (st.includes("pregnant")) add("fertility", 9, "you're pregnant");
  if (st.includes("baby") || p.children === "u1") add("baby", 8, "you've had a baby in the last year");
  if (st.includes("peri")) add("meno", 7, "you've noticed signs of perimenopause");
  if (st.includes("post")) add("meno", 7, "you're post-menopause");
  if (st.includes("unsure")) { add("periods", 2, "you weren't sure, so we've started broad"); if (A >= 38) add("meno", 3, "many women notice changes from their late 30s"); }
  if (p.periods === "heavy" || p.periods === "irregular") add("periods", 3, `you said your periods are ${labelOf(PERIODS, p.periods).toLowerCase()}`);
  if (p.contra && !["none", "skip"].includes(p.contra)) add("contra", 2, `you use ${labelOf(CONTRA, p.contra).split(" (")[0]!.toLowerCase()}`);
  if (A >= 45 && !st.includes("pregnant")) add("meno", 2, "many women notice changes in their 40s");
  if (A < 20) add("periods", 2, "it's a good place to start at your age");
  // What doesn't apply is hidden (still one tap away in Explore).
  if (st.includes("post") || A >= 58) { if (!focus.includes("fertility") && !focus.includes("pregnancy")) delete score.fertility; if (!focus.includes("periods")) delete score.periods; }
  if (A >= 60 && !focus.includes("contra") && !focus.includes("sexual")) delete score.contra;
  if (A < 35 && !focus.includes("meno") && !st.includes("peri")) delete score.meno;
  if (!(st.includes("baby") || p.children === "u1") && !focus.includes("parenting") && (score.baby ?? 0) < 6) delete score.baby;
  let spaces = (Object.keys(score) as SpaceId[]).sort((x, y) => (score[y] ?? 0) - (score[x] ?? 0)).slice(0, 3);
  if (!spaces.length) spaces = A >= 42 ? ["meno", "periods"] : ["periods", "contra"];
  const lowMood = !!p.mood && p.mood <= 2;
  const mindFirst = lowMood || has(p, "conds", "anx") || focus.includes("mind");
  return { spaces: spaces.map((id) => ({ id, why: why[id]?.[0] })), checks: checksFor(p), picks: rank(p, spaces, mindFirst, lowMood).slice(0, 3), mindFirst, lowMood, age: A };
}

/** Rank the library for this person; each pick carries the reasons it was chosen. */
export function rank(p: Profile, spaces: SpaceId[], mindFirst: boolean, lowMood: boolean, only?: Item["space"]): Pick[] {
  const A = ageOf(p) ?? 35;
  const focus = p.focus ?? [];
  const st = p.stages ?? [];
  const learn = p.learn ?? [];
  const sleepy = ["falling", "waking", "sweats", "baby", "shift"].includes(p.sleep ?? "") || focus.includes("sleep");
  const out: Pick[] = [];
  for (const it of LIBRARY) {
    if (only && it.space !== only) continue;
    if (it.tags.minAge && A < it.tags.minAge) continue;
    const r: string[] = [];
    let sc = 0;
    const si = spaces.indexOf(it.space as SpaceId);
    if (only) sc += 1;
    else if (si >= 0) sc += 3 - si;
    else if (it.space === "mind") sc += mindFirst ? 2.5 : 0.5;
    else if (it.space === "checks") { if (!focus.includes("breast")) continue; sc += 2; }
    else continue;
    const T = it.tags;
    if (T.periods && p.periods && T.periods.includes(p.periods)) { sc += 3; r.push(`Your periods are ${labelOf(PERIODS, p.periods).toLowerCase()}`); }
    const cond = (p.conds ?? []).find((c) => T.conds?.includes(c));
    if (cond) { sc += 3; r.push(`You live with ${labelOf(CONDS, cond).toLowerCase()}`); }
    if (T.contra && p.contra && T.contra.includes(p.contra)) { sc += 2.5; r.push(`You use ${labelOf(CONTRA, p.contra).split(" (")[0]!.toLowerCase()}`); }
    const stage = st.find((x) => T.stages?.includes(x));
    if (stage) { sc += 2.5; r.push(STAGE_REASON[stage] ?? labelOf(STAGES, stage)); }
    if (T.children && p.children && T.children.includes(p.children)) { sc += 2.5; r.push(`You have ${labelOf(CHILDREN, p.children).toLowerCase()}`); }
    const f = focus.find((x) => T.focus?.includes(x));
    if (f) { sc += 2; r.push(`${labelOf(TOPICS, f)} is in your top 3`); }
    if (T.sleep && sleepy) { sc += 1.5; r.push((p.sleep && SLEEP_REASON[p.sleep]) || "Sleep is in your top 3"); }
    if (T.lowMood && lowMood) { sc += 3; r.push("You told us you've been feeling low"); }
    if (T.family && (p.family ?? []).some((x) => T.family?.includes(x))) { sc += 2; r.push("Osteoporosis runs in your family"); }
    if (learn.includes(it.format)) { sc += 1; r.push(`You like ${labelOf(LEARN, it.format).toLowerCase()}`); }
    if (si >= 0) r.push(`It's part of ${SPACES[it.space as SpaceId].name.toLowerCase()}, one of your focus areas`);
    out.push({ ...it, score: sc, reasons: r });
  }
  out.sort((x, y) => y.score - x.score);
  if (only) return out;
  // Spread the first picks across spaces.
  const picks: Pick[] = [];
  const per: Record<string, number> = {};
  for (const c of out) {
    if ((per[c.space] ?? 0) >= 1 && picks.length < 2) continue;
    picks.push(c);
    per[c.space] = (per[c.space] ?? 0) + 1;
  }
  return picks;
}

/** How personal the space is, 0 to 100. Core answers carry most of it; deeper answers finish it. */
export const CORE_KEYS = ["name", "year", "stages", "focus", "children", "periods", "contra", "conds", "mood", "checks", "postcode", "learn"] as const;
export const DEEP_KEYS = ["family", "sleep", "move", "identity", "lang", "support", "days", "habits"] as const;
export function answered(p: Profile, k: string): boolean {
  if (k === "name") return !!p.name?.trim();
  if ((k === "checks" || k === "periods" || k === "contra") && !p.year) return false;
  if (k === "checks") return !!(p.cervical || p.mammo) || (ageOf(p) ?? 0) < 25;
  if (k === "habits") return !!(p.alcohol || p.smoke);
  if (k === "periods" && !periodsRelevant(p)) return true;
  if (k === "contra" && !contraRelevant(p)) return true;
  const v = (p as Record<string, unknown>)[k];
  return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "";
}
export function personal(p: Profile) {
  const core = CORE_KEYS.filter((k) => answered(p, k)).length;
  const deep = DEEP_KEYS.filter((k) => answered(p, k)).length;
  return Math.min(100, Math.round((core / CORE_KEYS.length) * 72 + (deep / DEEP_KEYS.length) * 28));
}
