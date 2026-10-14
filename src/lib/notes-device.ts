/** Little notes on this device: prefs in localStorage, and (in the app) notifications scheduled on the phone itself. */
import { noteById, type Note } from "@/content/notes";
import { callNative, hasPlugin } from "./native";
import { DEFAULT_NOTE_PREFS, pickNote, upcomingNoteTimes, type NotePrefs } from "./notes";

const KEY = "pip:notes";
const FIRST_ID = 7000;
const LAST_ID = 7199;
export type Planned = { at: number; id: string };
type Stored = NotePrefs & { until?: number; plan?: Planned[]; web?: boolean };

export function readNotes(): Stored {
  try {
    return { ...DEFAULT_NOTE_PREFS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Stored>) };
  } catch {
    return { ...DEFAULT_NOTE_PREFS };
  }
}
export function writeNotes(s: Stored) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
}
export const localTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Sydney";

/** Notes that have already popped up on this phone, newest first. */
export function receivedNotes(now = Date.now()): (Note & { at: number })[] {
  return (readNotes().plan ?? [])
    .filter((p) => p.at <= now)
    .sort((a, b) => b.at - a.at)
    .slice(0, 12)
    .flatMap((p) => { const n = noteById(p.id); return n ? [{ ...n, at: p.at }] : []; });
}

export const phoneCanNotify = () => hasPlugin("LocalNotifications");

/** (Re)plan the next two weeks of notes on the phone. Asks permission only when `ask` is true. */
export async function scheduleOnPhone(prefs: NotePrefs, ask: boolean): Promise<"scheduled" | "off" | "denied" | "unavailable"> {
  if (!phoneCanNotify()) return "unavailable";
  try {
    const perm = await callNative<{ display?: string }>("LocalNotifications", ask ? "requestPermissions" : "checkPermissions");
    const pending = await callNative<{ notifications?: { id: number }[] }>("LocalNotifications", "getPending").catch(() => ({ notifications: [] }));
    const ours = (pending.notifications ?? []).filter((n) => n.id >= FIRST_ID && n.id <= LAST_ID);
    if (ours.length) await callNative("LocalNotifications", "cancel", { notifications: ours.map((n) => ({ id: n.id })) });
    const prev = readNotes();
    const kept = (prev.plan ?? []).filter((p) => p.at <= Date.now());
    if (!prefs.on) { writeNotes({ ...prefs, plan: kept }); return "off"; }
    if (perm.display !== "granted") return "denied";
    const times = upcomingNoteTimes(Date.now(), prefs, localTz());
    const recent = kept.slice(-10).map((p) => p.id);
    const plan: Planned[] = times.map((at) => { const n = pickNote(recent); recent.push(n.id); if (recent.length > 12) recent.shift(); return { at, id: n.id }; });
    await callNative("LocalNotifications", "schedule", {
      notifications: plan.map((p, i) => {
        const n = noteById(p.id)!;
        return {
          id: FIRST_ID + i,
          title: "A little note for you",
          body: n.text,
          largeBody: n.text,
          schedule: { at: new Date(p.at).toISOString(), allowWhileIdle: true },
          extra: { path: `/notes?card=${n.id}` },
          smallIcon: "ic_stat_icon",
        };
      }),
    });
    writeNotes({ ...prefs, plan: [...kept.slice(-30), ...plan], until: times.at(-1) ?? Date.now() });
    return "scheduled";
  } catch (e) {
    console.error("little notes", e);
    return "unavailable";
  }
}

/** On app open: top the schedule up when it's running low. Never prompts. */
export async function topUpPhoneNotes() {
  const s = readNotes();
  if (!s.on || !phoneCanNotify()) return;
  if ((s.until ?? 0) - Date.now() > 7 * 864e5) return;
  await scheduleOnPhone(s, false);
}
