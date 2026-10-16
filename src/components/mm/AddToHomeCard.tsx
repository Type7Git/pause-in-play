import { useEffect, useState } from "react";

const KEY = "midlife-mind:a2hs-seen";

/** iPhone-only, shown once: how to add the app to the Home Screen. */
export function AddToHomeCard() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipod/i.test(ua) || (/ipad/i.test(ua));
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (ios && !standalone && !localStorage.getItem(KEY)) {
      setShow(true);
      localStorage.setItem(KEY, "1"); // counts as shown, even if not dismissed
    }
  }, []);
  if (!show) return null;
  return (
    <section className="mm-rise relative flex items-start gap-3 rounded-[22px] border border-line bg-plum-soft p-4 shadow-soft" aria-label="Add Lumenera to your Home Screen">
      <img src="/apple-touch-icon.png" alt="" className="size-11 rounded-[12px] shadow-soft" />
      <div className="flex flex-1 flex-col gap-1 text-sm">
        <b className="font-display text-base">Keep Lumenera on your phone</b>
        <span>
          Tap <span aria-label="the Share button" className="inline-flex translate-y-0.5"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg></span> <b>Share</b>, then <b>Add to Home Screen</b>. The six tools work even without internet.
        </span>
      </div>
      <button onClick={() => setShow(false)} aria-label="Dismiss" className="press grid size-8 place-items-center rounded-full text-plum">✕</button>
    </section>
  );
}
