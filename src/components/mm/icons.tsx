import type { BadgeGlyph } from "@/lib/rewards";

export function PetalShape() {
  return (
    <>
      <g fill="var(--mm-gold)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="12" cy="6.5" rx="3.6" ry="5" transform={`rotate(${r} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="3" fill="var(--mm-rose)" />
    </>
  );
}

export function PetalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <PetalShape />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="15" fill="var(--mm-gold-soft)" />
      <rect x="7.5" y="10" width="3.6" height="12" rx="1.8" fill="var(--mm-plum)" />
      <rect x="13" y="10" width="3.6" height="12" rx="1.8" fill="var(--mm-plum-2)" />
      <path
        d="M19.5 10.6v10.8a.9.9 0 0 0 1.4.75l7.6-5.4a.9.9 0 0 0 0-1.5l-7.6-5.4a.9.9 0 0 0-1.4.75z"
        fill="var(--mm-gold)"
      />
    </svg>
  );
}

export type ChoiceIcon = "quest" | "tabs" | "win" | "wind" | "laugh" | "vit";

export function ChoiceGlyph({ name }: { name: ChoiceIcon }) {
  const p = { viewBox: "0 0 32 32", "aria-hidden": true, className: "size-[26px]" } as const;
  switch (name) {
    case "quest":
      return (
        <svg {...p}>
          <rect x="7" y="5" width="16" height="22" rx="3" fill="var(--mm-card)" stroke="var(--mm-gold)" strokeWidth="2" />
          <path d="M11 11h8M11 15h8M11 19h5" stroke="var(--mm-gold)" strokeWidth="2" strokeLinecap="round" />
          <path d="M21 3v10l3-2 3 2V3z" fill="var(--mm-rose)" />
        </svg>
      );
    case "tabs":
      return (
        <svg {...p}>
          <rect x="4" y="9" width="24" height="17" rx="3" fill="var(--mm-card)" stroke="var(--mm-plum-2)" strokeWidth="2" />
          <path d="M4 13h24" stroke="var(--mm-plum-2)" strokeWidth="2" />
          <rect x="6" y="5" width="7" height="5" rx="1.5" fill="var(--mm-plum-2)" />
          <rect x="14" y="5" width="7" height="5" rx="1.5" fill="var(--mm-plum-2)" opacity=".6" />
          <rect x="22" y="5" width="5" height="5" rx="1.5" fill="var(--mm-plum-2)" opacity=".35" />
        </svg>
      );
    case "win":
      return (
        <svg {...p}>
          <path d="M16 4l3.4 7 7.6 1.1-5.5 5.3 1.3 7.6L16 21.4 9.2 25l1.3-7.6L5 12.1l7.6-1.1z" fill="var(--mm-sage)" />
          <circle cx="16" cy="15" r="3" fill="var(--mm-card)" />
        </svg>
      );
    case "wind":
      return (
        <svg {...p}>
          <path d="M24 19.5A9.5 9.5 0 0 1 12.5 7 9.5 9.5 0 1 0 24 19.5z" fill="var(--mm-plum-2)" />
          <circle cx="23" cy="8" r="1.4" fill="var(--mm-gold)" />
          <circle cx="27" cy="13" r="1" fill="var(--mm-gold)" />
        </svg>
      );
    case "laugh":
      return (
        <svg {...p}>
          <circle cx="16" cy="17" r="11" fill="var(--mm-gold)" />
          <circle cx="12" cy="7.5" r="3.4" fill="none" stroke="var(--mm-ink)" strokeWidth="1.8" />
          <circle cx="20" cy="7.5" r="3.4" fill="none" stroke="var(--mm-ink)" strokeWidth="1.8" />
          <path d="M15.4 7.5h1.2" stroke="var(--mm-ink)" strokeWidth="1.8" />
          <path d="M11 19c1.4 3 3 4 5 4s3.6-1 5-4" stroke="var(--mm-ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1.3" fill="var(--mm-ink)" />
          <circle cx="20" cy="15" r="1.3" fill="var(--mm-ink)" />
        </svg>
      );
    case "vit":
      return (
        <svg {...p}>
          <rect x="5" y="8" width="18" height="18" rx="3" fill="var(--mm-card)" stroke="var(--mm-rose)" strokeWidth="2" />
          <path d="M5 13h18" stroke="var(--mm-rose)" strokeWidth="2" />
          <circle cx="21" cy="20" r="5" fill="var(--mm-card)" stroke="var(--mm-plum-2)" strokeWidth="2.2" />
          <path d="M24.5 23.5l3.5 3.5" stroke="var(--mm-plum-2)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export function BadgeGlyphShape({ glyph }: { glyph: BadgeGlyph }) {
  const s = { stroke: "currentColor", strokeWidth: 2.2, fill: "none" } as const;
  switch (glyph) {
    case "leaf":
      return (
        <>
          <path d="M26 34c0-8 6-12 12-12 0 8-5 12-12 12z" fill="currentColor" />
          <path d="M26 34l6-6" stroke="var(--mm-card)" strokeWidth="1.5" />
        </>
      );
    case "flag":
      return (
        <>
          <path d="M23 20v16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M24 20h11l-3 4 3 4H24z" fill="currentColor" />
        </>
      );
    case "tab":
      return (
        <>
          <rect x="19" y="23" width="18" height="12" rx="2" {...s} />
          <rect x="21" y="19" width="7" height="5" rx="1" fill="currentColor" />
        </>
      );
    case "star":
      return <path d="M28 18l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L28 32.4l-5.6 2.9 1.1-6.2-4.5-4.4 6.2-.9z" fill="currentColor" />;
    case "glasses":
      return (
        <>
          <circle cx="23" cy="28" r="4.5" {...s} />
          <circle cx="33" cy="28" r="4.5" {...s} />
          <path d="M27.5 28h1" {...s} />
        </>
      );
    case "key":
      return (
        <>
          <circle cx="23" cy="27" r="4.5" {...s} />
          <path d="M27.5 27H37M33 27v4M36 27v3" {...s} strokeLinecap="round" />
        </>
      );
  }
}
