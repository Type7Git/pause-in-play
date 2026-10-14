import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Cloud, CloudLightning, CloudRain, Droplets, Flower2, Shovel, Sparkles, Sun, Wind, X } from "lucide-react";
import { useRewards } from "@/lib/rewards";
import { plantStages } from "@/lib/levels";
import { BASE, CAN_TIP, backStages, nearestPlant, nearestWeed, plantSpots, spoutTip, thirstLevel, today, weedsFor } from "@/lib/garden";
import { SPOTS, SUN_MESSAGES, WATER_MESSAGES, WEATHER, WEED_MESSAGES, flowerInfo, type FlowerKey, type WeatherKey } from "@/content/garden";
import { GardenScene, type GardenTool, type Pick } from "./Garden";
import { FlowerPicker, FlowerPreview } from "./FlowerPicker";
import { prefersReducedMotion } from "./ui";

type Bubble = { key: number; title: string; message: string; accent: string; strip: boolean; left: number; top: number; above: boolean; width: number; arrow: number };

const WEATHER_ICON: Record<WeatherKey, typeof Sun> = { sunny: Sun, cloudy: Cloud, windy: Wind, rainy: CloudRain, stormy: CloudLightning };
const SAGE = "var(--mm-sage)";
const GOLD = "var(--mm-gold)";
const WATER = "#5f8fbf";

const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode: fine */ } },
};

/** Little petals that fly out of whatever was tapped. */
function burst(el: Element | null, colour: string) {
  if (!el || prefersReducedMotion()) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 9; i++) {
    const b = document.createElement("i");
    b.className = "animate-fly pointer-events-none fixed z-10 h-3 w-2";
    const a = (Math.PI * 2 * i) / 9;
    Object.assign(b.style, { left: `${r.left + r.width / 2 - 4}px`, top: `${r.top + Math.min(r.height / 2, 24)}px`, background: colour, borderRadius: "50% 50% 50% 0" });
    b.style.setProperty("--dx", `${Math.cos(a) * 46}px`);
    b.style.setProperty("--dy", `${Math.sin(a) * 46 - 10}px`);
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 950);
  }
}

