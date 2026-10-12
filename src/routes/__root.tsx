import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { RewardsProvider } from "@/lib/rewards";
import { AppShell } from "@/components/mm/AppShell";
import { registerOfflineWorker } from "@/lib/pwa";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="eyebrow">Page not found</p>
        <h1>This page has wandered off.</h1>
        <p className="text-muted-foreground">Like the glasses, it's probably somewhere obvious. Let's head back to the start.</p>
        <Link to="/" className="press mt-2 inline-flex min-h-11 items-center rounded-full bg-plum px-5 py-3 font-bold text-shell">Back to home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div role="alert" className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="eyebrow">A little hiccup</p>
        <h1>This page didn't load.</h1>
        <p className="text-muted-foreground">Something went wrong on our side, not yours. Your petals and badges are safe. Try again, or head back home.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="press inline-flex min-h-11 items-center rounded-full bg-plum px-5 py-3 font-bold text-shell"
          >
            Try again
          </button>
          <a href="/" className="press inline-flex min-h-11 items-center rounded-full border border-line bg-card px-5 py-3 font-bold text-plum">Back to home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#5B3A6B" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Pause and Play" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "Pause and Play" },
      { name: "description", content: "A warm, playful self-care companion for women in perimenopause." },
      { property: "og:title", content: "Pause and Play" },
      { property: "og:description", content: "A warm, playful self-care companion for women in perimenopause." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Atkinson+Hyperlegible:wght@400;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { void registerOfflineWorker(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RewardsProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </RewardsProvider>
    </QueryClientProvider>
  );
}
