/** Sprout: a smiling seedling in a gold pot. Never Erin, never uses her image. */
export type SproutMood = "happy" | "thinking" | "caring" | "wave";

export function Sprout({ size = 64, mood = "happy", animate = true, className = "" }: { size?: number; mood?: SproutMood; animate?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      role="img"
      aria-label="Sprout, a smiling seedling in a little pot"
      className={`${animate ? "sprout-bob" : ""} shrink-0 overflow-visible ${className}`}
    >
      {/* leaves + stem */}
      <g className={animate ? "sprout-sway" : ""} style={{ transformOrigin: "50px 52px" }}>
        <path d="M50 54 C50 44 50 38 50 30" stroke="var(--mm-sage)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M50 34 C38 34 26 26 24 12 C38 10 49 20 50 34Z" fill="var(--mm-sage)" />
        <path d="M50 34 C62 32 74 22 76 8 C62 8 51 18 50 34Z" fill="var(--mm-sage)" />
        <path d="M50 33 C42 28 34 22 30 15" stroke="var(--mm-sage-soft)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".8" />
        <path d="M50 33 C58 27 66 20 70 12" stroke="var(--mm-sage-soft)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".8" />
        {mood === "wave" && <circle cx="80" cy="10" r="3" fill="var(--mm-gold)" className={animate ? "sprout-twinkle" : ""} />}
      </g>
      {/* pot */}
      <path d="M22 60 H78 L71 104 Q70 108 66 108 H34 Q30 108 29 104 Z" fill="var(--mm-gold)" />
      <path d="M26 60 H40 L36 108 H34 Q30 108 29 104Z" fill="#fff" opacity=".14" />
      <rect x="16" y="50" width="68" height="14" rx="7" fill="var(--mm-rose)" />
      <rect x="20" y="52" width="24" height="4" rx="2" fill="#fff" opacity=".3" />
      {/* face */}
      <g>
        {mood === "thinking" ? (
          <>
            <path d="M38 79 q4 -3 8 0" stroke="var(--mm-ink-fixed, #271F31)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M54 79 q4 -3 8 0" stroke="var(--mm-ink-fixed, #271F31)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="50" cy="92" r="3" fill="#271F31" />
          </>
        ) : (
          <>
            <g className={animate ? "sprout-blink" : ""} style={{ transformOrigin: "50px 79px" }}>
              <ellipse cx="41" cy="79" rx="4" ry="5" fill="#271F31" />
              <ellipse cx="59" cy="79" rx="4" ry="5" fill="#271F31" />
              <circle cx="42.5" cy="77" r="1.5" fill="#fff" />
              <circle cx="60.5" cy="77" r="1.5" fill="#fff" />
            </g>
            {mood === "caring" ? (
              <path d="M43 92 q7 4 14 0" stroke="#271F31" strokeWidth="3" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M41 89 q9 10 18 0 Z" fill="#271F31" />
            )}
          </>
        )}
        <ellipse cx="32" cy="88" rx="5" ry="3" fill="var(--mm-rose)" opacity=".55" />
        <ellipse cx="68" cy="88" rx="5" ry="3" fill="var(--mm-rose)" opacity=".55" />
      </g>
    </svg>
  );
}
