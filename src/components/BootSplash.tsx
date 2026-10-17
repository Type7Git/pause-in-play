/**
 * The loading screen when Lumenera opens as an app (the Android/iOS shell or an installed home-screen app):
 * the flower on blush, exactly where the native splash left it, then the ring glows, the wordmark rises and
 * bubbles drift up while the app gets ready. It fades away once the app is ready (and at least ~1.6s in).
 * Plain HTML and CSS rendered by the server, so it shows before any JavaScript runs. Never shown in a normal browser tab.
 */
import { useEffect } from "react";

const PETAL = "M60 60 C 40 56, 30 36, 42 20 C 52 8, 72 10, 74 26 C 76 42, 70 54, 60 60 Z";
const INNER = "M60 60 C 52 54, 48 42, 54 35 C 59 30, 67 32, 67 40 C 67 49, 64 55, 60 60 Z";
// [left %, size px, seconds to rise, how far through its rise it starts]: already flowing on the first frame.
const BUBBLES: [number, number, number, number][] = [[8, 14, 5.5, 0.35], [17, 22, 6.5, 0.7], [26, 10, 4.8, 0.15], [34, 18, 6, 0.55], [43, 12, 5.2, 0.85], [52, 24, 7, 0.3], [61, 11, 4.6, 0.6], [69, 20, 6.2, 0.1], [77, 14, 5.4, 0.45], [85, 26, 7.4, 0.75], [92, 12, 5, 0.25], [22, 16, 5.8, 0.95], [57, 15, 5.6, 0.05], [81, 9, 4.4, 0.9]];

export const BOOT_CSS = `
#boot{display:none}
html.boot #boot{display:block;position:fixed;inset:0;z-index:2147483000;overflow:hidden;
  background:radial-gradient(120% 90% at 30% 15%,#fffafb,#fbf1f3 45%,#f3dbe4);color:#313d48;
  animation:boot-safety .45s 7s forwards}
html.boot.boot-out #boot{opacity:0;transition:opacity .45s ease;pointer-events:none}
@media (prefers-color-scheme:dark){html.boot #boot{background:radial-gradient(120% 90% at 30% 15%,#2a2230,#1b181e 55%,#1b181e);color:#e8ecf0}}
#boot .bf{position:absolute;left:50%;top:50%;width:150px;height:150px;margin:-75px 0 0 -75px}
#boot .spin{transform-origin:60px 60px;animation:boot-spin 30s linear infinite}
#boot .breathe{transform-origin:60px 60px;animation:boot-breathe 3.2s ease-in-out infinite}
#boot .ring{stroke-dasharray:260;stroke-dashoffset:0}
html.boot-fresh #boot .petal{transform-box:view-box;transform-origin:60px 60px;animation:boot-bloom 1s cubic-bezier(.3,1.35,.5,1) both}
html.boot-fresh #boot .ring{stroke-dashoffset:260;animation:boot-draw 1.4s .2s ease forwards}
#boot .glow{position:absolute;left:50%;top:50%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;
  background:radial-gradient(circle,rgba(207,111,141,.22),rgba(157,137,204,.12) 45%,transparent 70%);animation:boot-glow 2.6s ease-in-out infinite}
#boot .words{position:absolute;left:0;right:0;top:calc(50% + 96px);text-align:center;padding:0 24px}
#boot .wm{font-family:"Young Serif",Georgia,serif;font-size:34px;letter-spacing:-.01em;margin:0;opacity:0;animation:boot-up .7s .35s cubic-bezier(.2,.8,.2,1) forwards}
#boot .tg{font-family:Figtree,system-ui,sans-serif;font-size:15px;margin:6px 0 0;opacity:0;color:inherit;animation:boot-fade .7s .75s ease forwards}
#boot .tg{filter:opacity(.72)}
#boot .bub i{position:absolute;bottom:-40px;border-radius:50%;opacity:0;
  background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.9),transparent 34%),linear-gradient(150deg,#f8dbe4,#cf6f8d);animation:boot-rise linear infinite}
#boot .bub i.l{background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.9),transparent 34%),linear-gradient(150deg,#ece5f7,#9d89cc)}
@keyframes boot-spin{to{transform:rotate(360deg)}}
@keyframes boot-breathe{50%{transform:scale(1.04)}}
@keyframes boot-bloom{from{transform:scale(0) rotate(-40deg);opacity:0}to{transform:none;opacity:1}}
@keyframes boot-draw{to{stroke-dashoffset:0}}
@keyframes boot-glow{50%{transform:scale(1.12);opacity:.7}}
@keyframes boot-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes boot-fade{to{opacity:1}}
@keyframes boot-rise{0%{transform:translateY(0) scale(.9);opacity:0}10%{opacity:.75}50%{transform:translateY(-45vh) translateX(9px)}100%{transform:translateY(-95vh) translateX(-6px) scale(1.05);opacity:0}}
@keyframes boot-safety{to{opacity:0;visibility:hidden}}
@media (prefers-reduced-motion:reduce){#boot *{animation-duration:.01s!important;animation-iteration-count:1!important}#boot .bub{display:none}}
`;

