import { createFileRoute, Outlet } from "@tanstack/react-router";
import esCss from "@/luma/es.css?url";
import { FLOWER_ICON, Flower } from "@/luma/art";
import { PersonaButtons } from "@/luma/ui";

export const Route = createFileRoute("/luma")({
  head: () => ({
    meta: [
      { title: "Luma · Find your rhythm. Flourish your way." },
      { name: "description", content: "Personalised women's health through every stage of life. Concept demo." },
      { name: "apple-mobile-web-app-title", content: "Luma" },
      { name: "robots", content: "noindex" },
      { name: "theme-color", content: "#fbf1f3" },
      { property: "og:title", content: "Luma · Find your rhythm. Flourish your way." },
      { property: "og:description", content: "Personalised women's health through every stage of life." },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: esCss },
      { rel: "icon", href: FLOWER_ICON, type: "image/svg+xml" },
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
          <span className="brand"><Flower size={44} /><b>Luma</b></span>
          <span className="kicker">Concept demo</span>
          <h2>Find your rhythm. Flourish your way.</h2>
          <p>Personalised women's health through every stage of life. Tap through the welcome as a new user. About three minutes of questions, then the app builds a home around her answers.</p>
          <p>Short on time? Jump straight to a finished example:</p>
          <div className="people"><PersonaButtons /></div>
          <p style={{ fontSize: 13 }}>Demo only. Sample content, and nothing you enter leaves this device.</p>
        </section>
        <div className="device"><Outlet /></div>
      </div>
    </div>
  );
}
