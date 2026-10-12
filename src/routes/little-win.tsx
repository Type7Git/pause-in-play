import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/components/mm/BackButton";
import { WhyThisHelps } from "@/components/mm/Erin";
import { Card, Muted, ScreenTitle } from "@/components/mm/ui";
import { whyThisHelps } from "@/content/erin";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/little-win")({
  head: () => ({
    meta: [
      { title: "A little win · Pause and Play" },
      { name: "description", content: "Sort the washing or match lost things to where they turned up. No timer, no rush." },
      { property: "og:title", content: "A little win · Pause and Play" },
      { property: "og:description", content: "No timer. No rush. Just one small thing done." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LittleWin,
});

type Bin = "light" | "dark";
const LAUNDRY: [string, Bin][] = [["White shirt", "light"], ["Navy jeans", "dark"], ["Cream cardigan", "light"], ["Black leggings", "dark"], ["Grey hoodie", "dark"], ["Pale pink PJs", "light"], ["One sock (where is the other?)", "dark"], ["Beige bra", "light"]];
const PAIRS = [["Glasses", "On your head"], ["Keys", "In the fridge"], ["Phone", "In your hand"], ["Coffee", "In the microwave"]];
const WIN_LINES = ["A small victory. Still counts.", "Done. That counts.", "Look at you, finishing things.", "Small win banked."];
const MATCH_LINES = ["Found. Exactly where you left it.", "Another one turned up.", "Nothing lost, just relocated.", "All found."];

function useWinLine() {
  const n = useRef(0);
  return () => WIN_LINES[n.current++ % WIN_LINES.length]!;
}

function LittleWin() {
  const winLine = useWinLine();
  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="A little win" title="No timer. No rush. Just one small thing done." />
      <Washing winLine={winLine} />
      <Pairs winLine={winLine} />
      <WhyThisHelps>{whyThisHelps.littleWin}</WhyThisHelps>
    </>
  );
}

function Basket({ kind }: { kind: Bin }) {
  const light = kind === "light";
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10">
      <path d="M7 14h26l-3 20H10z" fill={light ? "var(--mm-card)" : "var(--mm-plum)"} stroke="var(--mm-plum-2)" strokeWidth="2" />
      <path d="M7 14h26" stroke="var(--mm-plum-2)" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 20v10M17 20v10M23 20v10M28 20v10" stroke={light ? "var(--mm-line)" : "var(--mm-plum-2)"} strokeWidth="1.5" />
    </svg>
  );
}

function Washing({ winLine }: { winLine: () => string }) {
  const { earn } = useRewards();
  const [left, setLeft] = useState(LAUNDRY.map((_, i) => i));
  const [sel, setSel] = useState<number | null>(null);
  const [counts, setCounts] = useState({ light: 0, dark: 0 });
  const [msg, setMsg] = useState("");

  const drop = (bin: Bin) => {
    if (sel === null) return setMsg("Pick an item first.");
    const [name, right] = LAUNDRY[sel]!;
    if (right !== bin) return setMsg(`Hmm, the ${name.toLowerCase()} might be happier in the other basket.`);
    const rest = left.filter((i) => i !== sel);
    setCounts((c) => ({ ...c, [bin]: c[bin] + 1 }));
    setLeft(rest);
    setSel(null);
    setMsg("");
    if (!rest.length) {
      setMsg("All sorted. The other sock remains a mystery.");
      earn(5, winLine(), "Small victories");
    }
  };

  return (
    <Card>
      <h3>Sort the washing</h3>
      <Muted>Tap an item, then tap its basket.</Muted>
      <div className="flex flex-wrap gap-2">
        {left.length ? left.map((i) => (
          <button key={i} aria-pressed={sel === i} onClick={() => setSel(i)} className="rounded-xl border-[1.5px] border-line bg-card px-3 py-2 text-sm text-ink transition-transform aria-pressed:-translate-y-0.5 aria-pressed:border-gold aria-pressed:bg-gold-soft aria-pressed:font-bold">
            {LAUNDRY[i]![0]}
          </button>
        )) : <Muted>Basket empty.</Muted>}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {(["light", "dark"] as Bin[]).map((k) => (
          <button key={k} onClick={() => drop(k)} className="press flex min-h-[104px] flex-col items-center justify-center gap-1 rounded-[18px] border-2 border-dashed border-line bg-sunk px-2 py-3 text-center text-ink">
            <Basket kind={k} />
            <b className="font-display">{k === "light" ? "Lights" : "Darks"}</b>
            <small className="text-xs text-muted-foreground">{counts[k]} in</small>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">{msg}</p>
    </Card>
  );
}

type PCard = { k: number; t: string };

function Pairs({ winLine }: { winLine: () => string }) {
  const { earn } = useRewards();
  const [cards, setCards] = useState<PCard[]>(() => PAIRS.flatMap((p, k) => p.map((t) => ({ k, t }))));
  const [up, setUp] = useState<number[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [msg, setMsg] = useState("Tap two cards.");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setCards((c) => [...c].sort(() => Math.random() - 0.5));
    return () => clearTimeout(timer.current);
  }, []);

  const flip = (i: number) => {
    if (up.includes(i) || done.includes(i) || up.length === 2) return;
    const nu = [...up, i];
    setUp(nu);
    if (nu.length < 2) return;
    const a = nu[0]!, b = nu[1]!;
    if (cards[a]!.k === cards[b]!.k) {
      const nd = [...done, a, b];
      setDone(nd);
      setUp([]);
      setMsg(MATCH_LINES[nd.length / 2 - 1]!);
      if (nd.length === cards.length) earn(5, winLine(), "Small victories");
    } else {
      timer.current = setTimeout(() => { setUp([]); setMsg("Not that one. Try another."); }, 900);
    }
  };

  return (
    <Card>
      <h3>Pairs</h3>
      <Muted>Match each lost thing to where it turned up.</Muted>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => {
          const isDone = done.includes(i), isUp = up.includes(i);
          const shown = isDone || isUp;
          return (
            <button
              key={i}
              onClick={() => flip(i)}
              aria-label={shown ? c.t : "Hidden card"}
              className={`grid aspect-[3/4] place-items-center rounded-[14px] p-1 text-center text-xs font-bold ${isDone ? "cursor-default bg-sage-soft text-ink" : isUp ? "bg-gold-soft text-ink shadow-soft" : "card-back text-shell shadow-soft"}`}
            >
              {shown ? c.t : "?"}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">{msg}</p>
    </Card>
  );
}
