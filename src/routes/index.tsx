import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookHeart, Brush, Heart, HeartHandshake, Lock, MessageCircleHeart, NotebookPen, Scale, Sparkle, UserPlus, Users } from "lucide-react";
import { PanelBadge } from "@/components/mm/Panel";
import { Sprout } from "@/components/mm/Sprout";
import { AddToHomeCard } from "@/components/mm/AddToHomeCard";
import { GardenScene } from "@/components/mm/Garden";
import { ChoiceGlyph, SproutMic, type ChoiceIcon } from "@/components/mm/icons";
import { getLevel } from "@/lib/levels";
import { useRewards } from "@/lib/rewards";
import { Today } from "@/components/mm/Today";
import { TrackingGlyph } from "@/components/mm/TrackingShared";
import { SectionWheel, panelId, readSavedSection } from "@/components/SectionWheel";
import { ACTIVITIES, SECTIONS, type Activity } from "@/content/sections";

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

const CHOICE = new Set(["quest", "tabs", "win", "wind", "laugh", "vit"]);
const TRACK = new Set(["mood", "medicines", "cycle", "learn"]);
const LUCIDE = { colour: Brush, wyr: Scale, reflect: NotebookPen, talk: MessageCircleHeart, kindly: Sparkle, partner: HeartHandshake, ilearn: BookHeart, pals: Users, invite: UserPlus } as const;

function ActivityIcon({ icon }: { icon: string }) {
  if (CHOICE.has(icon)) return <ChoiceGlyph name={icon as ChoiceIcon} />;
  if (TRACK.has(icon)) return <TrackingGlyph name={icon as "mood"} />;
  if (icon === "voice") return <SproutMic className="size-7 text-sage" />;
  const I = LUCIDE[icon as keyof typeof LUCIDE] ?? Sparkle;
  return <I className="size-7 text-plum" aria-hidden="true" />;
}

function useGreeting() {
  const [g, setG] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return g;
}

function Tile({ a }: { a: Activity }) {
  const { favourites, toggleFavourite } = useRewards();
  const on = favourites.includes(a.key);
  const body = (
    <>
      <div className={`mb-1 grid size-[46px] place-items-center rounded-[15px] ${a.blob}`}><ActivityIcon icon={a.icon} /></div>
      <b className="pr-8 font-display text-[15.5px] leading-tight">{a.title}</b>
      <span className="text-[12.5px] leading-snug text-muted-foreground">{a.to ? a.desc : `${a.desc} · Coming soon`}</span>
    </>
  );
  const cls = "flex h-full min-w-0 flex-col gap-1.5 rounded-[20px] border border-line bg-card p-3.5 text-left shadow-soft";
  return (
    <div className="relative min-w-0">
      {a.to ? <Link to={a.to} className={`lift ${cls}`}>{body}</Link> : <div className={`${cls} opacity-75`}>{body}</div>}
      <button
        type="button"
        aria-label={on ? `Remove ${a.title} from favourites` : `Add ${a.title} to favourites`}
        aria-pressed={on}
        onClick={() => toggleFavourite(a.key, a.title)}
        className="press absolute right-1 top-1 grid size-11 place-items-center rounded-full text-rose"
      >
        <Heart key={String(on)} className={`size-5 ${on ? "animate-heart-pop fill-current" : ""}`} aria-hidden="true" />
      </button>
    </div>
  );
}

function Home() {
  const { petals, favourites } = useRewards();
  const greeting = useGreeting();
  const L = getLevel(petals);
  const [selected, setSelected] = useState("favourites");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setSelected(readSavedSection(SECTIONS)); setMounted(true); }, []);
  const section = SECTIONS.find((s) => s.key === selected) ?? SECTIONS[0]!;
  const keys = section.key === "favourites" ? favourites : section.activities;
  const items = keys.map((k) => ACTIVITIES[k]).filter((a): a is Activity => !!a);

  return (
    <>
      <div>
        <p className="eyebrow">{greeting}</p>
        <h1>What do you need right now?</h1>
      </div>
      <Today />

      {mounted ? <SectionWheel sections={SECTIONS} selected={selected} onSelect={setSelected} /> : <div className="h-[178px]" aria-hidden="true" />}

      <section id={panelId} role="tabpanel" aria-labelledby={`tab-${section.key}`} className="flex flex-col gap-2.5">
        <div>
          <h2 className="font-display text-lg">{section.name}</h2>
          <p className="text-sm text-muted-foreground">{section.blurb}</p>
        </div>
        {section.lockLine && <p className="flex items-start gap-2 rounded-2xl bg-sunk p-3 text-xs text-muted-foreground"><Lock className="mt-0.5 size-3.5 shrink-0 text-plum" aria-hidden="true" />{section.lockLine}</p>}
        {section.palsStrip && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-gold-soft p-3 text-sm">
            <Users className="size-5 shrink-0 text-plum" aria-hidden="true" />
            <p className="min-w-0 flex-1">You choose exactly what each PeriPal sees, and you can pause or remove anyone at any time.</p>
          </div>
        )}
        {items.length ? (
          <div className="grid grid-cols-2 gap-2.5">{items.map((a) => <Tile key={a.key} a={a} />)}</div>
        ) : (
          <p className="mm-card p-[18px] text-sm text-muted-foreground">Nothing here yet. Tap the heart on any activity and it will live here, ready when you need it.</p>
        )}
      </section>

      <Link to="/sprout" className="lift flex min-w-0 items-center gap-3 rounded-tile border border-line bg-sage-soft p-3.5 shadow-soft">
        <Sprout size={48} mood="wave" />
        <span className="flex min-w-0 flex-1 flex-col">
          <b className="font-display text-base">Ask Sprout</b>
          <span className="text-xs leading-snug text-muted-foreground">Answers come only from the Pause and Play library, clinically reviewed.</span>
        </span>
        <span className="text-sm font-bold text-plum">Chat →</span>
      </Link>

      <Link to="/garden" className="mm-card lift overflow-hidden">
        <div className="flex h-[112px] items-end overflow-hidden" inert aria-hidden="true"><div className="w-full [&_[role=status]]:hidden"><GardenScene petals={petals} /></div></div>
        <div className="flex flex-col gap-2 px-[18px] pb-4 pt-3">
          <div className="flex items-baseline justify-between gap-2 text-[13px] text-muted-foreground">
            <b className="font-display text-[17px] text-ink">{L.name}</b>
            <span>{L.next ? `${L.next.remaining} petals to ${L.next.name}` : "Top level"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-sunk" role="progressbar" aria-label={L.next ? `Progress to ${L.next.name}` : "Top level reached"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(L.pct * 100)}>
            <i className="petal-bar block h-full rounded-full" style={{ width: `${Math.round(L.pct * 100)}%` }} />
          </div>
          <span className="text-sm font-bold text-plum">Your garden and badges →</span>
        </div>
      </Link>

      <Link to="/panel" className="flex min-h-11 items-center gap-2.5 rounded-2xl border border-line bg-card px-3.5 py-2 text-sm shadow-soft">
        <PanelBadge size={30} />
        <span className="min-w-0 flex-1">Developed with our clinical advisory panel</span>
        <b className="text-plum">Meet the panel →</b>
      </Link>
      <AddToHomeCard />
    </>
  );
}