/** The interactive garden: tap anything, tend it, set the weather, choose the flowers. */
export function GardenPlay() {
  const { ready, petals, flowers, flowersChosen, setFlowers, lastCareAt, water } = useRewards();
  const wrap = useRef<HTMLDivElement>(null);
  const counts = useRef<Record<string, number>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [weather, setWeather] = useState<WeatherKey>("sunny");
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [live, setLive] = useState("");
  const [watering, setWatering] = useState(0);
  const [sunBurst, setSunBurst] = useState(0);
  const [pop, setPop] = useState<number | null>(null);
  const [pulling, setPulling] = useState<number | null>(null);
  const [weeds, setWeeds] = useState<number[]>([]);
  const [grown, setGrown] = useState<number[]>([]);
  const [growth, setGrowth] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [picker, setPicker] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [tool, setTool] = useState<GardenTool | null>(null);
  const [watered, setWatered] = useState<number[]>([]);
  const savedWater = useRef(false);
  const drag = useRef<{ id: number; sx: number; sy: number; dx: number; dy: number; moved: boolean } | null>(null);
  // Thirst is read once on arrival, then each plant perks up as it's watered.
  const [thirst, setThirst] = useState(0);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const next = (key: string, list: readonly string[]) => {
    const n = counts.current[key] ?? 0;
    counts.current[key] = n + 1;
    return list[n % list.length] ?? list[0] ?? "";
  };
  const spot = (name: string) => wrap.current?.querySelector(`[data-spot="${name}"]`) ?? null;

  const show = (title: string, message: string, el: Element | null, accent: string) => {
    setLive(`${title}. ${message}`);
    // Tool, weather and garden-wide messages sit in a card under the picture; taps on a thing get a speech bubble.
    if (!el) { setBubble({ key: Date.now(), title, message, accent, strip: true, left: 0, top: 0, above: false, width: 0, arrow: 0 }); return; }
    const w = wrap.current;
    if (!w) return;
    const wr = w.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const width = Math.min(240, wr.width - 24);
    const ax = r.left + r.width / 2 - wr.left;
    const above = r.top - wr.top > 100;
    const top = above ? r.top - wr.top - 8 : Math.min(r.bottom, r.top + 36) - wr.top + 8;
    const left = Math.min(Math.max(ax, width / 2 + 12), wr.width - width / 2 - 12);
    const arrow = Math.min(Math.max(ax - (left - width / 2), 20), width - 20);
    setBubble({ key: Date.now(), title, message, accent, strip: false, left, top, above, width, arrow });
  };

  const popPlant = (slot: number) => { setPop(null); later(() => setPop(slot), 20); later(() => setPop(null), 700); };
  const markTapped = () => { if (hint) { setHint(false); store.set("pip:garden-tapped", "1"); } };

  // Once petals are known: today's weeds, the first-visit hint, and anything that grew since last time.
  const started = useRef(false);
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    const t = Date.now();
    setNow(t);
    setThirst(thirstLevel(lastCareAt, t));
    const d = today();
    let pulled: number[] = [];
    try { pulled = JSON.parse(store.get(`pip:weeds:${d}`) ?? "[]") as number[]; } catch { pulled = []; }
    setWeeds(weedsFor(d).filter((x) => !pulled.includes(x)));
    setHint(!store.get("pip:garden-tapped"));
    const seen = Number(store.get("pip:garden-seen") ?? NaN);
    if (Number.isFinite(seen) && petals > seen) {
      const before = [...plantStages(seen), ...backStages(seen)];
      const after = [...plantStages(petals), ...backStages(petals)];
      const changed = after.map((s, i) => (s > (before[i] ?? 0) ? i : -1)).filter((i) => i >= 0);
      const blooms = after.filter((s, i) => s >= 3 && (before[i] ?? 0) < 3).length;
      setGrown(changed);
      setGrowth(`Your garden grew since you were last here: +${petals - seen} petals${blooms ? ` and ${blooms} new ${blooms === 1 ? "bloom" : "blooms"}` : changed.length ? ", and something new is sprouting" : ""}.`);
      later(() => setGrown([]), 3000);
    }
    store.set("pip:garden-seen", String(petals));
    if (thirstLevel(lastCareAt, t) > 0) later(() => show(SPOTS.thirsty.title, SPOTS.thirsty.message, null, WATER), 500);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep "seen" current while she earns petals on this screen.
  useEffect(() => { if (started.current) store.set("pip:garden-seen", String(petals)); }, [petals]);

  /* ---------- hands-on tools: pick up, move, tap to use ---------- */
  const svgPoint = (cx: number, cy: number) => {
    const svg = wrap.current?.querySelector("svg");
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const clampTool = (t: GardenTool): GardenTool => ({ ...t, x: Math.min(Math.max(t.x, 14), 326), y: Math.min(Math.max(t.y, 18), 152) });
  const pickUp = (kind: GardenTool["kind"]) => {
    if (tool?.kind === kind) { setTool(null); return; }
    setTool({ kind, x: 170, y: 46, tipping: false, dragging: false });
    show(kind === "can" ? "Watering can" : "Trowel",
      kind === "can" ? "Drag the can over a flower, or tap the flower, then tap the can to pour." : "Drag the trowel onto a weed, or tap the weed, then tap the trowel to dig it out.",
      null, kind === "can" ? WATER : SAGE);
  };
  const moveToolTo = (x: number, top: number) => {
    if (!tool) return;
    if (tool.kind === "can") {
      const tip = spoutTip(CAN_TIP);
      setTool(clampTool({ ...tool, x: x - tip.x, y: top - 14 - tip.y, dragging: false }));
    } else setTool(clampTool({ ...tool, x, y: BASE - 20, dragging: false }));
  };
  const waterPlant = (slot: number) => {
    const first = !savedWater.current;
    if (first) { savedWater.current = true; water(); setNow(Date.now()); }
    const wasThirsty = thirst > 0 && !watered.includes(slot);
    setWatered((w) => (w.includes(slot) ? w : [...w, slot]));
    if (!prefersReducedMotion()) setWatering(Date.now());
    popPlant(slot);
    const el = spot(`plant-${slot}`);
    burst(el, WATER);
    const all = plantSpots(petals).every((p) => p.slot === slot || watered.includes(p.slot));
    show(wasThirsty ? "Perked right up" : "Watered", all && thirst ? "Every plant has had a drink. Now one for you?" : next("water", WATER_MESSAGES), el, WATER);
  };
  const applyTool = () => {
    if (!tool || tool.tipping) return;
    setTool({ ...tool, tipping: true });
    if (tool.kind === "can") {
      const target = nearestPlant(petals, tool.x + spoutTip(CAN_TIP).x, 24);
      later(() => {
        setTool((t) => (t ? { ...t, tipping: false } : t));
        if (target) waterPlant(target.slot);
        else show("Just the soil", "Move the spout over a flower and try again.", spot("tool"), WATER);
      }, 1000);
    } else {
      const target = nearestWeed(weeds, tool.x, 18);
      later(() => {
        setTool((t) => (t ? { ...t, tipping: false } : t));
        if (target !== null) pullWeed(target);
        else show(weeds.length ? "No weed here" : "All clear", weeds.length ? "Move the trowel onto a weed and dig again." : "Nothing to pull today. New weeds pop up tomorrow, because life.", spot("tool"), SAGE);
      }, 550);
    }
  };
  const toolProps = {
    "aria-label": tool?.kind === "can" ? "Watering can. Drag it over a flower and tap to pour. Arrow keys move it." : "Trowel. Drag it onto a weed and tap to dig. Arrow keys move it.",
    onPointerDown: (e: PointerEvent<SVGGElement>) => {
      if (!tool) return;
      const p = svgPoint(e.clientX, e.clientY);
      if (!p) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: tool.x - p.x, dy: tool.y - p.y, moved: false };
    },
    onPointerMove: (e: PointerEvent<SVGGElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      d.moved = true;
      const p = svgPoint(e.clientX, e.clientY);
      if (p) setTool((t) => (t ? clampTool({ ...t, x: p.x + d.dx, y: p.y + d.dy, dragging: true }) : t));
    },
    onPointerUp: (e: PointerEvent<SVGGElement>) => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.id !== e.pointerId) return;
      if (d.moved) setTool((t) => (t ? { ...t, dragging: false } : t));
      else applyTool();
    },
    onPointerCancel: () => { drag.current = null; setTool((t) => (t ? { ...t, dragging: false } : t)); },
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      const step: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
      const s = step[e.key];
      if (s) { e.preventDefault(); setTool((t) => (t ? clampTool({ ...t, x: t.x + s[0], y: t.y + s[1] }) : t)); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); applyTool(); }
      else if (e.key === "Escape") setTool(null);
    },
  };
  const doSun = () => {
    setSunBurst(Date.now());
    show("A little sunshine", next("sun", SUN_MESSAGES), spot("sun"), GOLD);
    burst(spot("sun"), "var(--mm-gold)");
    later(() => popPlant(-1), 350);
  };
  const pullWeed = (x?: number) => {
    const target = x ?? weeds[0];
    if (target === undefined) {
      show("All clear", "Nothing to pull today. New weeds pop up tomorrow, because life.", null, SAGE);
      return;
    }
    const el = spot(`weed-${target}`);
    show("Weed pulled", next("weed", WEED_MESSAGES), el, SAGE);
    burst(el, "#5d7a3a");
    setPulling(target);
    later(() => {
      setWeeds((w) => {
        const left = w.filter((v) => v !== target);
        const d = today();
        let pulled: number[] = [];
        try { pulled = JSON.parse(store.get(`pip:weeds:${d}`) ?? "[]") as number[]; } catch { pulled = []; }
        store.set(`pip:weeds:${d}`, JSON.stringify([...pulled, target]));
        return left;
      });
      setPulling(null);
    }, 600);
  };

  const onPick = (p: Pick, el: Element) => {
    markTapped();
    // Holding a tool: tapping a plant or weed moves the tool there, ready to use.
    if (tool && (p.kind === "flower" || p.kind === "bud" || p.kind === "sprout") && p.slot !== undefined) {
      const spotP = plantSpots(petals).find((s) => s.slot === p.slot);
      if (spotP) { moveToolTo(spotP.x, spotP.top); return; }
    }
    if (tool && p.kind === "weed" && p.weed !== undefined) {
      if (tool.kind === "trowel") { moveToolTo(p.weed, BASE); return; }
    }
    if (!tool && p.kind === "weed" && p.weed !== undefined) {
      setTool(clampTool({ kind: "trowel", x: p.weed, y: BASE - 20, tipping: false, dragging: false }));
      show("Grab the trowel", "It's right there on the weed. Tap the trowel to dig it out.", null, SAGE);
      return;
    }
    const f = p.flower ? flowerInfo(p.flower) : null;
    switch (p.kind) {
      case "flower":
        show(`${f!.name} · ${f!.meaning}`, next(f!.key, f!.messages), el, f!.colour);
        popPlant(p.slot ?? -1);
        burst(el, f!.colour);
        break;
      case "bud":
        show(`${f!.name} bud`, SPOTS.bud.message, el, f!.colour);
        popPlant(p.slot ?? -1);
        break;
      case "sprout":
        show(SPOTS.sprout.title, SPOTS.sprout.message, el, SAGE);
        popPlant(p.slot ?? -1);
        break;
      case "seed": show(SPOTS.seed.title, SPOTS.seed.message, el, GOLD); break;
      case "sun": doSun(); break;
      case "soil":
        if (thirst) show(SPOTS.thirsty.title, SPOTS.thirsty.message, el, WATER);
        else show(SPOTS.soil.title, SPOTS.soil.message, el, "#8a6446");
        break;
      case "butterfly": show(SPOTS.butterfly.title, SPOTS.butterfly.message, el, "var(--mm-plum-2)"); burst(el, "var(--mm-plum-2)"); break;
      case "bee": show(SPOTS.bee.title, SPOTS.bee.message, el, GOLD); break;
      case "cloud": show(SPOTS.cloud.title, SPOTS.cloud.message, el, "#8b8597"); break;
      case "weed": if (tool) show("Wrong tool", "Swap to the trowel for weeds.", el, SAGE); break;
    }
  };

  const pickWeather = (k: WeatherKey) => {
    setWeather(k);
    const w = WEATHER.find((x) => x.key === k)!;
    show(`${w.name} today`, w.message, null, k === "sunny" ? GOLD : "#6d7894");
  };

  const plant = (keys: FlowerKey[]) => {
    setFlowers(keys);
    setPicker(false);
    const stages = [...plantStages(petals), ...backStages(petals)];
    setGrown(stages.map((s, i) => (s > 0 ? i : -1)).filter((i) => i >= 0));
    later(() => setGrown([]), 2600);
    const names = keys.map((k) => flowerInfo(k).name);
    show("Planted", `${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]}. ${petals >= 15 ? "Tap a bloom to hear what it has to say." : "Keep looking after yourself and watch them come up."}`, null, "var(--mm-rose)");
  };

  return (
    <div className="flex flex-col">
      {growth && (
        <p className="sprout-option flex items-start gap-2 bg-gold-soft px-[18px] py-2.5 text-sm font-bold text-ink">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
          {growth}
        </p>
      )}
      <div ref={wrap} className="relative" onKeyDown={(e) => e.key === "Escape" && setBubble(null)}>
        <GardenScene petals={petals} flowers={flowers} weather={weather} thirst={thirst} weeds={weeds} pulling={pulling} watering={watering} sunBurst={sunBurst} grown={grown} pop={pop} hint={hint && !tool} onPick={onPick} watered={watered} tool={tool} toolProps={toolProps} />
        {bubble && !bubble.strip && (
          <div
            key={bubble.key}
            className="garden-bubble pointer-events-none absolute z-10 rounded-2xl border border-line bg-card py-2 pl-3 pr-9 text-left shadow-lift"
            style={{ left: bubble.left, top: bubble.top, width: bubble.width, ["--bubble-shift" as string]: bubble.above ? "-100%" : "0%" }}
          >
            <p className="flex items-center gap-1.5 font-display text-[14.5px] font-bold leading-tight text-ink">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: bubble.accent }} />
              {bubble.title}
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink">{bubble.message}</p>
            <button type="button" aria-label="Close message" onClick={() => setBubble(null)} className="pointer-events-auto absolute right-0 top-0 grid size-10 place-items-center rounded-full text-muted-foreground">
              <X className="size-4" aria-hidden="true" />
            </button>
            <span
              aria-hidden="true"
              className={`absolute size-3 rotate-45 bg-card ${bubble.above ? "-bottom-1.5 border-b border-r" : "-top-1.5 border-l border-t"} border-line`}
              style={{ left: bubble.arrow - 6 }}
            />
          </div>
        )}
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{live}</p>
      {bubble?.strip ? (
        <div key={bubble.key} className="garden-strip relative mx-[18px] mt-3 rounded-2xl border-l-4 bg-sunk py-2.5 pl-3 pr-10" style={{ borderLeftColor: bubble.accent }}>
          <p className="font-display text-[15px] font-bold leading-tight">{bubble.title}</p>
          <p className="mt-0.5 text-[13.5px] leading-snug">{bubble.message}</p>
          <button type="button" aria-label="Close message" onClick={() => setBubble(null)} className="absolute right-0 top-0 grid size-10 place-items-center rounded-full text-muted-foreground">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <p className="px-[18px] pt-2.5 text-center text-[13px] text-muted-foreground">Tap anything in your garden: the flowers, the sun, the soil, even the visitors.</p>
      )}

      <div className="grid grid-cols-3 gap-2 px-[18px] pt-3">
        <ToolButton onClick={() => pickUp("can")} pressed={tool?.kind === "can"} label={tool?.kind === "can" ? "Put it down" : "Water"} icon={<Droplets className="size-6" style={{ color: WATER }} aria-hidden="true" />} note={thirst && plantSpots(petals).some((p) => !watered.includes(p.slot)) ? "Thirsty" : undefined} />
        <ToolButton onClick={doSun} label="Sunshine" icon={<Sun className="size-6 text-gold" aria-hidden="true" />} />
        <ToolButton onClick={() => pickUp("trowel")} pressed={tool?.kind === "trowel"} label={tool?.kind === "trowel" ? "Put it down" : weeds.length ? `Weeds · ${weeds.length}` : "No weeds"} icon={<Shovel className="size-6 text-sage" aria-hidden="true" />} />
      </div>

      <div className="flex flex-col gap-2 px-[18px] pt-5">
        <div>
          <h3 id="weather-q" className="text-[15px]">What's the weather like for you today?</h3>
          <p className="text-[12.5px] text-muted-foreground">Your garden will show it. Just for right now, never saved.</p>
        </div>
        <div role="radiogroup" aria-labelledby="weather-q" className="flex flex-wrap gap-1.5">
          {WEATHER.map((w) => {
            const I = WEATHER_ICON[w.key];
            const on = weather === w.key;
            return (
              <button key={w.key} type="button" role="radio" aria-checked={on} onClick={() => pickWeather(w.key)}
                className={`press flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-bold ${on ? "border-plum bg-plum text-shell" : "border-line bg-card text-ink"}`}>
                <I className="size-4" aria-hidden="true" />{w.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`mx-[18px] mt-4 flex items-center gap-3 rounded-2xl border p-3 ${flowersChosen ? "border-line bg-sunk" : "badge-new border-gold bg-gold-soft"}`}>
        <div className="flex min-w-0 flex-1 flex-col">
          <b className="font-display text-[15px]">{flowersChosen ? "Your flowers" : "Choose your flowers"}</b>
          {flowersChosen ? (
            <span className="flex flex-wrap -space-x-1.5 pt-0.5" aria-label={flowers.map((k) => flowerInfo(k).name).join(", ")}>
              {flowers.map((k) => <FlowerPreview key={k} k={k} className="size-8" />)}
            </span>
          ) : (
            <span className="text-[13px] leading-snug text-muted-foreground">Dahlia, peony, rose, sunflower, waratah… pick the ones you'd love to grow.</span>
          )}
        </div>
        <button type="button" onClick={() => setPicker(true)} className="press flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-plum px-4 text-sm font-bold text-shell">
          <Flower2 className="size-4" aria-hidden="true" />{flowersChosen ? "Change" : "Choose"}
        </button>
      </div>
      <FlowerPicker open={picker} initial={flowers} onClose={() => setPicker(false)} onSave={plant} />
    </div>
  );
}

function ToolButton({ onClick, label, icon, note, pressed }: { onClick: () => void; label: string; icon: ReactNode; note?: string | undefined; pressed?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={pressed} className={`press relative flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border text-sm font-bold text-ink shadow-soft ${pressed ? "border-plum bg-plum-soft" : "border-line bg-card"}`}>
      {icon}
      {label}
      {note && <span className="absolute -top-2 right-1.5 rounded-full bg-gold px-2 py-0.5 text-[11px] text-[#271f31]">{note}</span>}
    </button>
  );
}
