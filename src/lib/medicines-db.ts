/** The medicine list from the team's Admin (table `medicines`), falling back to the built-in starter list. */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MEDICINES, type Form, type MedTag, type Medicine, type Pattern, type Schedule } from "@/content/medicines";

const PATTERNS: Pattern[] = ["daily", "weekdays", "everyN", "cycle", "startup", "device", "asNeeded", "course"];
export function toSchedule(v: unknown): Schedule {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const pattern = PATTERNS.includes(o["pattern"] as Pattern) ? (o["pattern"] as Pattern) : "daily";
  const strs = (x: unknown) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === "string") : undefined);
  const num = (x: unknown) => (typeof x === "number" && x > 0 ? x : undefined);
  const s: Schedule = { pattern };
  const times = strs(o["times"]); if (times?.length) s.times = times;
  const days = strs(o["days"]); if (days?.length) s.days = days;
  for (const k of ["every", "on", "off", "startupDays", "replaceMonths", "courseDays"] as const) { const n = num(o[k]); if (n) s[k] = n; }
  if (typeof o["note"] === "string" && o["note"]) s.note = o["note"];
  return s;
}

/** Approved medicines from Admin, plus any starter medicines the team hasn't changed. */
export function useMedicineList() {
  return useQuery({
    queryKey: ["medicine-list"],
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<Medicine[]> => {
      const { data, error } = await supabase.from("medicines").select("*").eq("status", "approved");
      if (error || !data?.length) return MEDICINES;
      const fromAdmin: Medicine[] = data.map((r) => ({ id: r.id, name: r.name, alsoCalled: r.also_called ?? [], form: r.form as Form, tags: (r.tags ?? []) as MedTag[], schedule: toSchedule(r.default_schedule) }));
      const ids = new Set(fromAdmin.map((m) => m.id));
      return [...fromAdmin, ...MEDICINES.filter((m) => !ids.has(m.id))];
    },
    placeholderData: MEDICINES,
  });
}

/** Send a medicine name the list doesn't have to the team, anonymously, so they can add it for everyone. */
export async function suggestMedicine(name: string, form: Form | null, forWhat: MedTag | null): Promise<boolean> {
  const clean = name.trim().replace(/\s+/g, " ").slice(0, 80);
  if (clean.length < 2) return false;
  const { error } = await supabase.from("medicine_suggestions").insert({ name: clean, form, for_what: forWhat });
  return !error;
}
