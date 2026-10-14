/** Pure garden helpers: thirst, daily weeds and honest "top X%" wording. */
import { plantStages } from "./levels";

/** Back row: once the front row is in full bloom (70 petals) a second row keeps coming up, finishing around 200. */
export const backStages = (petals: number) => plantStages(Math.max(0, petals - 70) / 2);

export const MIN_GARDENS = 25;
const BUCKETS = [1, 2, 5, 10, 15, 20, 25, 30, 40, 50];

/** 0 fresh, 1 a little thirsty (2+ days), 2 very thirsty (5+ days). Never worse than that: nothing dies. */
export function thirstLevel(lastCareAt: number | null, now = Date.now()): 0 | 1 | 2 {
  if (lastCareAt === null) return 0;
  const days = (now - lastCareAt) / 864e5;
  return days >= 5 ? 2 : days >= 2 ? 1 : 0;
}

/** Where today's weeds pop up (same all day, different tomorrow). */
export const WEED_SPOTS = [61, 103, 145, 187, 229, 271, 18, 322];
export function weedsFor(day: string, count = 2): number[] {
  let h = 0;
  for (const c of day) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pool = [...WEED_SPOTS];
  const out: number[] = [];
  while (out.length < count && pool.length) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(pool.splice(h % pool.length, 1)[0]!);
  }
  return out;
}
export const today = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Rounded "top X%" for a garden, or null when it isn't in the top half (we never shame a garden). */
export function topPercent(totals: number[], mine: number): number | null {
  if (totals.length < MIN_GARDENS) return null;
  const above = totals.filter((t) => t > mine).length;
  const raw = Math.max(1, Math.ceil(((above + 1) / totals.length) * 100));
  return BUCKETS.find((b) => b >= raw) ?? null;
}

export type Standing = { gardens: number; top: number | null; badgeShare: Record<string, number> };

export function standingLine(s: Standing | null | undefined): string | null {
  if (!s || s.gardens < 1) return null;
  if (s.gardens < MIN_GARDENS)
    return s.gardens <= 1
      ? "Yours is one of the very first gardens in Pause in Play. Thank you for being here early."
      : `Yours is one of the first ${s.gardens} gardens growing in Pause in Play. Thank you for being here early.`;
  if (s.top !== null) return `Your garden is in the top ${s.top}% of Pause in Play gardens. Keep up the lovely work.`;
  return `You're growing alongside ${(s.gardens - 1).toLocaleString("en-AU")} other gardens. Every petal counts, at your own pace.`;
}

export function badgeShareLine(s: Standing | null | undefined, key: string): string | null {
  if (!s || s.gardens < MIN_GARDENS) return null;
  const n = s.badgeShare[key] ?? 0;
  const pct = (n / s.gardens) * 100;
  if (pct < 1) return "Fewer than 1 in 100 gardens have this badge so far. That's a rare one.";
  return `${Math.round(pct)}% of Pause in Play gardens have this badge.`;
}
