import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Chip, Muted, ScreenTitle } from "@/components/mm/ui";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/laugh")({
  head: () => ({
    meta: [
      { title: "I need a laugh · Midlife Mind" },
      { name: "description", content: "She's looked everywhere. Can you find her glasses? Plus the great handbag audit." },
      { property: "og:title", content: "I need a laugh · Midlife Mind" },
      { property: "og:description", content: "She's looked everywhere. Can you find her glasses?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Laugh,
});

type Spot = "couch" | "table" | "bag" | "fridge" | "head";
const SPOTS: Record<Spot, string> = {
  couch: "Under the cushions: 40 cents, a hair tie and a biscuit of unknown age. No glasses.",
  table: "Just a cold cup of tea. Made at 7am. Forgotten by 7:05.",
  bag: "Seven receipts and three lip balms. No glasses.",
  fridge: "The keys are in here. The glasses are not.",
  head: "On her head. Where they have been all along. Every single time.",
};
const BAG: [string, number][] = [["Receipt", 7], ["Lip balm", 3], ["Hair tie", 4], ["Mystery key", 1], ["Mint", 2], ["Tissue", 2]];

function Hot({ spot, label, onLook, children }: { spot: Spot; label: string; onLook: (s: Spot) => void; children: ReactNode }) {
  const key = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onLook(spot); } };
  return (
    <g role="button" tabIndex={0} aria-label={label} onClick={() => onLook(spot)} onKeyDown={key} className="cursor-pointer transition-opacity hover:opacity-80">
      {children}
    </g>
  );
}

