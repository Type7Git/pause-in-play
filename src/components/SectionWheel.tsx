import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Activity, Brain, ChevronLeft, ChevronRight, ClipboardList, Flower2, Heart, HeartHandshake, Sparkles, Users } from "lucide-react";
import type { Section } from "@/content/sections";

const ICONS = { heart: Heart, brain: Brain, calm: Flower2, play: Sparkles, love: HeartHandshake, pals: Users, track: ClipboardList, body: Activity } as const;
export const HOME_SECTION_KEY = "midlife-mind:home-section";

export function readSavedSection(sections: Section[]) {
  try {
    const v = localStorage.getItem(HOME_SECTION_KEY);
    if (v && sections.some((s) => s.key === v)) return v;
  } catch {}
  return "favourites";
}
function saveSection(key: string) {
  try { localStorage.setItem(HOME_SECTION_KEY, key); } catch {}
}

export const panelId = "section-panel";

export function SectionWheel({ sections, selected, onSelect }: { sections: Section[]; selected: string; onSelect: (key: string) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [centre, setCentre] = useState(() => Math.max(0, sections.findIndex((s) => s.key === selected)));
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const paint = useCallback(() => {
    const el = scroller.current;
    if (!el) return 0;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bestD = Infinity;
    cards.current.forEach((c, i) => {
      if (!c) return;
      const w = c.offsetWidth || 1;
      const d = Math.min(2, Math.abs(c.offsetLeft + w / 2 - mid) / w);
      const sign = c.offsetLeft + w / 2 < mid ? 1 : -1;
      c.style.transform = `scale(${1 - 0.12 * d})${reduced ? "" : ` rotateY(${sign * Math.min(14, d * 14)}deg)`}`;
      c.style.opacity = String(Math.max(0.2, 1 - 0.26 * d));
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }, [reduced]);

  const scrollTo = useCallback((i: number, smooth = true) => {
    const el = scroller.current, c = cards.current[i];
    if (!el || !c) return;
    el.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - el.clientWidth / 2, behavior: smooth && !reduced ? "smooth" : "auto" });
  }, [reduced]);

  useEffect(() => { scrollTo(centre, false); paint(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onScroll = () => {
    const i = paint();
    setCentre(i);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const key = sections[i]!.key;
      saveSection(key);
      onSelect(key);
    }, 160);
  };

  const go = (i: number) => {
    const n = (i + sections.length) % sections.length;
    scrollTo(n);
    cards.current[n]?.focus({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
  };

  return (
    <div className="-mx-5 flex flex-col gap-2">
      <div
        ref={scroller}
        role="tablist"
        aria-label="Sections"
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-56px)] py-2 [perspective:600px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((s, i) => {
          const Icon = ICONS[s.icon as keyof typeof ICONS] ?? Sparkles;
          const sel = s.key === selected;
          return (
            <button
              key={s.key}
              ref={(el) => { cards.current[i] = el; }}
              role="tab"
              id={`tab-${s.key}`}
              aria-selected={sel}
              aria-controls={panelId}
              tabIndex={i === centre ? 0 : -1}
              onClick={() => { scrollTo(i); if (reduced) onSelect(s.key); }}
              onKeyDown={(e) => onKey(e, i)}
              className="flex w-[112px] shrink-0 snap-center flex-col items-center gap-2 text-center transition-opacity"
            >
              <span className={`grid size-[88px] place-items-center rounded-[26px] border-2 shadow-soft ${s.blob} ${sel ? "border-plum" : "border-transparent"}`}>
                <Icon className="size-9 text-plum" aria-hidden="true" />
              </span>
              <span className={`text-[13px] leading-tight ${sel ? "font-bold text-ink" : "text-muted-foreground"}`}>{s.name}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button type="button" aria-label="Previous section" onClick={() => go(centre - 1)} className="press grid size-11 place-items-center rounded-full border border-line bg-card text-plum"><ChevronLeft className="size-5" /></button>
        <div className="flex gap-1.5" aria-hidden="true">
          {sections.map((s, i) => <i key={s.key} className={`block h-2 rounded-full transition-all ${i === centre ? "w-5 bg-plum" : "w-2 bg-line"}`} />)}
        </div>
        <button type="button" aria-label="Next section" onClick={() => go(centre + 1)} className="press grid size-11 place-items-center rounded-full border border-line bg-card text-plum"><ChevronRight className="size-5" /></button>
      </div>
    </div>
  );
}
