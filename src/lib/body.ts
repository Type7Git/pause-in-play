/**
 * Resilient body: device-only progress (movement, pelvic floor sets, food add-ins).
 * Nothing here goes to the cloud while personal health saving is disabled.
 * "How do you feel?" answers are never stored.
 */
import { useCallback, useEffect, useState } from "react";

export type SessionType = "Stretch" | "Yoga" | "Pilates" | "Strength" | "Walk & balance";
export type Energy = "gentle" | "steady" | "energetic";
export const TYPES: SessionType[] = ["Stretch", "Yoga", "Pilates", "Strength", "Walk & balance"];
export const ENERGY_RANK: Record<Energy, number> = { gentle: 0, steady: 1, energetic: 2 };
export const ENERGY_CHIPS = [{ label: "A little", level: "gentle" }, { label: "Some", level: "steady" }, { label: "Plenty", level: "energetic" }] as const;

/** Type → colour tokens (bg tile, solid dot/ring). */
export const TYPE_STYLE: Record<SessionType, { tile: string; dot: string; stroke: string }> = {
  Stretch: { tile: "bg-sage-soft", dot: "bg-sage", stroke: "var(--mm-sage)" },
  Yoga: { tile: "bg-plum-soft", dot: "bg-plum-2", stroke: "var(--mm-plum-2)" },
  Pilates: { tile: "bg-rose-soft", dot: "bg-rose", stroke: "var(--mm-rose)" },
  Strength: { tile: "bg-gold-soft", dot: "bg-gold", stroke: "var(--mm-gold)" },
  "Walk & balance": { tile: "bg-sunk", dot: "bg-plum", stroke: "var(--mm-plum)" },
};

export type Session = { key: string; title: string; type: SessionType; energy: Energy; minutes: number; benefit_tags: string[]; description: string; is_plus: boolean };
export type Move = { order: number; move: string; seconds: number; how: string; easier_version: string | null; caution_flag: "spine" | "impact" | null; caution_text: string | null };
export type LogEntry = { session_key: string; type: SessionType; minutes: number; completed_at: string; via: "player" | "tick" };

/** Sessions at or below the chosen energy level, optionally of one type. */
export function filterSessions<T extends { energy: Energy; type: SessionType }>(list: T[], energy: Energy | null, type: SessionType | "All") {
  return list.filter((s) => (energy === null || ENERGY_RANK[s.energy] <= ENERGY_RANK[energy]) && (type === "All" || s.type === type));
}

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Monday-start week containing `now`. */
export function weekDays(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}

/** This week's sessions, minutes, and distinct days with Strength or Pilates. */
export function weekStats(log: LogEntry[], now = new Date()) {
  const keys = new Set(weekDays(now).map(dayKey));
  const week = log.filter((l) => keys.has(dayKey(new Date(l.completed_at))));
  const strengthDays = new Set(week.filter((l) => l.type === "Strength" || l.type === "Pilates").map((l) => dayKey(new Date(l.completed_at))));
  return { week, sessions: week.length, minutes: week.reduce((n, l) => n + l.minutes, 0), strengthDays: strengthDays.size };
}

/** One pelvic floor rep: hold, let go 4s, 3 quick squeezes (1s on, 1s off), rest 3s. */
export type Phase = { label: "Squeeze and lift" | "Let go" | "Quick squeeze" | "Rest"; seconds: number; grow: boolean };
export function repPhases(hold: number): Phase[] {
  const quick: Phase[] = [];
  for (let i = 0; i < 3; i++) quick.push({ label: "Quick squeeze", seconds: 1, grow: true }, { label: "Let go", seconds: 1, grow: false });
  return [{ label: "Squeeze and lift", seconds: hold, grow: true }, { label: "Let go", seconds: 4, grow: false }, ...quick, { label: "Rest", seconds: 3, grow: false }];
}

/* ---------- device storage ---------- */
const KEY = "pnp-body-v1";
type Store = { log: LogEntry[]; pelvic: { completed_at: string; hold: number; reps: number }[]; addins: Record<string, string[]>; safetySeen: boolean; pelvicReminders: boolean; reminderTimes: string[] };
const EMPTY: Store = { log: [], pelvic: [], addins: {}, safetySeen: false, pelvicReminders: false, reminderTimes: ["09:00", "13:00", "19:00"] };
const read = (): Store => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return EMPTY; } };
const EVT = "pnp-body-change";

export function useBody() {
  const [s, setS] = useState<Store>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setS(read());
    sync(); setReady(true);
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);
  const update = useCallback((fn: (s: Store) => Store) => {
    const next = fn(read());
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    setS(next);
    window.dispatchEvent(new Event(EVT));
  }, []);
  return { ...s, ready, update };
}

/** Fires discreet "Time for a little squeeze" notifications while the app is open. */
export function usePelvicReminders() {
  useEffect(() => {
    const fired = new Set<string>();
    const t = setInterval(() => {
      const s = read();
      if (!s.pelvicReminders || typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = new Date();
      const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const id = `${dayKey(now)} ${hm}`;
      if (s.reminderTimes.includes(hm) && !fired.has(id)) { fired.add(id); new Notification("Time for a little squeeze", { silent: true, tag: "pelvic" }); }
    }, 30_000);
    return () => clearInterval(t);
  }, []);
}
