import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

// Fixed reference day keeps examples stable across SSR and browser hydration.
export const EXAMPLE_DAY = "2026-10-12";
export const dayAfter = (date: string, n: number) => format(addDays(parseISO(date), n), "yyyy-MM-dd");
export type Schedule =
  | { kind: "daily" }
  | { kind: "weekdays"; days: number[] }
  | { kind: "every"; interval: number }
  | { kind: "cycle"; on: number; length: number }
  | { kind: "startup"; dailyDays: number; days: number[] }
  | { kind: "device"; due: string }
  | { kind: "prn" };

export function isDue(pattern: Schedule, start: string, date: string): boolean {
  const elapsed = differenceInCalendarDays(parseISO(date), parseISO(start));
  if (elapsed < 0) return false;
  switch (pattern.kind) {
    case "daily": return true;
    case "weekdays": return pattern.days.includes(parseISO(date).getDay());
    case "every": return pattern.interval > 0 && elapsed % pattern.interval === 0;
    case "cycle": return pattern.length > 0 && elapsed % pattern.length < pattern.on;
    case "startup": return elapsed < pattern.dailyDays || pattern.days.includes(parseISO(date).getDay());
    case "device": return date === pattern.due || date === format(addDays(parseISO(pattern.due), -7), "yyyy-MM-dd") || date === format(new Date(parseISO(pattern.due).getFullYear(), parseISO(pattern.due).getMonth() - 1, parseISO(pattern.due).getDate()), "yyyy-MM-dd");
    case "prn": return false;
  }
}

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
export type SampleMood = { quadrant: number; tags: string[]; date: string };
export const MOODS: SampleMood[] = [4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 4, 2, 1].map((quadrant, i) => ({ quadrant, date: dayAfter(EXAMPLE_DAY, i - 13), tags: [1, 3].includes(quadrant) ? ["Poor sleep", "Work"] : quadrant === 4 ? ["Walk", "Good sleep"] : ["Friends"] }));
export function observations(entries: SampleMood[]) {
  const tags = [...new Set(entries.flatMap(e => e.tags))];
  return tags.flatMap(tag => {
    const days = new Map(entries.filter(e => e.tags.includes(tag)).map(e => [e.date, e]));
    if (days.size < 3) return [];
    const low = [...days.values()].filter(e => e.quadrant === 1 || e.quadrant === 3).length;
    return [`On ${low} of ${days.size} days tagged ${tag.toLowerCase()}, a tense or low mood was also logged.`];
  });
}
export type SampleMedicine = { id: string; name: string; amount: string; form: string; summary: string; time: string; start: string; schedule: Schedule; supply?: number };
export const MEDICINES: SampleMedicine[] = [
  { id: "gel", name: "Oestrogen gel", amount: "2 pumps", form: "Gel", summary: "Every day", time: "08:00", start: "2026-10-01", schedule: { kind: "daily" }, supply: 22 },
  { id: "capsule", name: "Progesterone", amount: "1 capsule", form: "Tablet or capsule", summary: "12 days on, in every 28 · day 5", time: "21:30", start: "2026-10-08", schedule: { kind: "cycle", on: 12, length: 28 } },
  { id: "pessary", name: "Vaginal oestrogen", amount: "1 pessary", form: "Pessary", summary: "Mon and Thu, after a 2-week start-up", time: "22:00", start: "2026-09-01", schedule: { kind: "startup", dailyDays: 14, days: [1, 4] } },
  { id: "supplement", name: "Magnesium", amount: "1 tablet", form: "Supplement", summary: "Every day", time: "19:00", start: "2026-10-01", schedule: { kind: "daily" } },
  { id: "device", name: "Hormonal IUD", amount: "", form: "Device", summary: "Replacement due March 2029", time: "", start: "2026-01-01", schedule: { kind: "device", due: "2029-03-12" } },
];
export const MEDICINE_NOTE = "Reminders only. Enter things exactly as your prescriber or the label says. Lumenera never suggests medicines or doses. If you miss a dose, check the leaflet or ask your pharmacist.";
export const REFLECTION_NOTE = "Patterns are for your own reflection, not a diagnosis. You know your life best. If low days are sticking around, your GP is a good person to talk to.";
export const TRACKING_REWARDS = { mood: 2, medicine: 0, quiz: 3 } as const;
export const PERSONAL_TRACKING_ENABLED = false;

export function downloadExample(format: "json" | "csv") {
  const data = { example: true, reference_date: EXAMPLE_DAY, moods: MOODS, medicines: MEDICINES };
  const csv = ["Example data — not personal health records", "date,quadrant,tags", ...MOODS.map(m => `${m.date},${m.quadrant},"${m.tags.join("; ")}"`)].join("\n");
  const url = URL.createObjectURL(new Blob([format === "json" ? JSON.stringify(data, null, 2) : csv], { type: format === "json" ? "application/json" : "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = `pause-in-play-examples.${format}`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}