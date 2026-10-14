import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, Muted, Pill, ScreenTitle } from "@/components/mm/ui";
import { CONVERSATION_DECKS } from "@/content/intimacy";

export const Route = createFileRoute("/intimacy/cards")({
  head: () => ({ meta: [{ title: "Conversation cards · Pause and Play" }, { name: "description", content: "Gentle questions for couples: connection, touch, desire, practical and play." }, { property: "og:title", content: "Conversation cards · Pause and Play" }, { property: "og:description", content: "Gentle questions for couples." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Cards,
});

const DECKS = Object.keys(CONVERSATION_DECKS);
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };

function Cards() {
  const [deck, setDeck] = useState(DECKS[0]!);
  const [order, setOrder] = useState(CONVERSATION_DECKS[deck]!);
  const [i, setI] = useState(0);
  const pick = (d: string) => { setDeck(d); setOrder(CONVERSATION_DECKS[d]!); setI(0); };
  return (
    <>
      <ScreenTitle eyebrow="Intimacy & relationships" title="Conversation cards" sub="One question at a time. Take turns." />
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Choose a deck">
        {DECKS.map((d) => <Chip key={d} className="shrink-0" pressed={d === deck} onClick={() => pick(d)}>{d}</Chip>)}
      </div>
      <section aria-live="polite" className="flex min-h-64 flex-col justify-between gap-4 rounded-[26px] bg-gradient-to-br from-plum to-plum-2 p-6 text-shell shadow-lift">
        <p className="text-xs font-bold uppercase tracking-[0.1em] opacity-85">{deck} · {i + 1} of {order.length}</p>
        <p className="font-display text-[26px] font-extrabold leading-tight">{order[i]}</p>
        <p className="text-sm opacity-85">Pass, answer, or ask it back.</p>
      </section>
      <div className="flex gap-2">
        <Pill onClick={() => setI((i + 1) % order.length)}>Next card</Pill>
        <Pill variant="ghost" onClick={() => { setOrder(shuffle(order)); setI(0); }}>Shuffle</Pill>
      </div>
      <Muted>Tip: choose somewhere relaxed, away from the bedroom, like a walk or the couch with a cuppa.</Muted>
    </>
  );
}
