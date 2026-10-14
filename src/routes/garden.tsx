import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/mm/BackButton";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Share2, Users } from "lucide-react";
import { GardenPlay } from "@/components/mm/GardenPlay";
import { BadgeDialog, BadgeMedal } from "@/components/mm/BadgeDialog";
import { getLevel } from "@/lib/levels";
import { useRewards, type Badge } from "@/lib/rewards";
import { gardenStanding } from "@/lib/garden.functions";
import { standingLine } from "@/lib/garden";
import { ShareSheet } from "@/components/mm/ShareSheet";
import { renderCard, svgImage } from "@/lib/share-cards";
import { shareOrigin, type SharePayload } from "@/lib/share";

const SEEN = "pip:badges-seen";

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
  const { ready, petals, badges } = useRewards();
  const L = getLevel(petals);
  const [open, setOpen] = useState<Badge | null>(null);
  const [sharing, setSharing] = useState<SharePayload | null>(null);
  const shareGarden = () => setSharing({
    title: "My garden",
    text: `My Pause in Play garden is at ${L.name}. Every petal is a small act of looking after myself.`,
    palText: `🌸 My garden just reached ${L.name} in Pause in Play.`,
    url: shareOrigin(),
    fileName: "my-garden.png",
    image: async () => {
      const el = document.querySelector<SVGSVGElement>('section[aria-label="Your garden"] svg');
      const art = el ? await svgImage(el, [".garden-flutter", ".garden-buzz", ".garden-drift", ".garden-drift-fast", ".garden-flash", ".garden-rain", ".garden-gust", ".garden-soak", ".garden-pour", ".garden-dirt", ".mm-ring", '[data-spot="tool"]']) : null;
      return renderCard({ eyebrow: "My garden", title: L.name, body: `${petals} petals, each one a small act of looking after myself.`, art, artShape: "wide", tint: "#E6F1E9" });
    },
  });
  const [seen, setSeen] = useState<string[] | null>(null);
  useEffect(() => {
    try { setSeen(JSON.parse(localStorage.getItem(SEEN) ?? "[]") as string[]); } catch { setSeen([]); }
  }, []);
  const standing = useQuery({
    queryKey: ["garden-standing", petals],
    queryFn: () => gardenStanding({ data: { petals } }),
    enabled: ready,
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
  const line = standingLine(standing.data);
  const openBadge = (b: Badge) => {
    setOpen(b);
    if (b.earned && seen && !seen.includes(b.key)) {
      const next = [...seen, b.key];
      setSeen(next);
      try { localStorage.setItem(SEEN, JSON.stringify(next)); } catch { /* fine */ }
    }
  };
  return (
    <>
      <BackButton />
      <div>
        <p className="eyebrow">Your garden</p>
        <h1>Your garden and badges</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Petals come from using the tools, logging, playing and checking in with your PeriPals. No streaks, no penalties for missed days.</p>
      </div>
      <section className="mm-card overflow-hidden pb-[18px]" aria-label="Your garden">
        <GardenPlay />
        <div className="flex flex-col gap-2 px-[18px] pt-4">
          <div className="flex items-baseline justify-between gap-2 text-[13px] text-muted-foreground">
            <b className="font-display text-[17px] text-ink">{L.name}</b>
            <span>{L.next ? `${L.next.remaining} petals to ${L.next.name}` : "Top level"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-sunk" role="progressbar" aria-label={L.next ? `Progress to ${L.next.name}` : "Top level reached"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(L.pct * 100)}>
            <i className="petal-bar block h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.round(L.pct * 100)}%` }} />
          </div>
          <button type="button" onClick={shareGarden} className="press mt-1.5 flex min-h-11 items-center justify-center gap-2 self-start rounded-full border-[1.5px] border-line bg-card px-4 text-sm font-bold text-plum">
            <Share2 className="size-4" aria-hidden="true" />Share my garden
          </button>
        </div>
      </section>
      <section className="mm-card flex flex-col gap-3 p-[18px]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Badges</h2>
          <span className="text-sm text-muted-foreground">{badges.filter((b) => b.earned).length} of {badges.length}</span>
        </div>
        <p className="-mt-1.5 text-[13px] text-muted-foreground">Tap a badge to see why it matters.</p>
        <ul className="grid grid-cols-3 gap-x-2 gap-y-3" aria-label="Badge medallions">
          {badges.map((b) => {
            const fresh = b.earned && seen !== null && !seen.includes(b.key);
            return (
              <li key={b.key}>
                <button
                  type="button"
                  onClick={() => openBadge(b)}
                  aria-label={`${b.name}, ${b.earned ? "earned" : "not earned yet"}${fresh ? ", new" : ""}`}
                  className={`press relative flex w-full flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-center text-xs leading-tight hover:bg-sunk ${b.earned ? "font-bold text-ink" : "text-muted-foreground"}`}
                >
                  <span className={`rounded-full ${fresh ? "badge-new" : ""}`}><BadgeMedal badge={b} /></span>
                  {fresh && <span className="absolute right-1.5 top-1 rounded-full bg-rose px-1.5 py-px text-[10px] font-bold text-shell">New</span>}
                  {b.name}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      {line && (
        <section className="flex items-center gap-3 rounded-2xl border border-line bg-plum-soft p-3.5 text-sm font-bold leading-snug text-plum">
          <Users className="size-5 shrink-0" aria-hidden="true" />
          <p>{line}</p>
        </section>
      )}
      <BadgeDialog badge={open} standing={standing.data} onClose={() => setOpen(null)} />
      <ShareSheet open={!!sharing} payload={sharing} onClose={() => setSharing(null)} />
    </>
  );
}
