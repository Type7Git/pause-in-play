/** Pure garden helpers: thirst, daily weeds and honest "top X%" wording. */
import { plantStages } from "./levels";

/** Back row: once the front row is in full bloom (70 petals) a second row keeps coming up, finishing around 200. */
export const backStages = (petals: number) => plantStages(Math.max(0, petals - 70) / 2);

/** Garden layout in picture units (340 x 190). Front row first, then the back row (slots 7-13). */
export const BASE = 168;
export const BACK_BASE = 150;
export const SLOTS: [number, number][] = [[40, 56], [82, 76], [124, 50], [166, 86], [208, 62], [250, 80], [292, 54]];
export const BACK: [number, number][] = [[61, 44], [229, 50], [145, 40], [313, 46], [103, 52], [187, 46], [20, 42]];

/** Spout tip of the watering can, relative to where it's held, at a given tilt (degrees). */
export function spoutTip(deg: number) {
  const r = (deg * Math.PI) / 180;
  return { x: 24 * Math.cos(r) + 14 * Math.sin(r), y: 24 * Math.sin(r) - 14 * Math.cos(r) };
}
export const CAN_REST = 38;
export const CAN_TIP = 72;

/** Every plant that has come up, with where its head is. */
export function plantSpots(petals: number) {
  const front = plantStages(petals);
  const back = backStages(petals);
  const out: { slot: number; x: number; top: number; stage: number }[] = [];
  SLOTS.forEach(([x, h], i) => { const st = front[i] ?? 0; if (st) out.push({ slot: i, x, stage: st, top: BASE - (st === 1 ? h * 0.4 : st === 2 ? h * 0.8 : h) }); });
  BACK.forEach(([x, h], j) => { const st = back[j] ?? 0; if (st) out.push({ slot: j + 7, x, stage: st, top: BACK_BASE - (st === 1 ? h * 0.4 : st === 2 ? h * 0.8 : h) }); });
  return out;
}

/** The plant nearest a point along the ground, if it's close enough to reach. */
export function nearestPlant(petals: number, x: number, reach = 22) {
  let best: ReturnType<typeof plantSpots>[number] | null = null;
  for (const p of plantSpots(petals)) if (Math.abs(p.x - x) <= reach && (!best || Math.abs(p.x - x) < Math.abs(best.x - x))) best = p;
  return best;
}
export function nearestWeed(weeds: number[], x: number, reach = 18) {
  let best: number | null = null;
  for (const w of weeds) if (Math.abs(w - x) <= reach && (best === null || Math.abs(w - x) < Math.abs(best - x))) best = w;
  return best;
}

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
      ? "Yours is one of the very first gardens in Lumenera. Thank you for being here early."
      : `Yours is one of the first ${s.gardens} gardens growing in Lumenera. Thank you for being here early.`;
  if (s.top !== null) return `Your garden is in the top ${s.top}% of Lumenera gardens. Keep up the lovely work.`;
  return `You're growing alongside ${(s.gardens - 1).toLocaleString("en-AU")} other gardens. Every petal counts, at your own pace.`;
}

export function badgeShareLine(s: Standing | null | undefined, key: string): string | null {
  if (!s || s.gardens < MIN_GARDENS) return null;
  const n = s.badgeShare[key] ?? 0;
  const pct = (n / s.gardens) * 100;
  if (pct < 1) return "Fewer than 1 in 100 gardens have this badge so far. That's a rare one.";
  return `${Math.round(pct)}% of Lumenera gardens have this badge.`;
}
