import { createFileRoute, Link } from "@tanstack/react-router";
import { PartnerGuide } from "@/components/mm/PartnerGuide";
import { ScreenTitle } from "@/components/mm/ui";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "A guide for partners · Pause in Play" },
      { name: "description", content: "Perimenopause explained for partners: what's happening, what helps, and questions you could ask." },
      { property: "og:title", content: "A guide for partners · Pause in Play" },
      { property: "og:description", content: "What's happening in perimenopause, and how you can help." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <ScreenTitle eyebrow="For partners" title="What's going on, and how to help." sub="Someone who cares about you shared this guide. It contains none of their information." />
      <PartnerGuide />
      <Link to="/" className="min-h-11 self-start text-sm font-bold text-plum">About Pause in Play →</Link>
    </>
  ),
});
