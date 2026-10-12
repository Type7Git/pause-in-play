// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

const TOOL_PAGES = /^\/(side-quest|remember|tabs|wind-down|little-win|laugh)?\/?$/;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        manifest: false, // served from public/manifest.webmanifest
        filename: "sw.js",
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ["**/*.{js,css,woff2,png,svg,ico,jpg}"],
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Home + the six tools: network first, cached copy when offline.
              urlPattern: ({ request, url, sameOrigin }) =>
                sameOrigin && request.mode === "navigate" && !url.pathname.startsWith("/~oauth") && TOOL_PAGES.test(url.pathname),
              handler: "NetworkFirst",
              options: { cacheName: "pages", networkTimeoutSeconds: 4, expiration: { maxEntries: 20 } },
            },
            {
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: { cacheName: "assets", expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 } },
            },
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "fonts" },
            },
          ],
        },
      }),
    ],
  },
});
