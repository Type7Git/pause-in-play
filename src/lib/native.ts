/**
 * The Android/iOS app is a Capacitor shell that loads this site. Its native bridge puts
 * window.Capacitor on the page, so we can call installed plugins (Share, LocalNotifications)
 * without bundling @capacitor/* here. In a normal browser all of this is simply absent.
 */
type Listener = { remove: () => Promise<void> };
type CapBridge = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  isPluginAvailable?: (name: string) => boolean;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
  addListener?: (plugin: string, event: string, cb: (data: unknown) => void) => Listener;
};

export function bridge(): CapBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapBridge }).Capacitor;
}

export const isNativeApp = () => !!bridge()?.isNativePlatform?.() && typeof bridge()?.nativePromise === "function";

export function hasPlugin(name: string) {
  const b = bridge();
  return isNativeApp() && (b?.isPluginAvailable ? b.isPluginAvailable(name) : true);
}

export async function callNative<T = unknown>(plugin: string, method: string, options?: unknown): Promise<T> {
  const b = bridge();
  if (!b?.nativePromise) throw new Error("Not in the app");
  return (await b.nativePromise(plugin, method, options)) as T;
}

export function onNative(plugin: string, event: string, cb: (data: unknown) => void): Listener | null {
  const b = bridge();
  return b?.addListener && isNativeApp() ? b.addListener(plugin, event, cb) : null;
}
