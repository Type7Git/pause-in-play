import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/mm/BackButton";
import { Sprout } from "@/components/mm/Sprout";
import { SproutChat } from "@/components/mm/SproutChat";

export const Route = createFileRoute("/enera")({
  head: () => ({
    meta: [
      { title: "Ask Enera · Lumenera" },
      { name: "description", content: "Chat with Enera about Lumenera, explore the clinically reviewed Lumenera library, or find a tool that fits." },
      { property: "og:title", content: "Ask Enera · Lumenera" },
      { property: "og:description", content: "Your guide to Lumenera, at every stage of life." },
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
          <p className="eyebrow">Ask Enera</p>
          <h1 className="font-display text-[28px] font-extrabold leading-tight">Your guide, at every stage of life</h1>
        </div>
      </div>
      <SproutChat />
      <p role="note" className="text-[13px] leading-snug text-muted-foreground">
        Enera is an AI guide, not a person or a therapist. Answers come only from the Lumenera library, clinically reviewed by our advisory panel. It can't give medical or personal advice. In crisis, call Lifeline <a href="tel:131114" className="font-bold underline">13 11 14</a> or 000.
      </p>
    </>
  );
}
