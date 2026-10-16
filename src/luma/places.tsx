/** "Near you": location-based places to go, from the postcode. Clinic names are generic in the demo. */
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneIcon, PinIcon } from "./art";
import type { Profile } from "./content";
import { placeOf } from "./engine";

export type Topic = "periods" | "contra" | "fertility" | "baby" | "meno" | "mind" | "cervical" | "breast" | "bones";
type Place = { name: string; sub: string; tel?: string; book?: boolean; to?: "/" };

export function placesFor(p: Profile, topic: Topic): { heading: string; intro: string; list: Place[] } | null {
  const where = placeOf(p.postcode);
  if (!where) return null;
  const list: Place[] = [];
  if (where.tas) {
    const both = where.city ? [where.city] : ["Hobart", "Launceston"];
    for (const c of both) list.push({ name: `Women's health clinic, ${c}`, sub: "GPs, women's health physio, psychology and more under one roof", book: true });
    if (!where.city) list.push({ name: "Telehealth appointments", sub: "Many visits can happen by video from anywhere in Tasmania", book: true });
  } else {
    list.push({ name: `Women's health clinics in ${where.state}`, sub: "In the full app, local partner clinics appear here", book: true });
  }
  if (topic === "breast") list.unshift({ name: "BreastScreen", sub: "Free mammograms. No referral needed", tel: "13 20 50" });
  if (topic === "cervical" || topic === "bones") list.push({ name: "Your GP", sub: "Can also check when you were last screened", book: true });
  if (topic === "mind") list.push({ name: "Lifeline", sub: "24/7 crisis support", tel: "13 11 14" }, { name: "Beyond Blue", sub: "Talk to a counsellor, 24/7", tel: "1300 22 4636" });
  if (topic === "baby") list.push({ name: "PANDA helpline", sub: "Perinatal anxiety and depression support", tel: "1300 726 306" });
  if (topic === "fertility" || topic === "baby") list.push({ name: "Pregnancy, Birth and Baby", sub: "Talk to a maternal child health nurse", tel: "1800 882 436" });
  if (topic === "meno") list.push({ name: "Pause in Play", sub: "Your menopause space: brain fog, sleep, mood and more", to: "/" });
  list.push({ name: "healthdirect", sub: "Free health advice from a registered nurse, 24/7", tel: "1800 022 222" });
  return { heading: `Near you · ${where.area}`, intro: where.tas ? "Book with women's health clinics in Hobart and Launceston, or start with your GP." : "Your GP is a great first step. Local clinics appear here in the full app.", list };
}

export function NearYou({ profile, topic }: { profile: Profile; topic: Topic }) {
  const [toast, setToast] = useState(false);
  const near = placesFor(profile, topic);
  if (!near) return (
    <div className="near">
      <h2><PinIcon />Near you</h2>
      <p>Add your postcode to see clinics and services close to home.</p>
      <Link to="/luma" search={{ mode: "changed" }} className="soft-btn" style={{ alignSelf: "flex-start" }}>Add my postcode</Link>
    </div>
  );
  return (
    <div className="near">
      <h2><PinIcon />{near.heading}</h2>
      <p>{near.intro}</p>
      {near.list.map((pl) => (
        <div className="place" key={pl.name}>
          <span className="tx"><b>{pl.name}</b><span>{pl.sub}</span></span>
          {pl.tel ? <a className="soft-btn" href={`tel:${pl.tel.replace(/\s/g, "")}`} aria-label={`Call ${pl.name} on ${pl.tel}`}><PhoneIcon />{pl.tel}</a>
            : pl.to ? <Link className="soft-btn" to={pl.to}>Open</Link>
            : <button type="button" className="soft-btn" onClick={() => { setToast(true); window.setTimeout(() => setToast(false), 3200); }}>Book</button>}
        </div>
      ))}
      {toast ? <div className="toast" role="status">In the full app, this opens the clinic's online booking.</div> : null}
    </div>
  );
}