function Laugh() {
  const { earn } = useRewards();
  const [msg, setMsg] = useState("Tap where you'd look.");
  const found = useRef(false);
  const [items, setItems] = useState(() => BAG.flatMap(([n, c]) => Array<string>(c).fill(n)));
  const [bagMsg, setBagMsg] = useState("");

  const look = (s: Spot) => {
    setMsg(SPOTS[s]);
    if (s === "head" && !found.current) { found.current = true; earn(4, "Glasses located", "Glasses detective"); }
  };

  const remove = (i: number) => {
    const n = items[i];
    const rest = items.filter((_, j) => j !== i);
    setItems(rest);
    const r = rest.filter((x) => x === "Receipt").length;
    setBagMsg(
      !rest.length ? "" :
      n === "Receipt" ? (r ? `${r} receipt${r > 1 ? "s" : ""} to go. Where do they keep coming from?` : "Receipt-free. Enjoy it while it lasts.") :
      n === "Mystery key" ? "Nobody knows what this opens. Keep it, just in case?" : `${n}: gone.`,
    );
    if (!rest.length) earn(4, "Handbag cleared");
  };

  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="I need a laugh" title="She's looked everywhere. Can you find her glasses?" />
      <Card>
        <svg viewBox="0 0 320 230" role="img" aria-label="A lounge room with a woman searching for her glasses" className="block w-full rounded-[18px]">
          <rect width="320" height="230" fill="var(--mm-sky)" />
          <rect x="0" y="168" width="320" height="62" fill="var(--mm-sunk)" />
          <path d="M0 168h320" stroke="var(--mm-line)" strokeWidth="2" />
          <rect x="24" y="26" width="64" height="48" rx="4" fill="var(--mm-card)" stroke="var(--mm-line)" strokeWidth="2" />
          <path d="M30 66l14-16 10 10 8-8 20 14z" fill="var(--mm-hill-2)" />
          <circle cx="74" cy="38" r="5" fill="var(--mm-gold)" opacity=".7" />
          <Hot spot="couch" label="Look under the couch cushions" onLook={look}>
            <rect x="12" y="118" width="138" height="54" rx="14" fill="var(--mm-plum-2)" />
            <rect x="22" y="100" width="56" height="30" rx="10" fill="var(--mm-plum)" />
            <rect x="84" y="100" width="56" height="30" rx="10" fill="var(--mm-plum)" />
            <rect x="10" y="126" width="14" height="40" rx="7" fill="var(--mm-plum)" />
            <rect x="138" y="126" width="14" height="40" rx="7" fill="var(--mm-plum)" />
          </Hot>
          <Hot spot="table" label="Look on the side table" onLook={look}>
            <rect x="160" y="132" width="52" height="7" rx="3.5" fill="var(--mm-gold)" />
            <rect x="167" y="139" width="5" height="30" rx="2" fill="var(--mm-gold)" />
            <rect x="200" y="139" width="5" height="30" rx="2" fill="var(--mm-gold)" />
            <path d="M176 116h16v12a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="var(--mm-card)" stroke="var(--mm-ink)" strokeWidth="1.5" />
            <path d="M192 120h3a3 3 0 0 1 0 6h-3" fill="none" stroke="var(--mm-ink)" strokeWidth="1.5" />
          </Hot>
          <Hot spot="bag" label="Look in the handbag" onLook={look}>
            <path d="M152 172l5-24h34l5 24z" fill="var(--mm-rose)" />
            <path d="M163 148q11-16 22 0" fill="none" stroke="var(--mm-rose)" strokeWidth="3" />
            <rect x="166" y="140" width="10" height="12" fill="var(--mm-card)" transform="rotate(-12 171 146)" />
            <rect x="172" y="138" width="10" height="13" fill="var(--mm-card)" transform="rotate(10 177 144)" />
          </Hot>
          <Hot spot="fridge" label="Look in the fridge" onLook={look}>
            <rect x="264" y="44" width="48" height="126" rx="8" fill="var(--mm-card)" stroke="var(--mm-line)" strokeWidth="2" />
            <path d="M264 92h48" stroke="var(--mm-line)" strokeWidth="2" />
            <rect x="270" y="100" width="4" height="20" rx="2" fill="var(--mm-muted)" />
            <rect x="270" y="54" width="4" height="16" rx="2" fill="var(--mm-muted)" />
            <circle cx="296" cy="60" r="4" fill="var(--mm-rose)" />
            <rect x="290" y="72" width="10" height="7" rx="1" fill="var(--mm-gold)" />
          </Hot>
          <g aria-hidden="true">
            <path d="M226 172v-56a15 15 0 0 1 30 0v56z" fill="var(--mm-sage)" />
            <rect x="222" y="160" width="10" height="12" rx="3" fill="var(--mm-ink)" opacity=".7" />
            <rect x="250" y="160" width="10" height="12" rx="3" fill="var(--mm-ink)" opacity=".7" />
            <path d="M226 120l-12 18M256 120l10 16" stroke="#E7B99A" strokeWidth="6" strokeLinecap="round" />
            <circle cx="241" cy="88" r="17" fill="#E7B99A" />
            <path d="M224 88q0-22 17-22t17 22q-4-12-17-13q-13 1-17 13z" fill="var(--mm-ink)" opacity=".85" />
            <circle cx="235" cy="90" r="1.6" fill="var(--mm-ink)" />
            <circle cx="247" cy="90" r="1.6" fill="var(--mm-ink)" />
            <path d="M236 98q5 3 10 0" fill="none" stroke="var(--mm-ink)" strokeWidth="1.6" strokeLinecap="round" />
            <text x="262" y="74" fontSize="16" fontWeight="700" fill="var(--mm-plum-2)" fontFamily="Bricolage Grotesque, system-ui">?</text>
          </g>
          <Hot spot="head" label="Look on top of her head" onLook={look}>
            <rect x="222" y="58" width="38" height="20" fill="transparent" />
            <circle cx="234" cy="68" r="6.5" fill="var(--mm-sky)" fillOpacity=".5" stroke="var(--mm-ink)" strokeWidth="2" />
            <circle cx="248" cy="68" r="6.5" fill="var(--mm-sky)" fillOpacity=".5" stroke="var(--mm-ink)" strokeWidth="2" />
            <path d="M240.5 68h1" stroke="var(--mm-ink)" strokeWidth="2" />
          </Hot>
        </svg>
        <p className="rounded-2xl rounded-bl-[4px] bg-sunk px-3.5 py-3 text-[14.5px]" aria-live="polite">{msg}</p>
      </Card>
      <Card>
        <h3>The handbag audit</h3>
        <Muted>Tap anything that can go. Some items may be suspiciously plentiful.</Muted>
        <div className="flex flex-wrap gap-2">
          {items.length ? items.map((n, i) => <Chip key={i} onClick={() => remove(i)}>{n}</Chip>) : <Muted>Handbag: organised. For about a day.</Muted>}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">{bagMsg}</p>
      </Card>
    </>
  );
}
