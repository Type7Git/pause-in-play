import type { ReactNode } from "react";
import { erin } from "@/content/erin";
import { cn } from "@/lib/utils";

/** Erin's small circular photo. `size` is the rendered diameter in px. */
export function ErinAvatar({ size = 56, alt = erin.avatarAlt, className }: { size?: number; alt?: string; className?: string }) {
  return (
    <img
      src={erin.avatar}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-full object-cover object-top", className)}
    />
  );
}

/** One-line note under a tool, with Erin's 30px photo. */
export function WhyThisHelps({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 rounded-[18px] border border-line bg-sunk px-3.5 py-3 text-[12.5px] leading-snug text-muted-foreground">
      <ErinAvatar size={30} />
      <span>
        <b className="font-display text-[13px] text-ink">Why this helps · {erin.name}</b>
        <br />
        {children}
      </span>
    </p>
  );
}

/** "Recorded by Erin" label used on the wind-down sessions. */
export function RecordedByErin({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-2.5 text-[12.5px] leading-snug text-muted-foreground", className)}>
      <ErinAvatar size={30} />
      <span>
        <b className="font-display text-[13px] text-ink">Recorded by {erin.name}</b>
        <br />
        {erin.role}
      </span>
    </p>
  );
}
