import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type Context } from "react";
import type { User } from "@supabase/supabase-js";
import { PetalIcon } from "@/components/mm/icons";
import { SaveGardenDialog } from "@/components/mm/SaveGardenDialog";
import { supabase } from "@/integrations/supabase/client";
import { sendDueReminders } from "@/lib/push.functions";

export type BadgeGlyph = "leaf" | "flag" | "tab" | "star" | "glasses" | "key" | "palette" | "crown" | "heart";
export type Badge = { key: string; name: string; earned: boolean; glyph: BadgeGlyph };
export type Quest = { id: string; doing: string; next: string; remindAt: string | null };
export type VitItem = { id: string; thing: string; location: string; example?: boolean };

export const BADGES: Omit<Badge, "earned">[] = [
  { key: "first_seedling", name: "First seedling", glyph: "leaf" },
  { key: "side_quest_saver", name: "Side Quest Saver", glyph: "flag" },
  { key: "tab_closer", name: "Tab closer", glyph: "tab" },
  { key: "small_victories", name: "Small victories", glyph: "star" },
  { key: "glasses_detective", name: "Glasses detective", glyph: "glasses" },
  { key: "vit_head", name: "VIT Department head", glyph: "key" },
  { key: "calm_colourist", name: "Calm colourist", glyph: "palette" },
  { key: "decisive_queen", name: "Decisive queen", glyph: "crown" },
  { key: "moving_gently", name: "Moving gently", glyph: "leaf" },
  { key: "peripal", name: "PeriPal", glyph: "heart" },
];
const keyFor = (name: string) => BADGES.find((b) => b.name === name)?.key;

const SEED_VIT: VitItem[] = [
  { id: "ex-1", thing: "Passport", location: "Top drawer, under the tea towels", example: true },
  { id: "ex-2", thing: "Spare house key", location: "Blue mug on the bookshelf", example: true },
  { id: "ex-3", thing: "Car", location: "Westfield, level 3, near the lifts", example: true },
];

/* ---------- signed-out storage (this device only) ---------- */
const LOCAL = "midlife-mind:local-v2";
const PROMPTED = "midlife-mind:save-prompted";
export const DEFAULT_FAVOURITES = ["quest", "tabs", "colour"];
type Local = { petals: number; badges: string[]; quests: Quest[]; vit: VitItem[]; favourites: string[]; dirty: boolean };
const freshLocal = (): Local => ({ petals: 18, badges: ["first_seedling"], quests: [], vit: SEED_VIT, favourites: DEFAULT_FAVOURITES, dirty: false });
function readLocal(): Local {
  try {
    const raw = localStorage.getItem(LOCAL);
    if (raw) return { ...freshLocal(), ...JSON.parse(raw) };
  } catch {}
  return freshLocal();
}
const writeLocal = (l: Local) => localStorage.setItem(LOCAL, JSON.stringify(l));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

/* ---------- account storage ---------- */
async function loadRemote() {
  const [p, b, q, v, f] = await Promise.all([
    supabase.from("petal_events").select("amount"),
    supabase.from("badges_earned").select("badge_key"),
    supabase.from("side_quests").select("id, doing, next_step, remind_at").is("done_at", null).order("created_at", { ascending: false }),
    supabase.from("vit_items").select("id, thing, location").order("created_at", { ascending: false }),
    supabase.from("user_favourites").select("activity_key").order("position"),
  ]);
  return {
    hasEvents: (p.data?.length ?? 0) > 0,
    petals: (p.data ?? []).reduce((s, r) => s + r.amount, 0),
    badges: (b.data ?? []).map((r) => r.badge_key),
    quests: (q.data ?? []).map((r) => ({ id: r.id, doing: r.doing, next: r.next_step ?? "", remindAt: r.remind_at })),
    vit: (v.data ?? []).map((r) => ({ id: r.id, thing: r.thing, location: r.location })),
    favourites: (f.data ?? []).map((r) => r.activity_key),
  };
}

/** Copy this device's garden into the account, then clear the local copy. */
async function migrateLocal(userId: string, local: Local) {
  if (local.petals > 0) await supabase.from("petal_events").insert({ user_id: userId, amount: local.petals, reason: "Brought over from this device" });
  if (local.badges.length)
    await supabase.from("badges_earned").upsert(local.badges.map((k) => ({ user_id: userId, badge_key: k })), { onConflict: "user_id,badge_key", ignoreDuplicates: true });
  if (local.quests.length)
    await supabase.from("side_quests").insert(local.quests.map((q) => ({ user_id: userId, doing: q.doing, next_step: q.next || null, remind_at: q.remindAt })));
  const realVit = local.vit.filter((v) => !v.example);
  if (realVit.length) await supabase.from("vit_items").insert(realVit.map((v) => ({ user_id: userId, thing: v.thing, location: v.location })));
  if (local.favourites.length)
    await supabase.from("user_favourites").upsert(local.favourites.map((k, i) => ({ user_id: userId, activity_key: k, position: i })), { onConflict: "user_id,activity_key", ignoreDuplicates: true });
  localStorage.removeItem(LOCAL);
}

