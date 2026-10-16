/** The Lumenera menu and its pages: Guide, Quick tools, Lume Lounge, Lume Library, Profile and account. */
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Compass, Heart, LayoutGrid, Search, UserRound, Users, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIcon } from "@/components/mm/ActivityIcon";
import { Item as PublishedItem } from "@/components/mm/PublishedLearn";
import type { LearnItem } from "@/components/mm/AdminSections";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/lib/rewards";
import { Chevron, Flower, ItemArt, Ring, SpaceArt } from "./art";
import { FORMAT_LABEL, HUBS, LIBRARY, type Format, type HubId } from "./content";
import { personal } from "./engine";
import { GUIDE_GROUPS, guideEntries, searchGuide } from "./guide";
import { es, useEs } from "./store";
import { CATEGORIES, TOOL, readRecent, type Category } from "./tools";
import { PersonaButtons } from "./ui";

const MENU: { to: string; title: string; sub: string; icon: ReactNode }[] = [
  { to: "/guide", title: "Guide", sub: "Everything in Lumenera, explained", icon: <Compass className="size-5" aria-hidden="true" /> },
  { to: "/tools", title: "Quick tools", sub: "All your everyday tools in one place", icon: <LayoutGrid className="size-5" aria-hidden="true" /> },
  { to: "/pals", title: "Lume Lounge", sub: "Check in with the people in your corner", icon: <Users className="size-5" aria-hidden="true" /> },
  { to: "/library", title: "Lume Library", sub: "Articles, videos, audio and quizzes", icon: <BookOpen className="size-5" aria-hidden="true" /> },
  { to: "/profile", title: "Profile and account", sub: "Your answers, account and membership", icon: <UserRound className="size-5" aria-hidden="true" /> },
];

/** The Lumenera menu button: a little flower with three lines, top right of home and every space. */
export function MenuButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="menu-btn" aria-label="Lumenera menu" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
        <span className="sr">Menu</span>
      </button>
      {open ? (
        <>
          <button type="button" className="scrim dim" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav className="lum-menu" aria-label="Lumenera menu">
            <div className="lum-menu-head"><span className="brand"><Flower size={30} still /><b>Lumenera</b></span><button type="button" className="iconbtn" aria-label="Close menu" onClick={() => setOpen(false)}><X className="size-5" aria-hidden="true" /></button></div>
            {MENU.map((m, i) => (
              <Link key={m.to} to={m.to} className="lum-menu-row" style={{ animationDelay: `${0.03 + i * 0.04}s` }} onClick={() => setOpen(false)}>
                <span className="ico">{m.icon}</span>
                <span className="tx"><b>{m.title}</b><span>{m.sub}</span></span>
                <Chevron />
              </Link>
            ))}
          </nav>
        </>
      ) : null}
    </>
  );
}

