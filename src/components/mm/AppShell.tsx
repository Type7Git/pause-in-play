import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { onNative } from "@/lib/native";
import { topUpPhoneNotes } from "@/lib/notes-device";
import { usePelvicReminders } from "@/lib/body";
import { Flower } from "@/lumenera/art";
import { metaFor } from "@/lumenera/tools";
import { PersonaButtons, TopBar } from "@/lumenera/ui";

/** In the phone app: tapping a notification opens the right screen, and Little notes stay topped up. */
function useAppNotifications() {
  const router = useRouter();
  useEffect(() => {
    void topUpPhoneNotes();
    const l = onNative("LocalNotifications", "localNotificationActionPerformed", (data) => {
      const path = (data as { notification?: { extra?: { path?: unknown } } })?.notification?.extra?.path;
      if (typeof path === "string" && path.startsWith("/")) router.history.push(path);
    });
    return () => { void l?.remove(); };
  }, [router]);
}

/** Lumenera's own screens draw their own top bars; every tool page gets the shared one. */
const isLumeneraScreen = (p: string) => p === "/" || p === "/home" || /^\/(space|check|item)\//.test(p);

function EneraButton() {
  return (
    <Link to="/enera" className="iconbtn" aria-label="Ask Enera" style={{ border: 0, background: "transparent" }}>
      <Flower size={38} still />
    </Link>
  );
}

function ToolFrame({ path, children }: { path: string; children: ReactNode }) {
  const router = useRouter();
  const meta = metaFor(path);
  // Back goes where you came from; opened from a link or a notification, it goes to the tool's space.
  const back = () => {
    if (router.history.canGoBack()) router.history.back();
    else if (meta.hub) void router.navigate({ to: "/space/$id", params: { id: meta.hub } });
    else void router.navigate({ to: "/home" });
  };
  return (
    <>
      <TopBar title={meta.title} back={back} right={path.startsWith("/enera") ? <span className="iconbtn hide" /> : <EneraButton />} />
      <main className="stage">
        <div key={path} className="mm-page flex flex-col gap-[18px] px-4 pb-7 pt-2 sm:px-5">
          {children}
          <footer className="mt-2 text-center text-xs text-muted-foreground">
            Education and skills, not medical advice or treatment. If you are in crisis, call Lifeline 13 11 14 or 000.{" "}
            <Link to="/privacy" className="underline underline-offset-2">Privacy</Link>
          </footer>
        </div>
      </main>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useLocation({ select: (l) => l.pathname });
  const quiet = path === "/wind-down";
  usePelvicReminders();
  useAppNotifications();
  if (path.startsWith("/admin")) {
    return (
      <div className="es min-h-screen px-6 py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
        <footer className="mx-auto mt-10 max-w-6xl text-center text-xs text-muted-foreground">If you are in crisis, call Lifeline 13 11 14 or 000.</footer>
      </div>
    );
  }
  return (
    // Phones (and the native app): full screen. Tablets and desktop: a phone-sized frame with a short pitch beside it.
    <div className="es">
      <div className="page">
        <section className="aside" aria-label="About Lumenera">
          <span className="brand"><Flower size={44} /><b>Lumenera</b></span>
          <span className="kicker">Concept demo</span>
          <h2>Find your rhythm. Flourish your way.</h2>
          <p>Personalised women's health through every stage of life. Tap through the welcome as a new user, then explore the tools in every space.</p>
          <p>Short on time? Jump straight to a finished example:</p>
          <div className="people"><PersonaButtons /></div>
          <p style={{ fontSize: 13 }}>Sample content. Nothing personal leaves this device unless you choose to sign in.</p>
        </section>
        <div className={`device ${quiet ? "quiet" : ""}`}>
          {isLumeneraScreen(path) ? children : <ToolFrame path={path}>{children}</ToolFrame>}
        </div>
      </div>
    </div>
  );
}
