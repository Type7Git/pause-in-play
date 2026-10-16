/** Mood Mapper and Cycle Tracker records, kept on this device only (like the Medicine cabinet). Never sent to a server. */
import { useSyncExternalStore } from "react";
import { addDays, differenceInCalendarDays, format, parseISO, subMonths } from "date-fns";

/* ---------- a tiny device store ---------- */
function deviceStore<T>(key: string, empty: T, clean: (v: unknown) => T) {
  let state = empty, loaded = false;
  const subs = new Set<() => void>();
  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try { const raw = localStorage.getItem(key); if (raw) state = clean(JSON.parse(raw)); } catch { /* keep empty */ }
  };
  return {
    use: () => useSyncExternalStore((f) => { load(); subs.add(f); return () => { subs.delete(f); }; }, () => { load(); return state; }, () => empty),
    get: () => { load(); return state; },
    set: (next: T) => {
      load(); state = next;
      try { if (next === empty) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(next)); } catch { /* private window */ }
      subs.forEach((f) => f());
    },
    empty,
  };
}
export const ymd = (d: Date) => format(d, "yyyy-MM-dd");

/* ---------- Mood Mapper ---------- */
export const QUADRANTS = [
  { id: 1, name: "Wired and tense", tint: "bg-rose-soft", solid: "bg-rose", words: ["Irritable", "Anxious", "Overwhelmed", "Snappy", "Restless", "Frustrated"] },
  { id: 2, name: "Bright and buzzing", tint: "bg-gold-soft", solid: "bg-gold", words: ["Energised", "Hopeful", "Excited", "Proud", "Motivated", "Happy"] },
  { id: 3, name: "Low and flat", tint: "bg-plum-soft", solid: "bg-plum-2", words: ["Sad", "Teary", "Tired", "Lonely", "Numb", "Disappointed"] },
  { id: 4, name: "Calm and content", tint: "bg-sage-soft", solid: "bg-sage", words: ["Relaxed", "Peaceful", "Grateful", "Settled", "Cosy", "Okay"] },
] as const;
export const TAG_GROUPS = [
  { name: "Inside me", tags: ["Poor sleep", "Good sleep", "Hot flushes", "Night sweats", "Tired", "Pain", "Brain fog", "Period"] },
  { name: "Around me", tags: ["Work", "Family", "Partner", "Kids", "Friends", "Money", "Health worries", "News"] },
  { name: "Today I had", tags: ["Walk", "Exercise", "Caffeine", "Alcohol", "Time outside", "Screen time"] },
];
export const REFLECTION_NOTE = "Patterns are for your own reflection, not a diagnosis. You know your life best. If low days are sticking around, your GP is a good person to talk to.";

export type MoodEntry = { id: string; at: string; date: string; quadrant: number; words: string[]; tags: string[]; note?: string };
const strs = (x: unknown) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === "string") : []);
export const moods = deviceStore<MoodEntry[]>("lum:moods", [], (v) =>
  (Array.isArray(v) ? v : []).flatMap((o: Record<string, unknown>) =>
    typeof o?.["id"] === "string" && typeof o["date"] === "string" && typeof o["quadrant"] === "number"
      ? [{ id: o["id"], at: String(o["at"] ?? o["date"]), date: o["date"], quadrant: o["quadrant"], words: strs(o["words"]), tags: strs(o["tags"]), ...(typeof o["note"] === "string" && o["note"] ? { note: o["note"] } : {}) }]
      : []));
export function addMood(e: Omit<MoodEntry, "id" | "at" | "date">, now = new Date()) {
  const entry: MoodEntry = { ...e, id: Math.random().toString(36).slice(2, 10), at: now.toISOString(), date: ymd(now) };
  moods.set([...moods.get(), entry].slice(-1000));
  return entry;
}
export const removeMood = (id: string) => moods.set(moods.get().filter((m) => m.id !== id));
/** The most recent check-in for each of the last n days, oldest first (null when nothing was logged). */
export function lastDays(entries: MoodEntry[], n: number, today = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const date = ymd(addDays(today, i - n + 1));
    const day = entries.filter((e) => e.date === date);
    return { date, entry: day.length ? day[day.length - 1]! : null, count: day.length };
  });
}
/** Gentle observations: only once a tag has turned up on at least 3 different days. */
export function observations(entries: MoodEntry[]) {
  const tags = [...new Set(entries.flatMap((e) => e.tags))];
  return tags.flatMap((tag) => {
    const days = new Map(entries.filter((e) => e.tags.includes(tag)).map((e) => [e.date, e]));
    if (days.size < 3) return [];
    const low = [...days.values()].filter((e) => e.quadrant === 1 || e.quadrant === 3).length;
    const calm = [...days.values()].filter((e) => e.quadrant === 2 || e.quadrant === 4).length;
    const t = tag.toLowerCase();
    return low >= calm
      ? [{ weight: low, line: `On ${low} of ${days.size} days tagged ${t}, you also logged a tense or low mood.` }]
      : [{ weight: calm, line: `On ${calm} of ${days.size} days tagged ${t}, you also logged a bright or calm mood.` }];
  }).sort((a, b) => b.weight - a.weight).map((o) => o.line);
}

