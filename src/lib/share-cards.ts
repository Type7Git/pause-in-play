/** Picture cards for sharing (badges, garden, little notes). Fixed light palette so they look right anywhere. */
import { shareOrigin } from "./share";

const C = { bg: "#FAF7FB", card: "#FFFFFF", plum: "#5B3A6B", plum2: "#6F4D80", ink: "#271F31", muted: "#625870", rose: "#A8483F", gold: "#D48A22", line: "#E5DDEA" };
const LIGHT_VARS: Record<string, string> = {
  "--mm-bg": "#ece6f0", "--mm-shell": "#faf7fb", "--mm-card": "#ffffff", "--mm-sunk": "#f4eff6", "--mm-ink": "#271f31", "--mm-muted": "#625870",
  "--mm-plum": "#5b3a6b", "--mm-plum-2": "#6f4d80", "--mm-plum-soft": "#eadff1", "--mm-sage": "#3f6a4c", "--mm-sage-soft": "#dcebe0",
  "--mm-gold": "#d48a22", "--mm-gold-soft": "#fae8cb", "--mm-rose": "#a8483f", "--mm-rose-soft": "#f6deda", "--mm-line": "#e5ddea",
  "--mm-sky": "#f6eef8", "--mm-hill": "#cfe3d4", "--mm-hill-2": "#b9d6c1",
};

const display = () => '"Bricolage Grotesque", "Avenir Next", system-ui, sans-serif';
const body = () => '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif';
/** Canvas won't fetch a font weight the page hasn't used yet, so ask for them up front. */
async function loadFonts() {
  try {
    await Promise.all(['800 72px "Bricolage Grotesque"', '700 60px "Bricolage Grotesque"', '400 42px "Atkinson Hyperlegible"', '700 34px "Atkinson Hyperlegible"'].map((f) => document.fonts.load(f)));
  } catch { /* fall back to system fonts */ }
}

/** Turn an on-screen SVG into an image, with theme colours fixed to the light palette and moving bits removed. */
export async function svgImage(el: SVGSVGElement, strip: string[] = []) {
  const copy = el.cloneNode(true) as SVGSVGElement;
  strip.forEach((sel) => copy.querySelectorAll(sel).forEach((n) => n.remove()));
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const vb = copy.viewBox.baseVal;
  copy.setAttribute("width", String(vb?.width || 300));
  copy.setAttribute("height", String(vb?.height || 300));
  const markup = new XMLSerializer().serializeToString(copy).replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, v: string, fb?: string) => LIGHT_VARS[v] ?? fb ?? "#EADFF1");
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
  await img.decode();
  return img;
}

function wrap(x: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const w of para.split(" ")) {
      const t = line ? `${line} ${w}` : w;
      if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    lines.push(line);
  }
  return lines;
}

function roundRect(x: CanvasRenderingContext2D, l: number, t: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(l + r, t);
  x.arcTo(l + w, t, l + w, t + h, r);
  x.arcTo(l + w, t + h, l, t + h, r);
  x.arcTo(l, t + h, l, t, r);
  x.arcTo(l, t, l + w, t, r);
  x.closePath();
}

export type CardSpec = {
  eyebrow: string;
  title?: string | undefined;
  body?: string | undefined;
  art?: HTMLImageElement | null | undefined;
  /** "medal" draws art in a square, "wide" fills the width (garden). */
  artShape?: "medal" | "wide" | undefined;
  tint?: string | undefined;
};

/** 1080 x 1350 portrait card. */
export async function renderCard(spec: CardSpec): Promise<Blob | null> {
  await loadFonts();
  const W = 1080, H = 1350, pad = 70;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  if (!x) return null;
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, spec.tint ?? "#F3E9F6");
  g.addColorStop(1, C.bg);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // soft petals in the corners
  x.globalAlpha = 0.18;
  for (const [cx, cy, r, col] of [[120, 140, 90, C.rose], [960, 220, 70, C.gold], [930, 1180, 110, C.plum2], [140, 1210, 60, "#3F6A4C"]] as const) {
    x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, r, r * 1.5, 0.6, 0, Math.PI * 2); x.fill();
  }
  x.globalAlpha = 1;
  roundRect(x, pad, pad, W - pad * 2, H - pad * 2, 56);
  x.fillStyle = C.card; x.shadowColor = "rgba(60,30,80,.12)"; x.shadowBlur = 40; x.fill(); x.shadowBlur = 0;

  let y = pad + 90;
  if (spec.art) {
    if (spec.artShape === "wide") {
      let w = W - pad * 2 - 80, h = (w * spec.art.height) / spec.art.width;
      if (h > 660) { h = 660; w = (h * spec.art.width) / spec.art.height; }
      const l = (W - w) / 2;
      x.save(); roundRect(x, l, pad + 40, w, h, 36); x.clip(); x.drawImage(spec.art, l, pad + 40, w, h); x.restore();
      y = pad + 40 + h + 90;
    } else {
      x.drawImage(spec.art, W / 2 - 190, pad + 60, 380, 380);
      y = pad + 60 + 380 + 80;
    }
  }
  x.textAlign = "center";
  x.fillStyle = C.plum2;
  x.font = `700 34px ${body()}`;
  x.fillText(spec.eyebrow.toUpperCase().split("").join(String.fromCharCode(8202)), W / 2, y);
  y += 30;
  if (spec.title) {
    x.fillStyle = C.ink; x.font = `800 72px ${display()}`;
    for (const l of wrap(x, spec.title, W - pad * 2 - 140)) { y += 84; x.fillText(l, W / 2, y); }
  }
  if (spec.body) {
    const big = !spec.title && !spec.art;
    x.fillStyle = big ? C.ink : C.muted;
    x.font = big ? `700 60px ${display()}` : `400 42px ${body()}`;
    const lh = big ? 78 : 58;
    y += big ? 40 : 30;
    const lines = wrap(x, spec.body, W - pad * 2 - 160);
    if (big) y = Math.max(y, (H - lines.length * lh) / 2 - 40);
    for (const l of lines) { y += lh; x.fillText(l, W / 2, y); }
  }
  // footer
  x.fillStyle = C.plum; x.font = `800 44px ${display()}`;
  x.fillText("Pause in Play", W / 2, H - pad - 90);
  x.fillStyle = C.muted; x.font = `400 30px ${body()}`;
  x.fillText(shareOrigin().replace(/^https?:\/\//, ""), W / 2, H - pad - 44);
  return new Promise((r) => cv.toBlob(r, "image/png"));
}
