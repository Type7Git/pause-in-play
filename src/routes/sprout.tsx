import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/mm/BackButton";
import { Sprout } from "@/components/mm/Sprout";
import { SproutChat } from "@/components/mm/SproutChat";

export const Route = createFileRoute("/sprout")({
  head: () => ({
    meta: [
      { title: "Ask Sprout · Pause and Play" },
      { name: "description", content: "Sprout is a friendly AI guide that answers only from Dr Erin Kelly's approved library and points you to the right tool." },
      { property: "og:title", content: "Ask Sprout · Pause and Play" },
      { property: "og:description", content: "Your little guide to Pause and Play." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SproutScreen,
});

function SproutScreen() {
  return (
    <>
      <BackButton />
      <div className="flex items-center gap-4">
        <Sprout size={64} mood="wave" />
        <div>
          <p className="eyebrow">Ask Sprout</p>
          <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">Your little guide to Pause and Play</h1>
        </div>
      </div>
      <p role="note" className="rounded-[18px] border border-line bg-sunk px-4 py-3 text-[13px] leading-snug text-muted-foreground">
        Sprout is an AI guide, not a person or a therapist. It only answers from information approved by Dr Erin Kelly, and can't give medical or personal advice. In crisis, call Lifeline <a href="tel:131114" className="font-bold underline">13 11 14</a> or 000.
      </p>
      <SproutChat />
    </>
  );
}