/* ---------- category visuals and tool rows, shared with home ---------- */
export function CategoryArt({ c }: { c: Category }) {
  if (c.art.hub) return <SpaceArt id={c.art.hub} />;
  const icon = c.art.icon === "recent" ? <Clock className="size-8 text-plum" aria-hidden="true" /> : c.art.icon === "heart" ? <Heart className="size-8 fill-current text-plum" aria-hidden="true" /> : <ActivityIcon icon={c.art.icon ?? ""} className="size-8" />;
  return <span className="cat-icon">{icon}</span>;
}
export function toolsInCategory(c: Category, favourites: string[], recent: string[]) {
  const keys = c.id === "recent" ? recent : c.id === "fav" ? favourites : c.tools;
  return keys.map((k) => TOOL[k]).filter((t) => !!t?.to);
}
export function ToolRows({ keys }: { keys: ReturnType<typeof toolsInCategory> }) {
  const { favourites, toggleFavourite } = useRewards();
  return (
    <div className="tool-rows">
      {keys.map((t, i) => {
        const on = favourites.includes(t!.key);
        return (
          <div key={t!.key} className="tool-row-wrap" style={{ animationDelay: `${i * 0.03}s` }}>
            <Link to={t!.to!} className="tool-row">
              <span className="ico"><ActivityIcon icon={t!.icon} className="size-5" /></span>
              <span className="tx"><b>{t!.title}</b><span>{t!.desc}</span></span>
            </Link>
            {t!.key === "medsadd" ? null : (
              <button type="button" className="heart" aria-pressed={on} aria-label={on ? `Remove ${t!.title} from favourites` : `Add ${t!.title} to favourites`} onClick={() => toggleFavourite(t!.key, t!.title)}>
                <Heart key={String(on)} className={`size-5 ${on ? "animate-heart-pop fill-current" : ""}`} aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Guide ---------- */
export function GuidePage() {
  const [q, setQ] = useState("");
  const all = useMemo(() => guideEntries(), []);
  const hits = searchGuide(all, q);
  const Entry = ({ e }: { e: (typeof all)[number] }) => (
    <details className="guide-item">
      <summary><span className="tx"><b>{e.title}</b>{q ? <span>{e.group}</span> : null}</span><span className="chev" aria-hidden="true"><Chevron /></span></summary>
      <p>{e.body}</p>
      <Link to={e.to} className="soft-btn">Open {e.title} <Chevron /></Link>
    </details>
  );
  return (
    <div className="lx-page">
      <div className="dtitle"><span className="eyebrow">Guide</span><h1 tabIndex={-1}>Everything in Lumenera, explained</h1><p>Search or browse every space and tool. Tap one to see what it's for, then jump straight there.</p></div>
      <label className="search">
        <Search className="size-5" aria-hidden="true" />
        <span className="sr">Search the guide</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try 'sleep', 'periods' or 'medicine'" autoComplete="off" />
      </label>
      {q ? (
        hits.length ? <section aria-label="Search results"><p className="why" style={{ marginBottom: 8 }}>{hits.length} {hits.length === 1 ? "match" : "matches"}</p>{hits.map((e) => <Entry key={e.id} e={e} />)}</section>
          : <div className="panel"><h2>Nothing found for "{q}"</h2><p>Enera might know. Ask her in your own words.</p><Link to="/enera" className="soft-btn" style={{ alignSelf: "flex-start" }}>Ask Enera</Link></div>
      ) : GUIDE_GROUPS.map((g) => (
        <section key={g} aria-labelledby={`g-${g}`}>
          <div className="sec-h"><h2 id={`g-${g}`}>{g}</h2></div>
          {all.filter((e) => e.group === g).map((e) => <Entry key={e.id} e={e} />)}
        </section>
      ))}
    </div>
  );
}

/* ---------- Quick tools ---------- */
export function ToolsPage() {
  const { favourites } = useRewards();
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { setRecent(readRecent()); }, []);
  return (
    <div className="lx-page">
      <div className="dtitle"><span className="eyebrow">Quick tools</span><h1 tabIndex={-1}>All your everyday tools</h1><p>The practical things, all in one spot.</p></div>
      {CATEGORIES.map((c) => {
        const keys = toolsInCategory(c, favourites, recent);
        if (!keys.length) return null;
        return (
          <section key={c.id} aria-labelledby={`c-${c.id}`}>
            <div className="sec-h"><h2 id={`c-${c.id}`}>{c.name}</h2><span>{c.blurb}</span></div>
            <ToolRows keys={keys} />
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Lume Library ---------- */
type Entry = { id: string; title: string; summary: string; format: Format | "quiz"; area: HubId | null; mins?: number; db?: LearnItem };
const SECTION_AREA: Record<string, HubId> = { intimacy: "contra", body: "body", general: "meno" };
export function LibraryPage() {
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState<"all" | Format | "quiz">("all");
  const [open, setOpen] = useState<string | null>(null);
  const published = useQuery({
    queryKey: ["lume-library"],
    queryFn: async () => {
      const { data } = await supabase.from("learn_content").select("*").eq("status", "approved").order("updated_at", { ascending: false });
      return (data ?? []) as unknown as LearnItem[];
    },
  });
  const entries: Entry[] = [
    ...(published.data ?? []).map((d): Entry => ({ id: `db-${d.id}`, title: d.title, summary: d.summary, format: d.kind === "video" ? "watch" : d.kind === "quiz" ? "quiz" : "read", area: SECTION_AREA[d.section ?? "general"] ?? null, db: d })),
    ...LIBRARY.map((it): Entry => ({ id: it.id, title: it.title, summary: it.summary, format: it.format, area: it.space === "checks" ? null : it.space, mins: it.mins })),
  ];
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = entries.filter((e) => (fmt === "all" || e.format === fmt) && words.every((w) => `${e.title} ${e.summary} ${e.area ? HUBS[e.area].name : ""}`.toLowerCase().includes(w)));
  const FMTS: ["all" | Format | "quiz", string][] = [["all", "All"], ["read", "Read"], ["watch", "Watch"], ["listen", "Listen"], ["do", "Try"], ["quiz", "Quizzes"]];
  return (
    <div className="lx-page">
      <div className="dtitle"><span className="eyebrow">Lume Library</span><h1 tabIndex={-1}>Read, watch and listen</h1><p>Short, trustworthy and made for real life, for every stage.</p></div>
      <label className="search">
        <Search className="size-5" aria-hidden="true" />
        <span className="sr">Search the library</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles, videos and audio" autoComplete="off" />
      </label>
      <div className="chips" role="group" aria-label="Type">{FMTS.map(([k, l]) => <button key={k} type="button" className={`chip ${fmt === k ? "" : "plain"}`} aria-pressed={fmt === k} onClick={() => setFmt(k)}>{l}</button>)}</div>
      <div className="list">
        {shown.map((e) => e.db ? (
          <div key={e.id} className="lib-db"><PublishedItem item={e.db} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} /></div>
        ) : (
          <Link key={e.id} to="/item/$id" params={{ id: e.id }} className={`row tint-${e.area ? HUBS[e.area].tint : "rose"}`}>
            <span className="art-box"><ItemArt item={{ id: e.id, format: e.format as Format }} /></span>
            <span className="tx"><span className="meta">{FORMAT_LABEL[e.format as Format]} · {e.mins} min{e.area ? ` · ${HUBS[e.area].short}` : ""}</span><b>{e.title}</b></span>
          </Link>
        ))}
        {!shown.length ? <p className="why">Nothing matches yet. Try another word, or ask Enera.</p> : null}
      </div>
    </div>
  );
}

/* ---------- Profile and account ---------- */
export function ProfilePage() {
  const { profile, done } = useEs();
  const { user } = useRewards();
  const navigate = useNavigate();
  const p = personal(profile);
  return (
    <div className="lx-page">
      <div className="profile-head">
        <Ring p={p} sub="personal" />
        <div className="dtitle"><span className="eyebrow">Profile and account</span><h1 tabIndex={-1}>{profile.name ? `Hi, ${profile.name}` : "Your profile"}</h1><p>The more you share, the more Lumenera fits you. Your answers stay on this device.</p></div>
      </div>
      <div className="panel">
        <h2>Your answers</h2>
        <p>{done ? "Life moves. Update anything, and your home rebuilds around it." : "Answer a few questions and Lumenera builds your home around you."}</p>
        <div className="chips">
          <button type="button" className="soft-btn" onClick={() => { es.snapshot(); void navigate({ to: "/", search: { mode: "changed" } }); }}>{done ? "Update my answers" : "Start the welcome"}</button>
          {done && profile.deeper !== true ? <button type="button" className="soft-btn" onClick={() => { es.snapshot(); void navigate({ to: "/", search: { mode: "changed" } }); }}>Answer the deeper questions</button> : null}
        </div>
      </div>
      <div className="panel">
        <h2>Your account</h2>
        <p>{user ? `Signed in as ${user.email ?? "you"}. Your garden, badges and Lume Lounge are saved to your account.` : "Use Lumenera freely without an account. Sign in to keep your garden on every device and join the Lume Lounge."}</p>
        <div className="chips"><Link to="/settings" className="soft-btn">{user ? "Manage account" : "Sign in or create an account"}</Link><Link to="/privacy" className="soft-btn">Privacy and your data</Link></div>
      </div>
      <div className="panel">
        <h2>Membership</h2>
        <div className="plan"><b>Lumenera</b><span className="chip">Your plan</span></div>
        <p>Every tool, Enera and the Lume Library, free.</p>
        <div className="plan soon"><b>Lumenera Plus</b><span className="chip plain">Coming soon</span></div>
        <p>Deeper courses, the full library and clinic-ready summaries to share with your GP.</p>
      </div>
      <div className="panel">
        <h2>See Lumenera through someone else's eyes</h2>
        <p>Try an example person to see how the home changes for a different stage of life.</p>
        <div className="people"><PersonaButtons /></div>
        <button type="button" className="ghost" style={{ alignSelf: "flex-start" }} onClick={() => { es.reset(); void navigate({ to: "/", search: {} }); }}>Start again from the welcome</button>
      </div>
    </div>
  );
}
