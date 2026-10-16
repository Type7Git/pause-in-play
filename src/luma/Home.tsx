/** The Luma home: calm and visual. Headers and pictures here; detail is one tap deeper. */
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, Chevron, Flower, ItemArt, SpaceArt } from "./art";
import { FORMAT_LABEL, HUBS, HUB_IDS, SPACES, type HubId } from "./content";
import { plan, type Check, type Pick } from "./engine";
import { es, useEs } from "./store";
import { Meter, NeedsProfile, greeting } from "./ui";

const TONE_WORD: Record<Check["tone"], string> = { ok: "Up to date", soon: "Due soon", overdue: "Overdue", info: "Good to know" };
const SHORT_CHECK: Record<Check["id"], string> = { cervical: "Cervical", breast: "Breast", bones: "Bones" };
const tintOf = (id: HubId | "checks") => (id === "checks" ? "rose" : HUBS[id].tint);

export function Home() {
  const { profile, done, ready, prevStages } = useEs();
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
        <div style={{ minWidth: 0 }}><small className="brand"><Flower size={18} still /><b>Luma</b><span aria-hidden="true">·</span>{today}</small><h1 tabIndex={-1}>{greeting()}{profile.name ? `, ${profile.name}` : ""}</h1></div>
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
            <Link to="/luma/item/$id" params={{ id: "one-minute-pause" }} className="gentle" style={{ animationDelay: ".04s" }}>
              <span className="orbmini" aria-hidden="true" />
              <span><b>Go gently today.</b><span>A one-minute pause is ready when you are. Need someone now? Lifeline, 13 11 14.</span></span>
            </Link>
          ) : null}

          {first ? (
            <section style={{ animationDelay: ".06s" }} aria-labelledby="es-focus">
              <div className="sec-h"><h2 id="es-focus">Your focus</h2></div>
              <Link to="/luma/space/$id" params={{ id: first.id }} className={`hero tint-${SPACES[first.id].tint}`}>
                <span className="num" aria-hidden="true">1</span>
                <span className="art-box"><SpaceArt id={first.id} /></span>
                <span className="cap">
                  <span>{SPACES[first.id].by ? <span className="by">{SPACES[first.id].by}</span> : null}<h3>{SPACES[first.id].name}</h3></span>
                  <span className="go" aria-hidden="true"><Chevron /></span>
                </span>
              </Link>
              <div className={`duo ${companions.length === 1 ? "one" : ""}`}>
                {companions.map((id, i) => (
                  <Link key={id} to="/luma/space/$id" params={{ id }} className={`tint-${HUBS[id].tint}`}>
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
                  <Link key={c.id} to="/luma/check/$id" params={{ id: c.id }} className={`chk tone-${c.tone}`} aria-label={`${c.name}: ${TONE_WORD[c.tone]}. Open details.`}>
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

          <ForYou picks={pl.picks} />

          <section style={{ animationDelay: ".24s" }} aria-labelledby="es-explore">
            <div className="sec-h"><h2 id="es-explore">Explore everything</h2><span>Always one tap away</span></div>
            <div className="tiles">
              {HUB_IDS.map((id) => (
                <Link key={id} to="/luma/space/$id" params={{ id }} className={`tile tint-${tintOf(id)} ${pl.spaces.some((s) => s.id === id) ? "on" : ""}`}>
                  <span className="art-box"><SpaceArt id={id} /></span>
                  {HUBS[id].short}
                </Link>
              ))}
            </div>
          </section>

          <section className="foot" style={{ animationDelay: ".3s" }}>
            <Link to="/luma" search={{ mode: "changed" }} className="soft-btn" onClick={() => es.snapshot()}>Something's changed?</Link>
            <p>Concept demo with sample content. Luma shares information, never a diagnosis. Your answers stay on this device.</p>
          </section>
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
          <Link key={it.id} to="/luma/item/$id" params={{ id: it.id }} className={`pick tint-${tintOf(it.space)}`}>
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
