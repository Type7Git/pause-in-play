/** Space and check pages: the depth behind the calm home. */
import { Link } from "@tanstack/react-router";
import { CalendarArt, ItemArt, SpaceArt, Tick, ToneGlyph } from "./art";
import { CHECK_INFO, FORMAT_LABEL, HUBS, SCREEN_BANDS, type CheckId, type HubId } from "./content";
import { ageOf, checksFor, plan, rank, type Check } from "./engine";
import { NearYou } from "./places";
import { es, useEs } from "./store";
import { NeedsProfile, TopBar } from "./ui";

export function SpacePage({ id }: { id: HubId }) {
  const { profile, done, ready } = useEs();
  const hub = HUBS[id];
  if (!ready) return <><TopBar title={hub.short} /><main className="stage" /></>;
  if (!done) return <><TopBar title={hub.short} /><main className="stage"><NeedsProfile /></main></>;
  const pl = plan(profile);
  const mine = pl.spaces.find((s) => s.id === id);
  const items = rank(profile, pl.spaces.map((s) => s.id), pl.mindFirst, pl.lowMood, id).slice(0, 5);
  return (
    <>
      <TopBar title={hub.short} />
      <main className="stage" key={`space-${id}`}>
        <div className={`detail tint-${hub.tint}`}>
          <div className="dhero"><span className="art-box"><SpaceArt id={id} /></span></div>
          <div className="dtitle" style={{ animationDelay: ".05s" }}>
            {hub.by ? <span className="eyebrow" style={{ color: "var(--tint-ink)" }}>{hub.by}</span> : null}
            <h1 tabIndex={-1}>{hub.name}</h1>
            <p>{hub.blurb}</p>
            <div className="chips">{mine?.why ? <span className="chip">Because {mine.why}</span> : <span className="chip plain">Exploring</span>}</div>
          </div>
          {items.length ? (
            <section style={{ animationDelay: ".1s" }}>
              <div className="sec-h"><h2>Start here</h2><span>Picked for you</span></div>
              <div className="list">
                {items.map((it) => (
                  <Link key={it.id} to="/luma/item/$id" params={{ id: it.id }} className="row">
                    <span className="art-box"><ItemArt item={it} /></span>
                    <span className="tx"><span className="meta">{FORMAT_LABEL[it.format]} · {it.mins} min</span><b>{it.title}</b></span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          <div className="panel" style={{ animationDelay: ".15s" }}>
            <h2>When to see someone</h2>
            <ul>{hub.seeSomeone.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div style={{ animationDelay: ".2s" }}><NearYou profile={profile} topic={id} /></div>
          <p className="why" style={{ fontSize: 12.5 }}>Sample content for the demo. Final content is written and reviewed by clinicians.</p>
        </div>
      </main>
    </>
  );
}

const TONE_TITLE: Record<Check["tone"], string> = { ok: "Up to date", soon: "Due soon", overdue: "Overdue", info: "Good to know" };

export function CheckPage({ id }: { id: CheckId }) {
  const { profile, done, ready } = useEs();
  const info = CHECK_INFO[id];
  if (!ready) return <><TopBar title="Checks" /><main className="stage" /></>;
  if (!done) return <><TopBar title="Checks" /><main className="stage"><NeedsProfile /></main></>;
  const c: Check = checksFor(profile).find((x) => x.id === id) ?? { id, name: info.name, tone: "info", status: "Not due for you", detail: "Based on your age, this check isn't part of your routine right now." };
  const A = ageOf(profile) ?? 0;
  const field = id === "cervical" && A >= 25 && A <= 74 ? "cervical" : id === "breast" && A >= 40 ? "mammo" : null;
  return (
    <>
      <TopBar title="Checks" />
      <main className="stage" key={`check-${id}`}>
        <div className={`detail tone-${c.tone}`} style={{ ["--tint" as string]: "var(--t-ring)", ["--tint-soft" as string]: "var(--t-soft)", ["--tint-ink" as string]: "var(--t)" }}>
          <div className="dhero" key={c.tone}><span className="art-box"><CalendarArt tone={c.tone} /></span></div>
          <div className="dtitle" style={{ animationDelay: ".05s" }}>
            <span className="eyebrow">{info.national}</span>
            <h1 tabIndex={-1}>{info.name}</h1>
          </div>
          <div className="status-card" role="status" style={{ animationDelay: ".08s" }}>
            <span className="ring"><ToneGlyph tone={c.tone} /></span>
            <span><b>{c.status === TONE_TITLE[c.tone] ? c.status : `${TONE_TITLE[c.tone]} · ${c.status}`}</b><span>{c.detail}</span></span>
          </div>
          {field ? (
            <div className="panel" style={{ animationDelay: ".1s" }}>
              <h2>When was your last one?</h2>
              <div className="seg" role="group" aria-label={`When was your last ${info.name.toLowerCase()}`}>
                {SCREEN_BANDS.map((o) => (
                  <button key={o.id} type="button" className="opt" style={{ animation: "none" }} aria-pressed={profile[field] === o.id} onClick={() => es.patch({ [field]: o.id })}>
                    <span className="tick"><Tick /></span><span>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="panel" style={{ animationDelay: ".14s" }}><h2>What it is</h2><p>{info.what}</p></div>
          <div className="panel" style={{ animationDelay: ".18s" }}><h2>How often</h2><p>{info.how}</p></div>
          <div className="panel" style={{ animationDelay: ".22s" }}><h2>Why it matters</h2><p>{info.why}</p></div>
          <div className="panel" style={{ animationDelay: ".26s" }}><h2>Where to go</h2><ul>{info.where.map((w) => <li key={w}>{w}</li>)}</ul></div>
          <div style={{ animationDelay: ".3s" }}><NearYou profile={profile} topic={id} /></div>
          <button type="button" className="toggle" role="switch" aria-checked={profile.consent.remind} onClick={() => es.patch({ consent: { ...profile.consent, remind: !profile.consent.remind } })}>
            <span className="tx"><b>Gentle reminder when it's due</b><span>One quiet nudge. Nothing pushy.</span></span><span className="sw" aria-hidden="true" />
          </button>
          <p className="why" style={{ fontSize: 12.5 }}>General information about Australian screening programs, not personal medical advice. Your GP can tell you what's right for you.</p>
        </div>
      </main>
    </>
  );
}
