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

export type ShareResult = "shared" | "copied" | "saved" | "cancelled" | "failed";

async function blobToBase64(b: Blob) {
  const bytes = new Uint8Array(await b.arrayBuffer());
  let out = "";
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}

/** In the phone app: put the picture in the app's cache so the share sheet can attach it. Older app builds without Filesystem skip this. */
async function nativeImageUri(p: SharePayload): Promise<string | null> {
  if (!p.image || !hasPlugin("Filesystem")) return null;
  const blob = await p.image();
  if (!blob) return null;
  const r = await callNative<{ uri: string }>("Filesystem", "writeFile", {
    path: `share/${p.fileName ?? "pause-in-play.png"}`,
    data: await blobToBase64(blob),
    directory: "CACHE",
    recursive: true,
  });
  return r.uri;
}

/**
 * The phone's own share sheet. Picture cards go with their message and link attached;
 * link-only shares (articles, guides, invites) send just the words and link.
 */
export async function systemShare(p: SharePayload): Promise<ShareResult> {
  const url = shareUrl(p);
  const message = `${p.text} ${url}`;
  if (hasPlugin("Share")) {
    try {
      const uri = await nativeImageUri(p).catch(() => null);
      await callNative("Share", "share", uri
        ? { title: p.title, text: message, files: [uri], dialogTitle: p.title }
        : { title: p.title, text: p.text, url, dialogTitle: p.title });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  try {
    if (p.image) {
      const blob = await p.image();
      if (blob) {
        const file = new File([blob], p.fileName ?? "pause-in-play.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: message, title: p.title });
          return "shared";
        }
        // No picture sharing here (most desktop browsers): save the picture and copy the link instead.
        await downloadImage(p);
        await copyText(message);
        return "saved";
      }
    }
    if (navigator.share) {
      await navigator.share({ title: p.title, text: p.text, url });
      return "shared";
    }
  } catch (e) {
    return (e as Error)?.name === "AbortError" ? "cancelled" : "failed";
  }
  return (await copyText(message)) ? "copied" : "failed";
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
