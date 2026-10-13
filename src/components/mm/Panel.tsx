import panelLogo from "@/assets/panel-logo.png";
import type { ReactNode } from "react";

/**
 * The clinical advisory panel badge — replaces the former clinician avatar
 * everywhere the app used to show a small photo.
 */
export function PanelBadge({ size = 30, alt = "Pause and Play clinical advisory panel", className }: { size?: number; alt?: string; className?: string }) {
  return (
    <img
      src={panelLogo}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={className}
    />
  );
}

/** One-line note under a tool, signed by the clinical team. */
export function WhyThisHelps({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-[18px] border border-line bg-sunk px-3.5 py-3 text-[12.5px] leading-snug text-muted-foreground">
      <PanelBadge size={30} />
      <span>
        <b className="font-display text-[13px] text-ink">Why this helps</b>
        <br />
        {children}
        <br />
        <span className="text-[11.5px]">Pause and Play clinical team · reviewed by our clinical advisory panel</span>
      </span>
    </p>
  );
}