type Ctx = {
  ready: boolean;
  user: User | null;
  petals: number;
  badges: Badge[];
  quests: Quest[];
  vit: VitItem[];
  earn: (petals: number, message: string, badge?: string) => void;
  addQuest: (q: Omit<Quest, "id">) => void;
  completeQuest: (id: string) => void;
  addVit: (thing: string, location: string) => number;
  removeVit: (id: string) => void;
  favourites: string[];
  toggleFavourite: (key: string, title: string) => void;
  openSave: () => void;
};
// Keep one context instance across hot reloads so provider and consumers always match.
const g = globalThis as unknown as { __pnpRewardsCtx?: Context<Ctx | null> };
const RewardsContext = (g.__pnpRewardsCtx ??= createContext<Ctx | null>(null));

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [petals, setPetals] = useState(18);
  const [earned, setEarned] = useState<string[]>(["first_seedling"]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [vit, setVit] = useState<VitItem[]>(SEED_VIT);
  const [favourites, setFavourites] = useState<string[]>(DEFAULT_FAVOURITES);
  const favRef = useRef<string[]>(DEFAULT_FAVOURITES);
  useEffect(() => { favRef.current = favourites; }, [favourites]);
  const [toast, setToast] = useState<{ id: number; msg: string; heart?: boolean } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const userRef = useRef<User | null>(null);
  const loadedFor = useRef<string | null | undefined>(undefined);
  const earnedRef = useRef<string[]>(["first_seedling"]);
  useEffect(() => { earnedRef.current = earned; }, [earned]);

  const applyLocal = () => {
    const l = readLocal();
    setPetals(l.petals); setEarned(l.badges); setQuests(l.quests); setVit(l.vit); setFavourites(l.favourites);
  };

  const hydrate = useCallback(async (u: User | null) => {
    const id = u?.id ?? null;
    if (loadedFor.current === id) return;
    loadedFor.current = id;
    userRef.current = u;
    setUser(u);
    if (!u) { applyLocal(); setReady(true); return; }
    try {
      let r = await loadRemote();
      const local = readLocal();
      if (local.dirty || (!r.hasEvents && localStorage.getItem(LOCAL))) {
        await migrateLocal(u.id, local);
        r = await loadRemote();
      } else if (!r.hasEvents) {
        // Brand-new account on a fresh device: plant the first seedling.
        await supabase.from("badges_earned").upsert({ user_id: u.id, badge_key: "first_seedling" }, { onConflict: "user_id,badge_key", ignoreDuplicates: true });
        await supabase.from("user_favourites").upsert(DEFAULT_FAVOURITES.map((k, i) => ({ user_id: u.id, activity_key: k, position: i })), { onConflict: "user_id,activity_key", ignoreDuplicates: true });
        r = await loadRemote();
      }
      setPetals(r.petals); setEarned(r.badges); setQuests(r.quests); setVit(r.vit); setFavourites(r.favourites);
      // Deliver any due Side Quest nudges to this user's devices.
      void sendDueReminders().catch(() => {});
    } catch (e) {
      console.error(e);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
        if (event === "SIGNED_IN") setSaveOpen(false);
        setTimeout(() => void hydrate(session?.user ?? null), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [hydrate]);

  /** Signed-out changes go to this device. */
  const local = (fn: (l: Local) => Local) => {
    if (userRef.current) return;
    writeLocal({ ...fn(readLocal()), dirty: true });
  };

  const earn = useCallback<Ctx["earn"]>((n, message, badge) => {
    const u = userRef.current;
    const bkey = badge ? keyFor(badge) : undefined;
    setPetals((p) => p + n);
    let msg = `+${n} petals · ${message}`;
    if (bkey && !earnedRef.current.includes(bkey)) {
      msg += ` · New badge: ${badge}`;
      earnedRef.current = [...earnedRef.current, bkey];
      setEarned(earnedRef.current);
    }
    if (u) {
      void supabase.from("petal_events").insert({ user_id: u.id, amount: n, reason: message.slice(0, 120) });
      if (bkey) void supabase.from("badges_earned").upsert({ user_id: u.id, badge_key: bkey }, { onConflict: "user_id,badge_key", ignoreDuplicates: true });
    } else {
      writeLocal((() => { const l = readLocal(); return { ...l, petals: l.petals + n, badges: bkey && !l.badges.includes(bkey) ? [...l.badges, bkey] : l.badges, dirty: true }; })());
      if (!localStorage.getItem(PROMPTED)) {
        localStorage.setItem(PROMPTED, "1");
        setTimeout(() => setSaveOpen(true), 1800);
      }
    }
    queueMicrotask(() => setToast({ id: Date.now(), msg }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
    burst();
  }, []);

  const addQuest: Ctx["addQuest"] = (q) => {
    const u = userRef.current;
    const tmp = { ...q, id: uid() };
    setQuests((l) => [tmp, ...l]);
    if (u) {
      void supabase.from("side_quests").insert({ user_id: u.id, doing: q.doing, next_step: q.next || null, remind_at: q.remindAt }).select("id").single()
        .then(({ data }) => data && setQuests((l) => l.map((x) => (x.id === tmp.id ? { ...x, id: data.id } : x))));
    } else local((l) => ({ ...l, quests: [tmp, ...l.quests] }));
  };

  const completeQuest: Ctx["completeQuest"] = (id) => {
    setQuests((l) => l.filter((x) => x.id !== id));
    if (userRef.current) void supabase.from("side_quests").update({ done_at: new Date().toISOString() }).eq("id", id);
    else local((l) => ({ ...l, quests: l.quests.filter((x) => x.id !== id) }));
  };

  const addVit: Ctx["addVit"] = (thing, location) => {
    const u = userRef.current;
    const tmp = { id: uid(), thing, location };
    const count = vit.length + 1;
    setVit((l) => [tmp, ...l]);
    if (u) {
      void supabase.from("vit_items").insert({ user_id: u.id, thing, location }).select("id").single()
        .then(({ data }) => data && setVit((l) => l.map((x) => (x.id === tmp.id ? { ...x, id: data.id } : x))));
    } else local((l) => ({ ...l, vit: [tmp, ...l.vit] }));
    return count;
  };

  const removeVit: Ctx["removeVit"] = (id) => {
    setVit((l) => l.filter((x) => x.id !== id));
    if (userRef.current) void supabase.from("vit_items").delete().eq("id", id);
    else local((l) => ({ ...l, vit: l.vit.filter((x) => x.id !== id) }));
  };

  const toggleFavourite: Ctx["toggleFavourite"] = (key, title) => {
    const u = userRef.current;
    const on = favRef.current.includes(key);
    const next = on ? favRef.current.filter((k) => k !== key) : [...favRef.current, key];
    favRef.current = next;
    setFavourites(next);
    if (u) {
      if (on) void supabase.from("user_favourites").delete().eq("user_id", u.id).eq("activity_key", key);
      else void supabase.from("user_favourites").insert({ user_id: u.id, activity_key: key, position: next.length - 1 });
    } else local((l) => ({ ...l, favourites: next }));
    setToast({ id: Date.now(), msg: on ? "Removed from Favourites" : `${title} added to Favourites`, heart: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2500);
  };

  const badges = BADGES.map((b) => ({ ...b, earned: earned.includes(b.key) }));

  return (
    <RewardsContext.Provider value={{ ready, user, petals, badges, quests, vit, earn, addQuest, completeQuest, addVit, removeVit, favourites, toggleFavourite, openSave: () => setSaveOpen(true) }}>
      {children}
      <SaveGardenDialog open={saveOpen} onOpenChange={setSaveOpen} />
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="animate-rise fixed bottom-7 left-1/2 z-[9] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2.5 rounded-2xl bg-ink py-2.5 pl-3 pr-4 text-sm font-bold text-shell shadow-lift"
        >
          {toast.heart ? <span aria-hidden="true" className="text-rose">♥</span> : <PetalIcon className="size-[22px] flex-none" />}
          <span>{toast.msg}</span>
        </div>
      )}
    </RewardsContext.Provider>
  );
}

function burst() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.getElementById("petal-meter");
  if (!el) return;
  const r = el.getBoundingClientRect();
  const cols = ["var(--mm-gold)", "var(--mm-rose)", "var(--mm-plum-2)", "var(--mm-sage)"];
  for (let i = 0; i < 10; i++) {
    const b = document.createElement("i");
    b.className = "animate-fly pointer-events-none fixed z-10 h-3.5 w-2.5";
    Object.assign(b.style, { left: `${r.left + 18}px`, top: `${r.top + 16}px`, background: cols[i % 4], borderRadius: "50% 50% 50% 0" });
    const a = (Math.PI * 2 * i) / 10;
    b.style.setProperty("--dx", `${Math.cos(a) * 60}px`);
    b.style.setProperty("--dy", `${Math.sin(a) * 60 + 20}px`);
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 950);
  }
}

export function useRewards() {
  const c = useContext(RewardsContext);
  if (!c) throw new Error("useRewards must be used inside RewardsProvider");
  return c;
}

/** Turn a "Nudge me" choice into a time. */
export function remindAtFor(choice: string, now = new Date()): string | null {
  if (choice === "In 10 min") return new Date(now.getTime() + 10 * 60_000).toISOString();
  if (choice === "In 30 min") return new Date(now.getTime() + 30 * 60_000).toISOString();
  if (choice === "Tonight") {
    const t = new Date(now);
    t.setHours(20, 0, 0, 0);
    if (t <= now) t.setTime(now.getTime() + 60 * 60_000);
    return t.toISOString();
  }
  return null;
}
