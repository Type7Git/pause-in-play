import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ErinAvatar } from "@/components/mm/Erin";
import { GardenScene } from "@/components/mm/Garden";
import { BadgeGlyphShape, ChoiceGlyph, type ChoiceIcon } from "@/components/mm/icons";
import { erin } from "@/content/erin";
import { getLevel } from "@/lib/levels";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Midlife Mind · What do you need right now?" },
      { name: "description", content: "A warm, playful self-care companion for women in perimenopause. Small skills, gentle encouragement." },
      { property: "og:title", content: "Midlife Mind" },
      { property: "og:description", content: "Small skills and gentle encouragement for perimenopause brain days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const CHOICES: { to: "/side-quest" | "/tabs" | "/little-win" | "/wind-down" | "/laugh" | "/remember"; icon: ChoiceIcon; title: string; desc: string; blob: string }[] = [
  { to: "/side-quest", icon: "quest", title: "What was I doing?", desc: "Save my place and the next step", blob: "bg-gold-soft" },
  { to: "/tabs", icon: "tabs", title: "My brain has 37 tabs open", desc: "A one-minute pause, then one thing", blob: "bg-plum-soft" },
  { to: "/little-win", icon: "win", title: "Give me a little win", desc: "A short, untimed puzzle", blob: "bg-sage-soft" },
  { to: "/wind-down", icon: "wind", title: "Help me wind down", desc: "Quiet, no scores", blob: "bg-plum-soft" },
  { to: "/laugh", icon: "laugh", title: "I need a laugh", desc: "An everyday scene to sort out", blob: "bg-gold-soft" },
  { to: "/remember", icon: "vit", title: "Help me remember", desc: "The Very Important Thing Department", blob: "bg-rose-soft" },
];

function useGreeting() {
  const [g, setG] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return g;
}

function Home() {
  const { petals, badges } = useRewards();
  const greeting = useGreeting();
  const L = getLevel(petals);

  return (
    <>
      <div>
        <p className="eyebrow">{greeting}</p>
        <h1>What do you need right now?</h1>
      </div>

      <div className="grid grid-cols-1 gap-2.5 min-[361px]:grid-cols-2">
        {CHOICES.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="lift flex min-w-0 flex-col gap-1.5 rounded-[20px] border border-line bg-card p-3.5 text-left shadow-soft"
          >
            <div className={`mb-1 grid size-[46px] place-items-center rounded-[15px] ${c.blob}`}>
              <ChoiceGlyph name={c.icon} />
            </div>
            <b className="font-display text-[15.5px] leading-tight">{c.title}</b>
            <span className="text-[12.5px] leading-snug text-muted-foreground">{c.desc}</span>
          </Link>
        ))}
      </div>

      <section className="mm-card overflow-hidden">
        <GardenScene petals={petals} />
        <div className="flex flex-col gap-2 px-[18px] pb-4 pt-3.5">
          <div className="flex items-baseline justify-between gap-2 text-[13px] text-muted-foreground">
            <b className="font-display text-[17px] text-ink">{L.name}</b>
            <span>{L.next ? `${L.next.remaining} petals to ${L.next.name}` : "Top level"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-sunk">
            <i className="petal-bar block h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.round(L.pct * 100)}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">Every small act of looking after yourself grows your garden.</p>
        </div>
      </section>

      <section className="mm-card flex flex-col gap-3 p-[18px]">
        <div className="flex items-center justify-between">
          <h3>Badges</h3>
          <span className="text-sm text-muted-foreground">
            {badges.filter((b) => b.earned).length} of {badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-2 gap-y-3">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`flex flex-col items-center gap-1.5 text-center text-xs leading-tight ${b.earned ? "font-bold text-ink" : "text-muted-foreground"}`}
            >
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
                <g style={{ color: b.earned ? "var(--mm-gold)" : "var(--mm-line)" }}>
                  <BadgeGlyphShape glyph={b.glyph} />
                </g>
              </svg>
              {b.name}
              <span className="sr-only">{b.earned ? "(earned)" : "(locked)"}</span>
            </div>
          ))}
        </div>
      </section>

      <Link
        to="/erin"
        className="lift flex items-center gap-3 rounded-[22px] border border-line bg-card p-[18px] text-left shadow-soft"
      >
        <ErinAvatar size={56} />
        <span className="min-w-0">
          <b className="font-display text-[15.5px] leading-tight">Created by {erin.name}</b>
          <span className="block text-[12.5px] text-muted-foreground">{erin.role} · read her note</span>
        </span>
      </Link>
    </>
  );
}
