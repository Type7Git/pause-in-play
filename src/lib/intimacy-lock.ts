/** Optional device lock for Intimacy & relationships, using the phone's Face ID / fingerprint / passcode (WebAuthn platform authenticator).
 * This is a privacy screen on this device only: the credential never leaves the device and nothing is sent to our servers. */
const CRED = "midlife-mind:intimacy-lock";
const OPEN = "midlife-mind:intimacy-unlocked";

const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const rand = () => crypto.getRandomValues(new Uint8Array(32));

export const lockEnabled = () => { try { return !!localStorage.getItem(CRED); } catch { return false; } };
export const isUnlocked = () => { try { return sessionStorage.getItem(OPEN) === "1"; } catch { return false; } };

export async function lockSupported() {
  try { return !!window.PublicKeyCredential && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch { return false; }
}

export async function enableLock() {
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: rand(),
      rp: { name: "Pause in Play", id: location.hostname },
      user: { id: rand(), name: "Pause in Play private section", displayName: "Pause in Play" },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" },
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("cancelled");
  localStorage.setItem(CRED, b64(cred.rawId));
  sessionStorage.setItem(OPEN, "1");
}

export function disableLock() {
  localStorage.removeItem(CRED);
}

export async function unlock() {
  const id = localStorage.getItem(CRED);
  if (!id) return true;
  const ok = await navigator.credentials.get({
    publicKey: { challenge: rand(), allowCredentials: [{ type: "public-key", id: unb64(id), transports: ["internal"] }], userVerification: "required", timeout: 60000 },
  });
  if (!ok) return false;
  sessionStorage.setItem(OPEN, "1");
  return true;
}
