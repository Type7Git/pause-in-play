/** The demo profile lives on this device only (localStorage). Nothing leaves the phone. */
import { useSyncExternalStore } from "react";
import { PERSONAS, blankProfile, type Profile } from "./content";

const KEY = "es:profile";
const PREV = "es:prev-stages";
type State = { profile: Profile; done: boolean; prevStages: string[] | null; ready: boolean; epoch: number };

let state: State = { profile: blankProfile(), done: false, prevStages: null, ready: true, epoch: 0 };
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw) as { profile?: Profile; done?: boolean };
      state = { profile: { ...blankProfile(), ...v.profile }, done: !!v.done, prevStages: null, ready: true, epoch: 0 };
    }
    const prev = localStorage.getItem(PREV);
    if (prev) state.prevStages = JSON.parse(prev) as string[];
  } catch { /* private window: keep in memory */ }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ profile: state.profile, done: state.done }));
    if (state.prevStages) localStorage.setItem(PREV, JSON.stringify(state.prevStages));
    else localStorage.removeItem(PREV);
  } catch { /* ignore */ }
}
function set(next: Partial<State>) {
  state = { ...state, ...next };
  save();
  subs.forEach((f) => f());
}

const SERVER: State = { profile: blankProfile(), done: false, prevStages: null, ready: false, epoch: 0 };
export function useEs(): State {
  return useSyncExternalStore(
    (f) => { load(); subs.add(f); return () => subs.delete(f); },
    () => { load(); return state; },
    () => SERVER,
  );
}
export const es = {
  get: () => { load(); return state; },
  patch: (p: Partial<Profile>) => set({ profile: { ...state.profile, ...p } }),
  finish: () => set({ done: true }),
  /** "Something's changed": remember the stages before editing so the home can respond with care. */
  snapshot: () => set({ prevStages: [...(state.profile.stages ?? [])] }),
  clearPrev: () => set({ prevStages: null }),
  persona: (k: string) => { const p = PERSONAS[k]; if (p) set({ profile: structuredClone(p.profile), done: true, prevStages: null, epoch: state.epoch + 1 }); },
  reset: () => set({ profile: blankProfile(), done: false, prevStages: null, epoch: state.epoch + 1 }),
};
