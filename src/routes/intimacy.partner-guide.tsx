import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShareSheet } from "@/components/mm/ShareSheet";
import { shareOrigin, type SharePayload } from "@/lib/share";
import { PartnerGuide } from "@/components/mm/PartnerGuide";
import { Pill, ScreenTitle } from "@/components/mm/ui";

export const Route = createFileRoute("/intimacy/partner-guide")({
  head: () => ({ meta: [{ title: "For your partner · Pause in Play" }, { name: "description", content: "A short guide for partners: what's happening and how to help." }, { property: "og:title", content: "For your partner · Pause in Play" }, { property: "og:description", content: "What's happening and how to help." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Partner,
});

function Partner() {
  const [sharing, setSharing] = useState<SharePayload | null>(null);
  const share = () => setSharing({ title: "A guide for partners", text: "I thought you might find this useful. It's a short guide on perimenopause and how to help.", url: `${shareOrigin()}/partners` });
  return (
    <>
      <ScreenTitle eyebrow="For your partner" title="What's going on, and how to help." sub="A short guide you can share. It contains none of your information." />
      <PartnerGuide />
      <div className="flex flex-wrap gap-2">
        <Pill onClick={share}>Share this guide</Pill>
        <Link to="/intimacy/library" className="press inline-flex min-h-11 items-center rounded-full border-[1.5px] border-line bg-card px-5 font-bold text-plum">Intimacy library</Link>
      </div>
      <ShareSheet open={!!sharing} payload={sharing} pals={false} onClose={() => setSharing(null)} />
    </>
  );
}
