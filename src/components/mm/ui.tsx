import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const pill = cva(
  "press inline-flex items-center justify-center gap-2 rounded-full font-bold disabled:cursor-default disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-plum text-shell shadow-soft",
        ghost: "border-[1.5px] border-line bg-card text-plum",
        sage: "bg-sage text-shell shadow-soft",
      },
      size: { md: "px-5 py-3", sm: "px-3.5 py-2 text-sm" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Pill({ variant, size, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof pill>) {
  return <button className={cn(pill({ variant, size }), className)} {...p} />;
}

export function Card({ className, children, as: As = "section", ...p }: { className?: string; children: ReactNode; as?: "section" | "form" } & Record<string, unknown>) {
  return (
    <As className={cn("mm-card flex min-w-0 flex-col gap-3 p-[18px]", className)} {...p}>
      {children}
    </As>
  );
}

export function Chip({ pressed, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "rounded-full border-[1.5px] border-line bg-card px-3.5 py-[7px] text-sm text-ink transition-colors aria-pressed:border-plum aria-pressed:bg-plum-soft aria-pressed:font-bold",
        className,
      )}
      {...p}
    />
  );
}

export function Field({ label, ...p }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-bold text-muted-foreground">
      {label}
      <input
        className="w-full min-w-0 rounded-[14px] border-[1.5px] border-line bg-sunk px-3.5 py-[11px] text-base font-normal text-ink placeholder:text-muted-foreground/75"
        {...p}
      />
    </label>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <li className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-sunk px-3.5 py-3">{children}</li>;
}

export function ScreenTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Muted({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

/** List persisted to localStorage (read after hydration). */
export function useStoredList<T>(key: string, seed: T[]) {
  const [list, setList] = useState<T[]>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setList(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(list));
  }, [key, list, ready]);
  return [list, setList] as const;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
