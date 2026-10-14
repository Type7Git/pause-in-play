import { useEffect, useState } from "react";
import { FIG } from "@/lib/move-figures";

const VARS = "[--fig:var(--mm-plum-2)] [--fig-torso:var(--mm-plum)] [--fig-far:color-mix(in_srgb,var(--mm-plum-2)_42%,var(--mm-card))] [--fig-prop:color-mix(in_srgb,var(--mm-line)_70%,var(--mm-plum-soft))] [--fig-mat:var(--mm-sage-soft)] [--fig-floor:var(--mm-line)] [&_svg]:block [&_svg]:h-full [&_svg]:w-full";

export const hasFigure = (name: string) => FIG.has(name);

/** Small still thumbnail (middle frame). */
export function MoveThumb({ name }: { name: string }) {
  if (!FIG.has(name)) return null;
  return <span aria-hidden="true" className={`block h-12 w-[52px] shrink-0 overflow-hidden rounded-[10px] bg-sunk ${VARS}`} dangerouslySetInnerHTML={{ __html: FIG.frame(FIG.M[name]![1], name) }} />;
}

/** Three frames that cycle like a GIF; tap a frame to pause on it, tap again to resume. */
export function MoveStrip({ name }: { name: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { setI(0); setPaused(false); }, [name]);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % 3), 1100);
    return () => clearInterval(t);
  }, [paused, name]);
  const frames = FIG.M[name];
  if (!frames) return null;
  return (
    <div role="group" aria-label={`${name}: three steps showing the movement`} className={`grid grid-cols-3 gap-1.5 ${VARS}`}>
      {frames.map((p, k) => (
        <button
          key={k}
          type="button"
          aria-label={`Step ${k + 1}`}
          aria-pressed={paused && i === k}
          onClick={() => { if (paused && i === k) setPaused(false); else { setPaused(true); setI(k); } }}
          className={`relative min-w-0 overflow-hidden rounded-[14px] border-[1.5px] transition-all duration-300 ${i === k ? `-translate-y-0.5 bg-card opacity-100 shadow-soft ${paused ? "border-gold" : "border-plum"}` : "border-line bg-sunk opacity-50"}`}
        >
          <span className="block aspect-[12/11]" dangerouslySetInnerHTML={{ __html: FIG.frame(p, name) }} />
          <span className="absolute left-[7px] top-1 text-[11px] font-extrabold text-muted-foreground">{k + 1}</span>
        </button>
      ))}
    </div>
  );
}
