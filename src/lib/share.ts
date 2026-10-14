import { APP_URL } from "@/config";
import { callNative, hasPlugin } from "./native";

export type SharePayload = {
  title: string;
  /** Message text for WhatsApp, the system share sheet and PeriPal messages. */
  text: string;
  /** Optional link. Defaults to the app's home page. */
  url?: string;
  /** Optional picture (badge, garden, card). Built only when needed. */
  image?: () => Promise<Blob | null>;
  fileName?: string;
  /** Shorter wording for a PeriPal message, if different. */
  palText?: string;
};

/** Links point at the live app, never localhost. */
export function shareOrigin() {
  if (typeof window === "undefined") return APP_URL;
  const o = window.location.origin;
  return /localhost|127\.0\.0\.1|\.local\b/.test(o) ? APP_URL : o;
}
export const shareUrl = (p: SharePayload) => p.url ?? shareOrigin();

export const whatsappHref = (p: SharePayload) => `https://wa.me/?text=${encodeURIComponent(`${p.text} ${shareUrl(p)}`)}`;

/** Leave the app for WhatsApp (or any outside link). In the native app this opens the other app. */
export function openOutside(href: string) {
  if (hasPlugin("Share")) window.location.href = href;
  else window.open(href, "_blank", "noopener");
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/** The phone's own share sheet: native plugin in the app, Web Share in browsers, copy as a last resort. */
export async function systemShare(p: SharePayload): Promise<ShareResult> {
  const url = shareUrl(p);
  if (hasPlugin("Share")) {
    try {
      await callNative("Share", "share", { title: p.title, text: p.text, url, dialogTitle: p.title });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      if (p.image && navigator.canShare) {
        const blob = await p.image();
        if (blob) {
          const file = new File([blob], p.fileName ?? "pause-in-play.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], text: `${p.text} ${url}`, title: p.title });
            return "shared";
          }
        }
      }
      await navigator.share({ title: p.title, text: p.text, url });
      return "shared";
    } catch (e) {
      return (e as Error)?.name === "AbortError" ? "cancelled" : "failed";
    }
  }
  return (await copyText(`${p.text} ${url}`)) ? "copied" : "failed";
}

export async function copyText(t: string) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    return false;
  }
}

export async function downloadImage(p: SharePayload) {
  const blob = await p.image?.();
  if (!blob) return false;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = p.fileName ?? "pause-in-play.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return true;
}
