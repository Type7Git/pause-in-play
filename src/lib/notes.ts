/** Little notes scheduling: random, kind, inside the hours she chose. Pure and shared by the app and the server. */
import { NOTES, type Note } from "@/content/notes";

export type NoteFreq = "few" | "daily" | "twice";
export type NotePrefs = { on: boolean; freq: NoteFreq; from: number; to: number };
export const DEFAULT_NOTE_PREFS: NotePrefs = { on: false, freq: "daily", from: 9, to: 20 };
export const FREQ_LABEL: Record<NoteFreq, string> = { few: "Every few days", daily: "Once a day", twice: "Twice a day" };

/** Wall-clock parts of an instant in a time zone. */
function partsIn(ms: number, tz: string) {
  const f = new Intl.DateTimeFormat("en-AU", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { y: Number(p["year"]), m: Number(p["month"]), d: Number(p["day"]), h: Number(p["hour"]), min: Number(p["minute"]) };
}

/** The instant when it's y-m-d h:min on the wall clock in tz. */
export function zonedToUtc(y: number, m: number, d: number, h: number, min: number, tz: string) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const p = partsIn(guess, tz);
  const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - guess;
  const first = guess - offset;
  const p2 = partsIn(first, tz);
  const offset2 = Date.UTC(p2.y, p2.m - 1, p2.d, p2.h, p2.min) - first;
  return guess - offset2;
}

/**
 * The next time a note should arrive, at least 20 minutes from `after`.
 * Hours are split into equal slots (one per note that day) and a random minute is chosen inside the next free slot,
 * so notes feel spontaneous but never bunch up.
 */
export function nextNoteTime(after: number, prefs: Pick<NotePrefs, "freq" | "from" | "to">, tz: string, rand: () => number = Math.random) {
  const from = Math.min(Math.max(prefs.from, 0), 23);
  const to = Math.max(Math.min(prefs.to, 24), from + 1);
  const slots = prefs.freq === "twice" ? 2 : 1;
  const span = ((to - from) * 60) / slots;
  const minGap = prefs.freq === "few" ? 36 * 3600e3 : 20 * 60e3;
  const today = partsIn(after, tz);
  for (let day = 0; day < 8; day++) {
    for (let s = 0; s < slots; s++) {
      const startMin = from * 60 + s * span + Math.floor(rand() * Math.max(span - 10, 1));
      const base = Date.UTC(today.y, today.m - 1, today.d + day);
      const dd = new Date(base);
      const t = zonedToUtc(dd.getUTCFullYear(), dd.getUTCMonth() + 1, dd.getUTCDate(), Math.floor(startMin / 60), startMin % 60, tz);
      if (t >= after + minGap) {
        if (prefs.freq === "few" && day < 2) continue;
        return t;
      }
    }
  }
  return after + 24 * 3600e3;
}

/** A run of upcoming times (for scheduling on the phone itself). */
export function upcomingNoteTimes(start: number, prefs: NotePrefs, tz: string, days = 14, rand: () => number = Math.random) {
  const out: number[] = [];
  let t = start;
  const until = start + days * 864e5;
  while (out.length < 40) {
    t = nextNoteTime(t, prefs, tz, rand);
    if (t > until) break;
    out.push(t);
  }
  return out;
}

/** A random note, avoiding the ones just shown. */
export function pickNote(avoid: string[] = [], rand: () => number = Math.random): Note {
  const pool = NOTES.filter((n) => !avoid.includes(n.id));
  const list = pool.length ? pool : NOTES;
  return list[Math.floor(rand() * list.length)] ?? NOTES[0]!;
}

/** Same note all day, a different one tomorrow. */
export function noteOfTheDay(d = new Date()) {
  const k = d.getFullYear() * 400 + (d.getMonth() + 1) * 32 + d.getDate();
  return NOTES[(k * 7919) % NOTES.length]!;
}
