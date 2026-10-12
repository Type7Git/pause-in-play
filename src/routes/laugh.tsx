import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderScreen } from "@/components/mm/BackButton";

export const Route = createFileRoute("/laugh")({
  head: () => ({
    meta: [
      { title: "I need a laugh · Midlife Mind" },
      { name: "description", content: "An everyday scene to sort out." },
      { property: "og:title", content: "I need a laugh · Midlife Mind" },
      { property: "og:description", content: "An everyday scene to sort out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderScreen eyebrow="A little laugh" title="I need a laugh" blurb="An everyday scene to sort out." />,
});
