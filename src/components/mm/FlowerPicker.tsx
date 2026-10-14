import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { FLOWERS, MAX_FLOWERS, type FlowerKey } from "@/content/garden";
import { FlowerHead } from "./Garden";

export function FlowerPreview({ k, className = "size-12" }: { k: FlowerKey; className?: string }) {
  return (
    <svg viewBox="-18 -18 36 44" aria-hidden="true" className={className}>
      <path d="M0 26 C -2 18, 2 10, 0 0" stroke="var(--mm-sage)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M0 18 q9 -7 13 -2 q-6 7 -13 2z" fill="var(--mm-sage)" />
      <FlowerHead k={k} x={0} y={0} />
    </svg>
  );
}

/** Choose which flowers grow. Several can be picked; the garden cycles through them. */
export function FlowerPicker({ open, initial, onClose, onSave }: { open: boolean; initial: FlowerKey[]; onClose: () => void; onSave: (keys: FlowerKey[]) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [picked, setPicked] = useState<FlowerKey[]>(initial);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { setPicked(initial); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open, initial]);
  const toggle = (k: FlowerKey) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : p.length >= MAX_FLOWERS ? p : [...p, k]));

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="flower-picker-title"
      className="m-auto max-h-[calc(100dvh-24px)] w-[min(420px,calc(100%-24px))] rounded-[22px] border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-3.5 p-4">
        <div>
          <p className="eyebrow">Your garden, your way</p>
          <h2 id="flower-picker-title" className="font-display text-[22px] font-bold leading-tight">Choose your flowers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick as many as you like, up to {MAX_FLOWERS}. Each one carries its own little message when you tap it.</p>
        </div>
        <ul className="grid grid-cols-3 gap-2">
          {FLOWERS.map((f) => {
            const on = picked.includes(f.key);
            return (
              <li key={f.key}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(f.key)}
                  className={`press relative flex h-full w-full flex-col items-center gap-1 rounded-2xl border-2 px-1.5 pb-2 pt-1.5 text-center ${on ? "border-plum bg-plum-soft" : "border-line bg-sunk"}`}
                >
                  {on && <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-plum text-shell"><Check className="size-3.5" aria-hidden="true" /></span>}
                  <FlowerPreview k={f.key} className={`size-14 ${on ? "garden-pop" : ""}`} />
                  <b className="font-display text-[14px] leading-tight">{f.name}</b>
                  <span className="text-[11.5px] leading-tight text-muted-foreground">{f.meaning}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground" aria-live="polite">{picked.length} of {MAX_FLOWERS} chosen</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="min-h-11 rounded-full px-4 text-sm font-bold text-muted-foreground">Not now</button>
            <button
              type="button"
              disabled={!picked.length}
              onClick={() => onSave(picked)}
              className="press min-h-11 rounded-full bg-plum px-5 text-sm font-bold text-shell disabled:opacity-40"
            >
              Plant these
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
