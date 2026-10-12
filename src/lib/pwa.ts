/** The only place the offline service worker is registered. Never runs in dev, preview or iframes. */
export async function registerOfflineWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const h = window.location.hostname;
  const refused =
    !import.meta.env.PROD ||
    window.top !== window.self ||
    h.startsWith("id-preview--") || h.startsWith("preview--") ||
    h === "lovableproject.com" || h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev") ||
    new URLSearchParams(window.location.search).get("sw") === "off";
  if (refused) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
    return;
  }
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (e) {
    console.warn("Offline mode unavailable", e);
  }
}
