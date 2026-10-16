/** Shared Every Season chrome: top bar, personal meter, demo menu, example people. */
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Chevron, MeterRing } from "./art";
import { PERSONAS } from "./content";
import { personal } from "./engine";
import { es, useEs } from "./store";

export function usePersona() {
  const navigate = useNavigate();
  return (k: string) => { es.persona(k); void navigate({ to: "/every-season", search: { mode: "build" } }); };
}

export function PersonaButtons({ onPick }: { onPick?: () => void }) {
  const pick = usePersona();
  return (
    <>
      {Object.entries(PERSONAS).map(([k, p]) => (
        <button key={k} type="button" className="persona" onClick={() => { onPick?.(); pick(k); }}>
          <i className={p.tint === "lilac" ? "l" : ""} /><span>{p.label}<small>{p.sub}</small></span>
        </button>
      ))}
    </>
  );
}

export function Meter() {
  const { profile } = useEs();
  const [open, setOpen] = useState(false);
  const p = personal(profile);
  return (
    <>
      <button type="button" className="meter" aria-label={`Your space is ${p}% personalised. Open demo menu.`} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <MeterRing p={p} />
      </button>
      {open ? <DemoMenu p={p} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function DemoMenu({ p, onClose }: { p: number; onClose: () => void }) {
  const navigate = useNavigate();
  const { done } = useEs();
  return (
    <>
      <button type="button" className="scrim" aria-label="Close menu" onClick={onClose} />
      <div className="demo-menu" role="menu">
        <p>Your space is {p}% personal</p>
        <PersonaButtons onPick={onClose} />
        {done ? (
          <button type="button" className="persona" onClick={() => { onClose(); void navigate({ to: "/every-season", search: { mode: "changed" } }); }}>
            <i className="l" /><span>Something's changed<small>Update your answers</small></span>
          </button>
        ) : null}
        <button type="button" className="persona" onClick={() => { onClose(); es.reset(); void navigate({ to: "/every-season", search: {} }); }}>
          <i className="l" /><span>Start again<small>Clear answers and begin</small></span>
        </button>
      </div>
    </>
  );
}

/** Top bar for inner pages: back, a quiet title, and the meter. */
export function TopBar({ title, back = "/every-season/home", children }: { title: string; back?: string | (() => void) | null; children?: ReactNode }) {
  return (
    <header className="top">
      {back === null ? <span className="iconbtn hide" /> : typeof back === "function" ? (
        <button type="button" className="iconbtn" aria-label="Back" onClick={back}><Chevron dir="left" /></button>
      ) : (
        <Link to={back} className="iconbtn" aria-label="Back"><Chevron dir="left" /></Link>
      )}
      <div className="where"><small>{title}</small>{children}</div>
      <Meter />
    </header>
  );
}

/** Shown on inner pages if someone lands there before finishing the welcome. */
export function NeedsProfile() {
  return (
    <div className="screen" style={{ justifyContent: "center", textAlign: "center", alignItems: "center" }}>
      <h1>Let's make this yours first.</h1>
      <p className="why" style={{ justifyContent: "center" }}>A few questions, or try an example person.</p>
      <Link to="/every-season" search={{}} className="primary" style={{ width: "100%" }}>Start the welcome</Link>
      <div className="people" style={{ width: "100%" }}><PersonaButtons /></div>
    </div>
  );
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
