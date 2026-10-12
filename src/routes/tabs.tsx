import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderScreen } from "@/components/mm/BackButton";

export const Route = createFileRoute("/tabs")({
  head: () => ({
    meta: [
      { title: "My brain has 37 tabs open · Midlife Mind" },
      { name: "description", content: "A one-minute pause, then one thing." },
      { property: "og:title", content: "My brain has 37 tabs open · Midlife Mind" },
      { property: "og:description", content: "A one-minute pause, then one thing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderScreen eyebrow="Tab closer" title="My brain has 37 tabs open" blurb="A one-minute pause, then one thing." />,
});
