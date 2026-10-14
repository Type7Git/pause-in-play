import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/mm/BackButton";
import { Sprout } from "@/components/mm/Sprout";
import { SproutChat } from "@/components/mm/SproutChat";

export const Route = createFileRoute("/sprout")({
  head: () => ({
    meta: [
      { title: "Ask Sprout · Pause in Play" },
      { name: "description", content: "Chat with Sprout about the program, explore the clinically reviewed Pause in Play library, or find a tool that fits." },
      { property: "og:title", content: "Ask Sprout · Pause in Play" },
      { property: "og:description", content: "Your little guide to Pause in Play." },
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
          <h1 className="font-display text-[28px] font-extrabold leading-tight">Your little guide to Pause in Play</h1>
        </div>
      </div>
      <SproutChat />
      <p role="note" className="text-[13px] leading-snug text-muted-foreground">
        Sprout is an AI guide, not a person or a therapist. Answers come only from the Pause in Play library, clinically reviewed by our advisory panel. It can't give medical or personal advice. In crisis, call Lifeline <a href="tel:131114" className="font-bold underline">13 11 14</a> or 000.
      </p>
    </>
  );
}
