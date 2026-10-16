/** Medicine cabinet: her medicines, schedules and dose ticks, kept on this device only. Never a dose suggestion. */
import { useSyncExternalStore } from "react";
import type { Form, Schedule } from "@/content/medicines";
import { callNative, hasPlugin } from "./native";

export type CabinetEntry = { id: string; medId?: string; name: string; form: Form; amount: string; schedule: Schedule; start: string; remind: boolean; discreet: boolean; supplyDays?: number };
export type DoseStatus = "done" | "skip" | "snooze";
type State = { entries: CabinetEntry[]; log: Record<string, DoseStatus> };

const KEY = "lum:cabinet";
const EMPTY: State = { entries: [], log: {} };
let state: State = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as State | null; if (v?.entries) state = { entries: v.entries, log: v.log ?? {} }; } catch { /* keep empty */ }
}
function set(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private window */ }
  subs.forEach((f) => f());
  void planPhoneReminders();
}
export function useCabinet(): State {
  return useSyncExternalStore((f) => { load(); subs.add(f); return () => subs.delete(f); }, () => { load(); return state; }, () => EMPTY);
}
export const cabinet = {
  save: (e: CabinetEntry) => { load(); set({ ...state, entries: [...state.entries.filter((x) => x.id !== e.id), e] }); },
  remove: (id: string) => { load(); set({ ...state, entries: state.entries.filter((x) => x.id !== id) }); },
  mark: (key: string, s: DoseStatus | null) => { load(); const log = { ...state.log }; if (s) log[key] = s; else delete log[key]; set({ ...state, log }); },
};

/* ---------- schedule maths ---------- */
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const weekday = (d: Date) => WEEKDAYS[(d.getDay() + 6) % 7]!;
// Round, not floor: a daylight-saving day is 23 or 25 hours long.
const daysBetween = (from: string, d: Date) => Math.round((new Date(`${dayKey(d)}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 864e5);

/** Dose times due on a given day ("08:00"), or none. Long-lasting devices and as-needed medicines have no daily doses. */
export function dosesOn(e: CabinetEntry, d: Date): string[] {
  const s = e.schedule;
  const n = daysBetween(e.start, d);
  if (n < 0) return [];
  const times = s.times?.length ? s.times : ["08:00"];
  switch (s.pattern) {
    case "daily": return times;
    case "weekdays": return (s.days ?? []).includes(weekday(d)) ? times : [];
    case "everyN": return n % Math.max(1, s.every ?? 1) === 0 ? times : [];
    case "cycle": { const on = s.on ?? 21, len = on + (s.off ?? 7); return n % len < on ? times : []; }
    case "startup": return n < (s.startupDays ?? 14) || (s.days ?? []).includes(weekday(d)) ? times : [];
    case "course": return n < (s.courseDays ?? 5) ? times : [];
    default: return [];
  }
}
/** When a long-lasting device or injection is due to be replaced. */
export function replaceBy(e: CabinetEntry): Date | null {
  if (e.schedule.pattern !== "device" || !e.schedule.replaceMonths) return null;
  const d = new Date(`${e.start}T00:00:00`);
  d.setMonth(d.getMonth() + e.schedule.replaceMonths);
  return d;
}
export const doseKey = (e: CabinetEntry, d: Date, t: string) => `${dayKey(d)}|${e.id}|${t}`;

/** A plain description of the schedule, e.g. "Every day · 08:00" or "Mon and Thu · 21:00". */
export function describe(s: Schedule): string {
  const t = s.times?.length ? ` · ${s.times.join(", ")}` : "";
  switch (s.pattern) {
    case "daily": return `Every day${t}`;
    case "weekdays": return `${(s.days ?? []).join(" and ") || "Chosen days"}${t}`;
    case "everyN": return `Every ${s.every ?? 1} days${t}`;
    case "cycle": return `${s.on ?? 21} days on, ${s.off ?? 7} off${t}`;
    case "startup": return `Daily for ${s.startupDays ?? 14} days, then ${(s.days ?? []).join(" and ") || "chosen days"}${t}`;
    case "device": return s.replaceMonths ? `Replace every ${s.replaceMonths >= 12 && s.replaceMonths % 12 === 0 ? `${s.replaceMonths / 12} year${s.replaceMonths === 12 ? "" : "s"}` : `${s.replaceMonths} months`}` : "Long-lasting";
    case "asNeeded": return "Only when I need it";
    case "course": return `For ${s.courseDays ?? 5} days${t}`;
  }
}

/* ---------- reminders ---------- */
const FIRST_ID = 7300, LAST_ID = 7499;
/** Plan the next week of dose reminders on the phone (Lumenera app). Discreet entries never show the medicine name. */
export async function planPhoneReminders(ask = false): Promise<"scheduled" | "denied" | "unavailable"> {
  if (typeof window === "undefined" || !hasPlugin("LocalNotifications")) return "unavailable";
  try {
    const perm = await callNative<{ display?: string }>("LocalNotifications", ask ? "requestPermissions" : "checkPermissions");
    const pending = await callNative<{ notifications?: { id: number }[] }>("LocalNotifications", "getPending").catch(() => ({ notifications: [] }));
    const ours = (pending.notifications ?? []).filter((n) => n.id >= FIRST_ID && n.id <= LAST_ID);
    if (ours.length) await callNative("LocalNotifications", "cancel", { notifications: ours.map((n) => ({ id: n.id })) });
    if (perm.display !== "granted") return "denied";
    const now = Date.now();
    const list: { at: Date; title: string; body: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      for (const e of state.entries.filter((x) => x.remind)) {
        for (const t of dosesOn(e, d)) {
          const [h, m] = t.split(":").map(Number);
          const at = new Date(d); at.setHours(h ?? 8, m ?? 0, 0, 0);
          if (at.getTime() > now) list.push({ at, title: e.discreet ? "Time for your routine" : `Time for ${e.name}`, body: e.discreet ? "Tap to open your cabinet." : e.amount || "Tap to tick it off." });
        }
      }
    }
    await callNative("LocalNotifications", "schedule", {
      notifications: list.slice(0, LAST_ID - FIRST_ID).map((n, i) => ({ id: FIRST_ID + i, title: n.title, body: n.body, schedule: { at: n.at.toISOString(), allowWhileIdle: true }, extra: { path: "/medicines" }, smallIcon: "ic_stat_icon" })),
    });
    return "scheduled";
  } catch (e) {
    console.error("medicine reminders", e);
    return "unavailable";
  }
}
