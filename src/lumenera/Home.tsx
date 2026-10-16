/** The Lumenera home: calm and visual. Headers and pictures here; detail is one tap deeper. */
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIcon } from "@/components/mm/ActivityIcon";
import { AddToHomeCard } from "@/components/mm/AddToHomeCard";
import { GardenScene } from "@/components/mm/Garden";
import { PanelBadge } from "@/components/mm/Panel";
import { getLevel } from "@/lib/levels";
import { useRewards } from "@/lib/rewards";
import { CheckIcon, Chevron, Flower, ItemArt, SpaceArt } from "./art";
import { TOOL } from "./tools";
import { FORMAT_LABEL, HUBS, HUB_IDS, SPACES, type HubId } from "./content";
import { plan, type Check, type Pick } from "./engine";
import { es, useEs } from "./store";
import { Meter, NeedsProfile, greeting } from "./ui";

const TONE_WORD: Record<Check["tone"], string> = { ok: "Up to date", soon: "Due soon", overdue: "Overdue", info: "Good to know" };
const SHORT_CHECK: Record<Check["id"], string> = { cervical: "Cervical", breast: "Breast", bones: "Bones" };
const tintOf = (id: HubId | "checks") => (id === "checks" ? "rose" : HUBS[id].tint);

export function Home() {
  const { profile, done, ready, prevStages } = useEs();
  const rewards = useRewards();
  if (!ready) return <main className="stage" key="home" />;
  if (!done) return <main className="stage" key="home"><NeedsProfile /></main>;
  const pl = plan(profile);
  const st = profile.stages ?? [];
  const lost = !!prevStages?.includes("pregnant") && !st.includes("pregnant") && !st.includes("baby") && profile.children !== "u1";
  // After a pregnancy ends, fertility stays available but never leads the home.
  const ordered = lost ? [...pl.spaces.filter((x) => x.id !== "fertility"), ...pl.spaces.filter((x) => x.id === "fertility")] : pl.spaces;
  const [first, ...rest] = ordered;
  // Companions under the hero: the other focus areas, topped up with Mind, which fits every stage.
  const companions: HubId[] = rest.map((s) => s.id);
  if (companions.length < 2 && !companions.includes("mind")) companions.push("mind");
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <header className="hhead">
        <div style={{ minWidth: 0 }}><small className="brand"><Flower size={18} still /><b>Lumenera</b><span aria-hidden="true">·</span>{today}</small><h1 tabIndex={-1}>{greeting()}{profile.name ? `, ${profile.name}` : ""}</h1></div>
        <Meter />
      </header>
      <main className="stage" key="home">
        <div className="home">
          {lost ? (
            <div className="gentle" style={{ animationDelay: ".02s" }}>
              <span className="orbmini" aria-hidden="true" />
              <span><b>We've updated your space.</b><span>If you've experienced a loss, we're so sorry. Support is here whenever you want it, including Sands, Pink Elephants and your GP.</span></span>
            </div>
          ) : null}
          {pl.lowMood ? (
            <Link to="/item/$id" params={{ id: "one-minute-pause" }} className="gentle" style={{ animationDelay: ".04s" }}>
              <span className="orbmini" aria-hidden="true" />
              <span><b>Go gently today.</b><span>A one-minute pause is ready when you are. Need someone now? Lifeline, 13 11 14.</span></span>
            </Link>
          ) : null}

          <Link to="/enera" className="ask" style={{ animationDelay: ".05s" }}>
            <Flower size={34} still />
            <span><b>Ask Enera</b><span>Your guide, answering from our clinically reviewed library</span></span>
            <Chevron />
          </Link>

          {first ? (
            <section style={{ animationDelay: ".06s" }} aria-labelledby="es-focus">
              <div className="sec-h"><h2 id="es-focus">Your focus</h2></div>
              <Link to="/space/$id" params={{ id: first.id }} className={`hero tint-${SPACES[first.id].tint}`}>
                <span className="num" aria-hidden="true">1</span>
                <span className="art-box"><SpaceArt id={first.id} /></span>
                <span className="cap">
                  <span>{SPACES[first.id].by ? <span className="by">{SPACES[first.id].by}</span> : null}<h3>{SPACES[first.id].name}</h3></span>
                  <span className="go" aria-hidden="true"><Chevron /></span>
                </span>
              </Link>
              <div className={`duo ${companions.length === 1 ? "one" : ""}`}>
                {companions.map((id, i) => (
                  <Link key={id} to="/space/$id" params={{ id }} className={`tint-${HUBS[id].tint}`}>
                    {i < rest.length ? <span className="num" aria-hidden="true">{i + 2}</span> : null}
                    <span className="art-box"><SpaceArt id={id} /></span>
                    <h3>{HUBS[id].name}</h3>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {pl.checks.length ? (
            <section style={{ animationDelay: ".12s" }} aria-labelledby="es-checks">
              <div className="sec-h"><h2 id="es-checks">Your checks</h2><span>Tap for details</span></div>
              <div className="chks">
                {pl.checks.map((c) => (
                  <Link key={c.id} to="/check/$id" params={{ id: c.id }} className={`chk tone-${c.tone}`} aria-label={`${c.name}: ${TONE_WORD[c.tone]}. Open details.`}>
                    <span className="ring"><CheckIcon id={c.id} /><span className="dot" /></span>
                    <b>{SHORT_CHECK[c.id]}</b>
                    <small>{TONE_WORD[c.tone]}</small>
                  </Link>
                ))}
              </div>
              <div className="legend" aria-hidden="true">
                <span className="tone-ok"><i />Up to date</span><span className="tone-soon"><i />Due soon</span><span className="tone-overdue"><i />Overdue</span>
              </div>
            </section>
          ) : null}

          <section style={{ animationDelay: ".15s" }} aria-labelledby="es-every">
            <div className="sec-h"><h2 id="es-every">Everyday tools</h2><span>For any stage</span></div>
            <div className="trio">
              {(["meds", "body", "mind"] as const).map((id) => (
                <HubLink key={id} id={id} className={`tint-${HUBS[id].tint}`}>
                  <span className="art-box"><SpaceArt id={id} /></span>
                  <h3>{HUBS[id].name}</h3>
                </HubLink>
              ))}
            </div>
            {rewards.favourites.length ? (
              <div className="favs" aria-label="Your favourite tools">
                {rewards.favourites.map((k) => TOOL[k]).filter((t) => !!t?.to).map((t) => (
                  <Link key={t!.key} to={t!.to!} className="fav"><ActivityIcon icon={t!.icon} className="size-5" />{t!.title}</Link>
                ))}
              </div>
            ) : null}
          </section>

          <ForYou picks={pl.picks} />

          <GardenCard petals={rewards.petals} flowers={rewards.flowers} />

          <section style={{ animationDelay: ".24s" }} aria-labelledby="es-explore">
            <div className="sec-h"><h2 id="es-explore">Explore everything</h2><span>Always one tap away</span></div>
            <div className="tiles">
              {HUB_IDS.map((id) => (
                <HubLink key={id} id={id} className={`tile tint-${tintOf(id)} ${pl.spaces.some((s) => s.id === id) ? "on" : ""}`}>
                  <span className="art-box"><SpaceArt id={id} /></span>
                  {HUBS[id].short}
                </HubLink>
              ))}
              <Link to="/enera" className="tile tint-lilac">
                <span className="art-box" style={{ display: "grid", placeItems: "center" }}><Flower size={44} still /></span>
                Ask Enera
              </Link>
            </div>
          </section>

          <section className="foot" style={{ animationDelay: ".3s" }}>
            <Link to="/" search={{ mode: "changed" }} className="soft-btn" onClick={() => es.snapshot()}>Something's changed?</Link>
            <p>Concept demo with sample content. Lumenera shares information, never a diagnosis. Your answers stay on this device.</p>
            <Link to="/panel" className="panel-link"><PanelBadge size={28} /><span>Developed with our clinical advisory panel</span><Chevron /></Link>
          </section>
          <div style={{ animationDelay: ".34s" }}><AddToHomeCard /></div>
        </div>
      </main>
    </>
  );
}

function ForYou({ picks }: { picks: Pick[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(0);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const f = () => { const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1; setOn(Math.round(el.scrollLeft / (w + 12))); };
    el.addEventListener("scroll", f, { passive: true });
    return () => el.removeEventListener("scroll", f);
  }, []);
  if (!picks.length) return null;
  return (
    <section style={{ animationDelay: ".18s" }} aria-labelledby="es-today">
      <div className="sec-h"><h2 id="es-today">For you today</h2><span>Swipe</span></div>
      <div className="rail" ref={rail}>
        {picks.map((it) => (
          <Link key={it.id} to="/item/$id" params={{ id: it.id }} className={`pick tint-${tintOf(it.space)}`}>
            <span className="art-box"><ItemArt item={it} /></span>
            <span className="tx">
              <span className="meta">{FORMAT_LABEL[it.format]} · {it.mins} min</span>
              <h3>{it.title}</h3>
              {it.reasons[0] ? <span className="because">Because {it.reasons[0].charAt(0).toLowerCase() + it.reasons[0].slice(1)}</span> : null}
            </span>
          </Link>
        ))}
      </div>
      <div className="dots" aria-hidden="true">{picks.map((p, i) => <i key={p.id} className={i === on ? "on" : ""} />)}</div>
    </section>
  );
}

/** A space's card: Medicine cabinet opens the cabinet itself, every other space opens its page. */
function HubLink({ id, className, children }: { id: HubId; className: string; children: ReactNode }) {
  const to = HUBS[id].to;
  return to ? <Link to={to} className={className}>{children}</Link> : <Link to="/space/$id" params={{ id }} className={className}>{children}</Link>;
}

function GardenCard({ petals, flowers }: { petals: number; flowers: Parameters<typeof GardenScene>[0]["flowers"] }) {
  const L = getLevel(petals);
  return (
    <Link to="/garden" className="garden-card" style={{ animationDelay: ".2s" }}>
      <span className="scene" inert aria-hidden="true"><GardenScene petals={petals} {...(flowers ? { flowers } : {})} /></span>
      <span className="tx">
        <span className="row1"><b>Your garden</b><span>{petals} petals · {L.name}</span></span>
        <span className="bar" aria-hidden="true"><i style={{ width: `${Math.round(L.pct * 100)}%` }} /></span>
        <span className="sub2">{L.next ? `${L.next.remaining} petals to ${L.next.name}. It grows every time you use a tool.` : "Top level reached. Keep tending it."}</span>
      </span>
    </Link>
  );
}
