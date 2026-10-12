import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderScreen } from "@/components/mm/BackButton";

export const Route = createFileRoute("/little-win")({
  head: () => ({
    meta: [
      { title: "Give me a little win · Midlife Mind" },
      { name: "description", content: "A short, untimed puzzle." },
      { property: "og:title", content: "Give me a little win · Midlife Mind" },
      { property: "og:description", content: "A short, untimed puzzle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderScreen eyebrow="Little win" title="Give me a little win" blurb="A short, untimed puzzle." />,
});
