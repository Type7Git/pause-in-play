import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderScreen } from "@/components/mm/BackButton";

export const Route = createFileRoute("/remember")({
  head: () => ({
    meta: [
      { title: "Help me remember · Midlife Mind" },
      { name: "description", content: "The Very Important Thing Department." },
      { property: "og:title", content: "Help me remember · Midlife Mind" },
      { property: "og:description", content: "The Very Important Thing Department." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderScreen eyebrow="The VIT Department" title="Help me remember" blurb="The Very Important Thing Department." />,
});
