/** 37 tabs: what's on her mind, kept on this device. Closing a tab moves it to the basket; nothing is lost unless she empties it. */
import type { VitItem } from "./rewards";

export type MindTab = { id: string; text: string; note?: string | undefined; vitId?: string | undefined; done?: boolean | undefined; closedAt?: number | undefined };
export type TabState = { open: MindTab[]; basket: MindTab[]; clearedVit: string[] };

const KEY = "pip:tabs";
const EMPTY: TabState = { open: [], basket: [], clearedVit: [] };
const uid = () => (typeof globalThis.crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export function readTabs(): TabState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<TabState>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
export function writeTabs(s: TabState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
}

export const addTab = (s: TabState, text: string): TabState => {
  const t = text.trim().slice(0, 80);
  if (!t || s.open.some((x) => x.text.toLowerCase() === t.toLowerCase())) return s;
  return { ...s, open: [...s.open, { id: uid(), text: t }] };
};

export const closeTab = (s: TabState, id: string, done = false): TabState => {
  const t = s.open.find((x) => x.id === id);
  if (!t) return s;
  return { ...s, open: s.open.filter((x) => x.id !== id), basket: [{ ...t, done, closedAt: Date.now() }, ...s.basket] };
};

export const restoreTab = (s: TabState, id: string): TabState => {
  const t = s.basket.find((x) => x.id === id);
  if (!t) return s;
  return { ...s, basket: s.basket.filter((x) => x.id !== id), open: [...s.open, { ...t, done: undefined, closedAt: undefined }] };
};

export const restoreAll = (s: TabState): TabState => ({ ...s, basket: [], open: [...s.open, ...s.basket.map((t) => ({ ...t, done: undefined, closedAt: undefined }))] });

/** Remove one item from the basket for good (a remembered item stays in Help me remember, just not here). */
export const removeTab = (s: TabState, id: string): TabState => {
  const t = s.basket.find((x) => x.id === id);
  if (!t) return s;
  return { ...s, basket: s.basket.filter((x) => x.id !== id), clearedVit: t.vitId ? [...new Set([...s.clearedVit, t.vitId])] : s.clearedVit };
};

/** Emptying the basket forgets typed tabs for good; Help me remember items stay in that list and don't come back here. */
export const emptyBasket = (s: TabState): TabState => ({ ...s, basket: [], clearedVit: [...new Set([...s.clearedVit, ...s.basket.flatMap((t) => (t.vitId ? [t.vitId] : []))])] });

/** Bring in anything new from Help me remember, and drop items that were removed there. */
export function syncVit(s: TabState, vit: VitItem[]): TabState {
  const real = vit.filter((v) => !v.example);
  const ids = new Set(real.map((v) => v.id));
  const known = new Set([...s.open, ...s.basket].flatMap((t) => (t.vitId ? [t.vitId] : [])).concat(s.clearedVit));
  const keep = (t: MindTab) => !t.vitId || ids.has(t.vitId);
  const fresh = real.filter((v) => !known.has(v.id)).map((v): MindTab => ({ id: uid(), text: v.thing, note: v.location, vitId: v.id }));
  return { ...s, open: [...s.open.filter(keep), ...fresh], basket: s.basket.filter(keep) };
}
