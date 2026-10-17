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
import esCss from "@/lumenera/es.css?url";
import { FLOWER_ICON } from "@/lumenera/art";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { RewardsProvider } from "@/lib/rewards";
import { AppShell } from "@/components/mm/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { registerOfflineWorker } from "@/lib/pwa";
import { BOOT_CSS, BOOT_SCRIPT, BootSplash, useBootFinish } from "@/components/BootSplash";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
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
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#fbf1f3" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Lumenera" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "Lumenera · Find your rhythm. Flourish your way." },
      { name: "description", content: "Personalised women's health through every stage of life." },
      { property: "og:title", content: "Lumenera" },
      { property: "og:description", content: "Find your rhythm. Flourish your way. Personalised women's health through every stage of life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: esCss },
      { rel: "icon", href: FLOWER_ICON, type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "any" },
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
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: BOOT_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <BootSplash />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { void registerOfflineWorker(); }, []);
  useBootFinish();

  return (
    <QueryClientProvider client={queryClient}>
      <RewardsProvider>
        <AppShell>
          <Outlet />
        </AppShell>
        <Toaster position="bottom-center" />
      </RewardsProvider>
    </QueryClientProvider>
  );
}
