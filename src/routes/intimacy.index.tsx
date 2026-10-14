import { createFileRoute, Link } from "@tanstack/react-router";
import { ScreenTitle } from "@/components/mm/ui";

export const Route = createFileRoute("/intimacy/")({
  head: () => ({ meta: [{ title: "Intimacy & relationships · Pause and Play" }, { name: "description", content: "Private, practical and kind." }, { property: "og:title", content: "Intimacy & relationships · Pause and Play" }, { property: "og:description", content: "Private, practical and kind." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <>
      <ScreenTitle eyebrow="Intimacy & relationships" title="Private, practical and kind." />
      {([["/intimacy/check-in", "What's changed for me"], ["/intimacy/cards", "Conversation cards"], ["/intimacy/say-it-kindly", "Say it kindly"], ["/intimacy/partner-guide", "For your partner"], ["/intimacy/library", "Intimacy library"]] as const).map(([to, t]) => (
        <Link key={to} to={to} className="mm-card lift p-[18px] font-display font-bold">{t} →</Link>
      ))}
    </>
  ),
});
