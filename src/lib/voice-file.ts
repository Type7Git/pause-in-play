/** Shared, browser-safe shapes for "Tell Sprout" voice filing. */
export type Remind = "none" | "10min" | "30min" | "tonight";
export type Filed =
  | { type: "quest" | "vit" | "unsure"; doing: string; next_step: string; remind: Remind; thing: string; location: string }
  | { type: "crisis"; text: string }
  | { type: "error"; text: string };

export const REMIND_LABEL: Record<Remind, string> = { none: "No reminder", "10min": "In 10 min", "30min": "In 30 min", tonight: "Tonight" };

const cap = (s: unknown, max: number) => {
  const t = typeof s === "string" ? s.trim().slice(0, max) : "";
  return t ? t[0]!.toUpperCase() + t.slice(1) : "";
};

/** Turn whatever the model returned into safe fields; anything odd becomes "unsure". */
export function sanitiseFiled(raw: unknown): Filed {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const remind: Remind = ["none", "10min", "30min", "tonight"].includes(o["remind"] as string) ? (o["remind"] as Remind) : "none";
  const f = {
    doing: cap(o["doing"], 300), next_step: cap(o["next_step"], 300), remind,
    thing: cap(o["thing"], 200), location: cap(o["location"], 300),
  };
  let type = o["type"] === "quest" || o["type"] === "vit" ? o["type"] : "unsure";
  if (type === "quest" && !f.doing) type = "unsure";
  if (type === "vit" && (!f.thing || !f.location)) type = "unsure";
  return { type, ...f };
}
