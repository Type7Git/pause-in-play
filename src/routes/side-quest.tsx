import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderScreen } from "@/components/mm/BackButton";

export const Route = createFileRoute("/side-quest")({
  head: () => ({
    meta: [
      { title: "What was I doing? · Midlife Mind" },
      { name: "description", content: "Save my place and the next step." },
      { property: "og:title", content: "What was I doing? · Midlife Mind" },
      { property: "og:description", content: "Save my place and the next step." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderScreen eyebrow="Side quest saver" title="What was I doing?" blurb="Save my place and the next step." />,
});