/** Runs before first paint: shows the loading screen only when opened as an app, once per launch, and hands over from the native splash. */
export const BOOT_SCRIPT = `(function(){try{
var w=window,c=w.Capacitor,nat=!!(c&&c.isNativePlatform&&c.isNativePlatform());
var app=nat||(w.matchMedia&&w.matchMedia("(display-mode: standalone)").matches)||w.navigator.standalone===true;
if(!app||sessionStorage.getItem("lum:booted"))return;
var h=document.documentElement;h.classList.add("boot");if(!nat)h.classList.add("boot-fresh");
w.__bootAt=Date.now();
if(nat&&c.nativePromise){requestAnimationFrame(function(){requestAnimationFrame(function(){c.nativePromise("SplashScreen","hide",{fadeOutDuration:200}).catch(function(){})})})}
}catch(e){}})();`;

export function BootSplash() {
  return (
    <div id="boot" aria-hidden="true">
      <div className="bub">
        {BUBBLES.map(([x, d, dur, delay], i) => <i key={i} className={i % 3 === 1 ? "l" : ""} style={{ left: `${x}%`, width: d, height: d, animationDuration: `${dur}s`, animationDelay: `-${(delay * dur).toFixed(2)}s` }} />)}
      </div>
      <div className="glow" />
      <svg className="bf" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bootr" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#a8486b" /><stop offset="1" stopColor="#cf6f8d" stopOpacity=".8" /></linearGradient>
          <linearGradient id="bootl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#6f5aa6" /><stop offset="1" stopColor="#9d89cc" stopOpacity=".8" /></linearGradient>
          <linearGradient id="booto" x1="0" x2="1"><stop offset="0" stopColor="#cf6f8d" /><stop offset="1" stopColor="#9d89cc" /></linearGradient>
        </defs>
        <path className="ring" d="M17.8 92 A 53 53 0 1 1 102.2 92" fill="none" stroke="url(#booto)" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="102.2" cy="92" r="4" fill="url(#booto)" />
        <g className="breathe"><g className="spin"><g transform="translate(60 60) scale(.86) translate(-60 -60)">
          {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`rotate(${i * 72} 60 60)`}><path className="petal" d={PETAL} fill={`url(#boot${i % 2 ? "l" : "r"})`} opacity=".92" style={{ animationDelay: `${0.05 + i * 0.1}s` }} /></g>)}
          {[0, 1, 2, 3, 4].map((i) => <g key={`i${i}`} transform={`rotate(${36 + i * 72} 60 60)`}><path className="petal" d={INNER} fill="#fff" opacity=".55" style={{ animationDelay: `${0.55 + i * 0.07}s` }} /></g>)}
          <circle cx="60" cy="60" r="7.5" fill="#f3c58a" /><circle cx="57.5" cy="57.5" r="2.4" fill="#fff" opacity=".8" />
        </g></g></g>
      </svg>
      <div className="words">
        <p className="wm">Lumenera</p>
        <p className="tg">Find your rhythm. Flourish your way.</p>
      </div>
    </div>
  );
}

/** Fades the loading screen once the app has hydrated, after a short minimum so the moment can land. */
export function useBootFinish() {
  useEffect(() => {
    const h = document.documentElement;
    if (!h.classList.contains("boot")) return;
    const started = (window as unknown as { __bootAt?: number }).__bootAt ?? Date.now();
    const wait = Math.max(0, 1600 - (Date.now() - started));
    const t1 = window.setTimeout(() => {
      h.classList.add("boot-out");
      try { sessionStorage.setItem("lum:booted", "1"); } catch { /* private mode */ }
    }, wait);
    const t2 = window.setTimeout(() => h.classList.remove("boot", "boot-out", "boot-fresh"), wait + 500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);
}