/* ---------- Cycle Tracker ---------- */
export const FLOWS = ["None", "Spotting", "Light", "Medium", "Heavy", "Very heavy"] as const;
export type Flow = (typeof FLOWS)[number];
export const CYCLE_SYMPTOMS = ["Cramps", "Hot flushes", "Night sweats", "Headache", "Breast tenderness", "Bloating", "Joint aches", "Brain fog", "Poor sleep", "Low mood", "Low libido", "Vaginal dryness"];
export type CycleDay = { flow: Flow; hourly: boolean; symptoms: string[] };
export type CycleLog = Record<string, CycleDay>;
const isBleed = (d?: CycleDay) => !!d && ["Light", "Medium", "Heavy", "Very heavy"].includes(d.flow);
export const cycle = deviceStore<CycleLog>("lum:cycle", {}, (v) => {
  const out: CycleLog = {};
  for (const [k, o] of Object.entries((v && typeof v === "object" ? v : {}) as Record<string, Record<string, unknown>>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !o) continue;
    const flow = (FLOWS as readonly string[]).includes(String(o["flow"])) ? (o["flow"] as Flow) : "None";
    out[k] = { flow, hourly: o["hourly"] === true, symptoms: strs(o["symptoms"]) };
  }
  return out;
});
export function setCycleDay(date: string, day: CycleDay | null) {
  const next = { ...cycle.get() };
  if (!day || (day.flow === "None" && !day.hourly && !day.symptoms.length)) delete next[date]; else next[date] = day;
  cycle.set(next);
}

export type Period = { start: string; days: number; heaviest: Flow };
/** Periods are runs of bleeding days; a single gap day (or a spotting day) inside a run doesn't split it. */
export function periods(log: CycleLog): Period[] {
  const bleeds = Object.keys(log).filter((k) => isBleed(log[k])).sort();
  const out: Period[] = [];
  let cur: { start: string; last: string; heaviest: Flow } | null = null;
  const order = (f: Flow) => FLOWS.indexOf(f);
  for (const k of bleeds) {
    const f = log[k]!.flow;
    if (cur && differenceInCalendarDays(parseISO(k), parseISO(cur.last)) <= 2) { cur.last = k; if (order(f) > order(cur.heaviest)) cur.heaviest = f; continue; }
    if (cur) out.push({ start: cur.start, days: differenceInCalendarDays(parseISO(cur.last), parseISO(cur.start)) + 1, heaviest: cur.heaviest });
    cur = { start: k, last: k, heaviest: f };
  }
  if (cur) out.push({ start: cur.start, days: differenceInCalendarDays(parseISO(cur.last), parseISO(cur.start)) + 1, heaviest: cur.heaviest });
  return out;
}
/** Days from one period start to the next. */
export const cycleLengths = (ps: Period[]) => ps.slice(1).map((p, i) => differenceInCalendarDays(parseISO(p.start), parseISO(ps[i]!.start)));
export function cycleStats(log: CycleLog, today = new Date()) {
  const ps = periods(log);
  const lengths = cycleLengths(ps);
  const last = ps[ps.length - 1];
  return {
    periods: ps,
    lengths,
    sinceLast: last ? differenceInCalendarDays(today, parseISO(last.start)) : null,
    lastLength: lengths.length ? lengths[lengths.length - 1]! : null,
    range: lengths.length >= 2 ? [Math.min(...lengths), Math.max(...lengths)] as const : null,
  };
}
/** A plain-text summary of the last three months to show a GP. Includes no name or account details. */
export function gpSummary(log: CycleLog, today = new Date()): string {
  const from = ymd(subMonths(today, 3));
  const recent = Object.entries(log).filter(([k]) => k >= from).sort(([a], [b]) => a.localeCompare(b));
  const { periods: ps, lengths } = cycleStats(log, today);
  const inRange = ps.filter((p) => p.start >= from);
  const sym = new Map<string, number>();
  recent.forEach(([, d]) => d.symptoms.forEach((s) => sym.set(s, (sym.get(s) ?? 0) + 1)));
  const top = [...sym].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const lines = [
    `Cycle summary · ${format(parseISO(from), "d MMM yyyy")} to ${format(today, "d MMM yyyy")}`,
    "",
    inRange.length ? `Periods started: ${inRange.map((p) => `${format(parseISO(p.start), "d MMM")} (${p.days} ${p.days === 1 ? "day" : "days"}, heaviest ${p.heaviest.toLowerCase()})`).join("; ")}` : "No periods logged in this time.",
    lengths.length ? `Recent cycle lengths: ${lengths.slice(-4).join(", ")} days` : "",
    `Spotting days: ${recent.filter(([, d]) => d.flow === "Spotting").length}`,
    `Heavy or very heavy days: ${recent.filter(([, d]) => d.flow === "Heavy" || d.flow === "Very heavy").length}`,
    `Days changing protection every hour or less: ${recent.filter(([, d]) => d.hourly).length}`,
    top.length ? `Symptoms logged: ${top.map(([s, n]) => `${s} (${n} ${n === 1 ? "day" : "days"})`).join(", ")}` : "No symptoms logged.",
    "",
    "Recorded by me in Lumenera. Not a diagnosis.",
  ];
  return lines.filter((l, i) => l !== "" || i === 1 || i === lines.length - 2).join("\n");
}

/* ---------- your records ---------- */
/** Everything Lumenera keeps on this phone about your health, for download. */
export function deviceRecords() {
  let cabinet: unknown = null;
  try { cabinet = JSON.parse(localStorage.getItem("lum:cabinet") ?? "null"); } catch { /* none */ }
  return { exported: new Date().toISOString(), moods: moods.get(), cycle: cycle.get(), cabinet };
}
export function clearDeviceRecords() {
  moods.set(moods.empty);
  cycle.set(cycle.empty);
  try { localStorage.removeItem("lum:cabinet"); } catch { /* none */ }
}
