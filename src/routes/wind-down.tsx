import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderScreen } from "@/components/mm/BackButton";

export const Route = createFileRoute("/wind-down")({
  head: () => ({
    meta: [
      { title: "Help me wind down · Midlife Mind" },
      { name: "description", content: "Quiet, no scores." },
      { property: "og:title", content: "Help me wind down · Midlife Mind" },
      { property: "og:description", content: "Quiet, no scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderScreen eyebrow="Wind down" title="Help me wind down" blurb="Quiet, no scores." />,
});
