import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { PetalIcon } from "@/components/mm/icons";

export type BadgeGlyph = "leaf" | "flag" | "tab" | "star" | "glasses" | "key";
export type Badge = { name: string; earned: boolean; glyph: BadgeGlyph };

const DEFAULT_BADGES: Badge[] = [
  { name: "First seedling", earned: true, glyph: "leaf" },
  { name: "Side Quest Saver", earned: false, glyph: "flag" },
  { name: "Tab closer", earned: false, glyph: "tab" },
  { name: "Small victories", earned: false, glyph: "star" },
  { name: "Glasses detective", earned: false, glyph: "glasses" },
  { name: "VIT Department head", earned: false, glyph: "key" },
];
const KEY = "midlife-mind:rewards";

type Ctx = {
  petals: number;
  badges: Badge[];
  earn: (petals: number, message: string, badge?: string) => void;
};
const RewardsContext = createContext<Ctx | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [petals, setPetals] = useState(18);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.petals === "number") setPetals(s.petals);
        if (Array.isArray(s.badges))
          setBadges(DEFAULT_BADGES.map((b) => ({ ...b, earned: b.earned || s.badges.includes(b.name) })));
      }
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    localStorage.setItem(KEY, JSON.stringify({ petals, badges: badges.filter((b) => b.earned).map((b) => b.name) }));
  }, [petals, badges]);

  const earn = useCallback<Ctx["earn"]>((n, message, badge) => {
    setPetals((p) => p + n);
    let msg = `+${n} petals · ${message}`;
    setBadges((bs) => {
      const b = badge && bs.find((x) => x.name === badge);
      if (!b || b.earned) return bs;
      msg += ` · New badge: ${badge}`;
      return bs.map((x) => (x.name === badge ? { ...x, earned: true } : x));
    });
    queueMicrotask(() => setToast({ id: Date.now(), msg }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3000);
    burst();
  }, []);

  return (
    <RewardsContext.Provider value={{ petals, badges, earn }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="animate-rise fixed bottom-7 left-1/2 z-[9] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2.5 rounded-2xl bg-ink py-2.5 pl-3 pr-4 text-sm font-bold text-shell shadow-lift"
        >
          <PetalIcon className="size-[22px] flex-none" />
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
    Object.assign(b.style, {
      left: `${r.left + 18}px`, top: `${r.top + 16}px`, background: cols[i % 4], borderRadius: "50% 50% 50% 0",
    });
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
