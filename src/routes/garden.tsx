import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/mm/BackButton";
import { GardenScene } from "@/components/mm/Garden";
import { BadgeGlyphShape } from "@/components/mm/icons";
import { getLevel } from "@/lib/levels";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "Your garden and badges · Pause in Play" },
      { name: "description", content: "See your garden grow, your level and every badge you've earned. No streaks, no penalties." },
      { property: "og:title", content: "Your garden and badges · Pause in Play" },
      { property: "og:description", content: "Petals come from using the tools. No streaks, no penalties for missed days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GardenPage,
});

function GardenPage() {
  const { petals, badges } = useRewards();
  const L = getLevel(petals);
  return (
    <>
      <BackButton />
      <div>
        <p className="eyebrow">Your garden</p>
        <h1>Your garden and badges</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Petals come from using the tools, logging, playing and checking in with your PeriPals. No streaks, no penalties for missed days.</p>
      </div>
      <section className="mm-card overflow-hidden">
        <GardenScene petals={petals} />
        <div className="flex flex-col gap-2 px-[18px] pb-4 pt-3.5">
          <div className="flex items-baseline justify-between gap-2 text-[13px] text-muted-foreground">
            <b className="font-display text-[17px] text-ink">{L.name}</b>
            <span>{L.next ? `${L.next.remaining} petals to ${L.next.name}` : "Top level"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-sunk" role="progressbar" aria-label={L.next ? `Progress to ${L.next.name}` : "Top level reached"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(L.pct * 100)}>
            <i className="petal-bar block h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.round(L.pct * 100)}%` }} />
          </div>
        </div>
      </section>
      <section className="mm-card flex flex-col gap-3 p-[18px]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Badges</h2>
          <span className="text-sm text-muted-foreground">{badges.filter((b) => b.earned).length} of {badges.length}</span>
        </div>
        <ul className="grid grid-cols-3 gap-x-2 gap-y-3" aria-label="Badge medallions">
          {badges.map((b) => (
            <li key={b.name} aria-label={`${b.name} medallion, ${b.earned ? "earned" : "not earned yet"}`} className={`flex flex-col items-center gap-1.5 text-center text-xs leading-tight ${b.earned ? "font-bold text-ink" : "text-muted-foreground"}`}>
              <svg viewBox="0 0 56 56" aria-hidden="true" className="size-[52px]">
                {b.earned ? (
                  <>
                    <path d="M18 42l-4 12 8-3 4 5 2-14zM38 42l4 12-8-3-4 5-2-14z" fill="var(--mm-rose)" />
                    <circle cx="28" cy="27" r="20" fill="var(--mm-gold)" />
                    <circle cx="28" cy="27" r="15.5" fill="var(--mm-gold-soft)" />
                  </>
                ) : (
                  <circle cx="28" cy="27" r="20" fill="none" stroke="var(--mm-line)" strokeWidth="2" strokeDasharray="4 4" />
                )}
                <g style={{ color: b.earned ? "var(--mm-gold)" : "var(--mm-line)" }}><BadgeGlyphShape glyph={b.glyph} /></g>
              </svg>
              {b.name}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
