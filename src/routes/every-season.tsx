import { createFileRoute, Outlet } from "@tanstack/react-router";
import esCss from "@/every-season/es.css?url";
import { PersonaButtons } from "@/every-season/ui";

export const Route = createFileRoute("/every-season")({
  head: () => ({
    meta: [
      { title: "Every Season · Women's health for every stage of life" },
      { name: "description", content: "Concept demo: a women's health app that tailors itself to your stage of life." },
      { name: "robots", content: "noindex" },
      { name: "theme-color", content: "#fbf1f3" },
      { property: "og:title", content: "Every Season · concept demo" },
      { property: "og:description", content: "One app for every stage of a woman's life." },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: esCss },
    ],
  }),
  component: EverySeasonLayout,
});

/** Phone-sized on desktop with a short pitch beside it; full screen on phones. */
function EverySeasonLayout() {
  return (
    <div className="es">
      <div className="page">
        <section className="aside" aria-label="About this demo">
          <span className="kicker">Concept demo</span>
          <h2>One app for every stage of a woman's life.</h2>
          <p>Tap through the welcome as a new user. About three minutes of questions, then the app builds a home around her answers.</p>
          <p>Short on time? Jump straight to a finished example:</p>
          <div className="people"><PersonaButtons /></div>
          <p style={{ fontSize: 13 }}>Demo only. Sample content, and nothing you enter leaves this device.</p>
        </section>
        <div className="device"><Outlet /></div>
      </div>
    </div>
  );
}
