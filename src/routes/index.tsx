import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PanelBadge } from "@/components/mm/Panel";
import { Sprout } from "@/components/mm/Sprout";
import { AddToHomeCard } from "@/components/mm/AddToHomeCard";
import { GardenScene } from "@/components/mm/Garden";
import { BadgeGlyphShape, ChoiceGlyph, type ChoiceIcon } from "@/components/mm/icons";
import { getLevel } from "@/lib/levels";
import { useRewards } from "@/lib/rewards";
import { Today } from "@/components/mm/Today";
import { TrackingGlyph } from "@/components/mm/TrackingShared";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pause and Play · What do you need right now?" },
      { name: "description", content: "A warm, playful self-care companion for women in perimenopause. Small skills, gentle encouragement." },
      { property: "og:title", content: "Pause and Play" },
      { property: "og:description", content: "Small skills and gentle encouragement for perimenopause brain days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Choice = { to: "/side-quest" | "/tabs" | "/little-win" | "/wind-down" | "/laugh" | "/remember" | "/mood" | "/medicines" | "/cycle" | "/learn"; icon: ChoiceIcon | "mood" | "medicines" | "cycle" | "learn"; title: string; desc: string; blob: string };

const GROUPS: { label: string; choices: Choice[] }[] = [
  {
    label: "Practical tools",
    choices: [
      { to: "/side-quest", icon: "quest", title: "What was I doing?", desc: "Save my place and the next step", blob: "bg-gold-soft" },
      { to: "/remember", icon: "vit", title: "Help me remember", desc: "The Very Important Thing Department", blob: "bg-rose-soft" },
    ],
  },
  {
    label: "Calming moments",
    choices: [
      { to: "/tabs", icon: "tabs", title: "My brain has 37 tabs open", desc: "A one-minute pause, then one thing", blob: "bg-plum-soft" },
      { to: "/wind-down", icon: "wind", title: "Help me wind down", desc: "Quiet, no scores", blob: "bg-plum-soft" },
    ],
  },
  {
    label: "Playful challenges",
    choices: [
      { to: "/little-win", icon: "win", title: "Give me a little win", desc: "A short, untimed puzzle", blob: "bg-sage-soft" },
      { to: "/laugh", icon: "laugh", title: "I need a laugh", desc: "An everyday scene to sort out", blob: "bg-gold-soft" },
    ],
  },
  {
    label: "Support & tracking",
    choices: [
      { to: "/mood", icon: "mood", title: "Mood Mapper", desc: "Two taps to log how you feel", blob: "bg-rose-soft" },
      { to: "/medicines", icon: "medicines", title: "Medicine Cabinet", desc: "Your reminders, your way", blob: "bg-plum-soft" },
      { to: "/cycle", icon: "cycle", title: "Cycle Tracker", desc: "Periods, spotting and symptoms", blob: "bg-rose-soft" },
      { to: "/learn", icon: "learn", title: "Learn", desc: "Videos, articles and quizzes", blob: "bg-sage-soft" },
    ],
  },
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
        <p className="mt-1.5 text-sm text-muted-foreground">
          Practical tools, calming moments and playful challenges for perimenopause and beyond.
        </p>
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


      <div className="grid grid-cols-2 gap-2.5">
        <Link to="/sprout" className="lift flex min-w-0 flex-col items-center gap-2 rounded-tile border border-line bg-sage-soft p-3.5 text-center shadow-soft">
          <Sprout size={48} mood="wave" />
          <b className="font-display text-base">Ask Sprout</b>
          <span className="text-xs leading-snug text-muted-foreground">Answers come only from the Pause and Play library, clinically reviewed</span>
          <span className="mt-auto text-sm font-bold text-plum">Chat →</span>
        </Link>
        <Link to="/erin" className="lift flex min-w-0 flex-col items-center gap-2 rounded-tile border border-line bg-card p-3.5 text-center shadow-soft">
          <PanelBadge size={56} />
          <b className="font-display text-base">Our clinical panel</b>
          <span className="text-xs leading-snug text-muted-foreground">Every tool is clinically reviewed</span>
          <span className="mt-auto text-sm font-bold text-plum">Meet the panel →</span>
        </Link>
      </div>
      <Today />
      <AddToHomeCard />

      {GROUPS.map((g) => (
        <section key={g.label} className="flex flex-col gap-2.5">
          <h2 className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground after:h-px after:flex-1 after:bg-line">
            {g.label}
          </h2>
          <div className="grid grid-cols-1 gap-2.5 min-[361px]:grid-cols-2">
            {g.choices.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="lift flex min-w-0 flex-col gap-1.5 rounded-[20px] border border-line bg-card p-3.5 text-left shadow-soft"
              >
                <div className={`mb-1 grid size-[46px] place-items-center rounded-[15px] ${c.blob}`}>
                  {c.icon === "mood" || c.icon === "medicines" || c.icon === "cycle" || c.icon === "learn" ? <TrackingGlyph name={c.icon} /> : <ChoiceGlyph name={c.icon} />}
                </div>
                <b className="font-display text-[15.5px] leading-tight">{c.title}</b>
                <span className="text-[12.5px] leading-snug text-muted-foreground">{c.desc}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}


      <section className="mm-card flex flex-col gap-3 p-[18px]">
        <div className="flex items-center justify-between">
          <h3>Badges</h3>
          <span className="text-sm text-muted-foreground">
            {badges.filter((b) => b.earned).length} of {badges.length}
          </span>
        </div>
        <ul className="grid grid-cols-3 gap-x-2 gap-y-3" aria-label="Badge medallions">
          {badges.map((b) => (
            <li
              key={b.name}
              aria-label={`${b.name} medallion, ${b.earned ? "earned" : "not earned yet"}`}
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
            </li>
          ))}
        </ul>
      </section>


    </>
  );
}
