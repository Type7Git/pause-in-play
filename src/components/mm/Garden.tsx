import type { KeyboardEvent, MouseEvent, ReactNode, SVGProps } from "react";
import { plantStages } from "@/lib/levels";
import { BACK, BACK_BASE, BASE, CAN_REST, CAN_TIP, SLOTS, backStages, spoutTip } from "@/lib/garden";
import { DEFAULT_FLOWERS, flowerInfo, type FlowerKey, type WeatherKey } from "@/content/garden";

/** The garden picture. Pure drawing: interaction (bubbles, tools) lives in GardenPlay. */

const W = 340;
const H = 190;

export type PickKind = "flower" | "sprout" | "bud" | "seed" | "sun" | "soil" | "butterfly" | "bee" | "cloud" | "weed";
export type Pick = { kind: PickKind; slot?: number; flower?: FlowerKey; weed?: number };
type OnPick = (p: Pick, el: Element) => void;

function Spot({ label, pick, onPick, children, spot }: { label: string; pick: Pick; onPick?: OnPick | undefined; children: ReactNode; spot?: string }) {
  if (!onPick) return <g data-spot={spot}>{children}</g>;
  const go = (e: MouseEvent<SVGGElement> | KeyboardEvent<SVGGElement>) => onPick(pick, e.currentTarget);
  return (
    <g role="button" tabIndex={0} aria-label={label} data-spot={spot} className="mm-hot cursor-pointer" onClick={go}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(e); } }}>
      {children}
    </g>
  );
}

const ring = (n: number, fn: (i: number, deg: number) => ReactNode) => Array.from({ length: n }, (_, i) => fn(i, (360 / n) * i));

/** A bloom centred on (x, y). Each species is drawn from simple shapes so it stays crisp at any size. */
export function FlowerHead({ k, x, y }: { k: FlowerKey; x: number; y: number }) {
  const rot = (d: number) => `rotate(${d} ${x} ${y})`;
  switch (k) {
    case "daisy":
      return <g>{ring(12, (i, d) => <ellipse key={i} cx={x} cy={y - 6} rx="2.3" ry="5.4" fill="#fbfaf6" stroke="#d9d0c2" strokeWidth=".5" transform={rot(d)} />)}<circle cx={x} cy={y} r="3.4" fill="#f2b01e" /></g>;
    case "sunflower":
      return <g>
        {ring(14, (i, d) => <ellipse key={`a${i}`} cx={x} cy={y - 8} rx="2.8" ry="6.2" fill="#e39a12" transform={rot(d + 12.8)} />)}
        {ring(14, (i, d) => <ellipse key={`b${i}`} cx={x} cy={y - 8} rx="2.6" ry="6.4" fill="#f6bd2a" transform={rot(d)} />)}
        <circle cx={x} cy={y} r="5.4" fill="#6b4423" />
        {ring(6, (i, d) => <circle key={`c${i}`} cx={x} cy={y - 2.6} r=".8" fill="#a36b3a" transform={rot(d)} />)}
      </g>;
    case "rose":
      return <g>
        <path d={`M${x - 8} ${y + 3} q8 9 16 0`} fill="var(--mm-sage)" />
        <circle cx={x} cy={y} r="8" fill="#c8364a" />
        <path d={`M${x - 7} ${y + 2} q7 7 14 0`} stroke="#8f1f33" strokeWidth="1.2" fill="none" />
        <path d={`M${x - 1} ${y} a1.6 1.6 0 1 1 3 0 a3.2 3.2 0 1 1 -6.2 0 a4.8 4.8 0 1 1 9.4 .4`} stroke="#8f1f33" strokeWidth="1.1" fill="none" />
      </g>;
    case "peony":
      return <g>
        {ring(8, (i, d) => <circle key={`a${i}`} cx={x} cy={y - 5.2} r="4.3" fill="#e98aa8" transform={rot(d)} />)}
        {ring(5, (i, d) => <circle key={`b${i}`} cx={x} cy={y - 2.6} r="3.5" fill="#f4b6c8" transform={rot(d + 20)} />)}
        <circle cx={x} cy={y} r="2.4" fill="#fbdbe5" />
      </g>;
    case "dahlia":
      return <g>
        {ring(16, (i, d) => <ellipse key={`a${i}`} cx={x} cy={y - 6.4} rx="2.3" ry="6" fill="#d9467a" transform={rot(d)} />)}
        {ring(10, (i, d) => <ellipse key={`b${i}`} cx={x} cy={y - 3.8} rx="1.9" ry="3.9" fill="#ef7aa0" transform={rot(d + 18)} />)}
        <circle cx={x} cy={y} r="2.2" fill="#f6c344" />
      </g>;
    case "daffodil":
      return <g>
        {ring(6, (i, d) => <ellipse key={i} cx={x} cy={y - 5.6} rx="3.6" ry="6.4" fill="#f8e38a" stroke="#e8c95a" strokeWidth=".5" transform={rot(d)} />)}
        <circle cx={x} cy={y} r="4.1" fill="#f39a1e" />
        <circle cx={x} cy={y} r="2.4" fill="#d9741a" />
      </g>;
    case "tulip":
      return <g>
        <path d={`M${x - 6.5} ${y - 4} Q${x - 7.5} ${y + 7} ${x} ${y + 7} Q${x + 7.5} ${y + 7} ${x + 6.5} ${y - 4} L${x + 3.2} ${y} L${x} ${y - 6.5} L${x - 3.2} ${y} Z`} fill="#e3506b" />
        <path d={`M${x - 2.6} ${y - 1} Q${x} ${y - 8} ${x + 2.6} ${y - 1} Q${x} ${y + 6} ${x - 2.6} ${y - 1}Z`} fill="#f07a8f" />
      </g>;
    case "lavender":
      return <g>{Array.from({ length: 7 }, (_, j) => <ellipse key={j} cx={x + (j % 2 ? 1.7 : -1.7)} cy={y + 6 - j * 2.7} rx="2.1" ry="2.7" fill={j % 2 ? "#b49ae0" : "#9b7fd1"} />)}</g>;
    case "waratah":
      return <g>
        {ring(7, (i, d) => <path key={`a${i}`} d={`M${x} ${y + 3} l-2.4 9 l2.4 -2 l2.4 2z`} fill="#a8172a" transform={`rotate(${d * 0.5 - 75} ${x} ${y + 3})`} />)}
        <ellipse cx={x} cy={y - 1} rx="6.4" ry="7.6" fill="#c8202f" />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 - (r === 3 ? 1 : 0) }, (_, c) => (
          <circle key={`${r}-${c}`} cx={x - 3.6 + c * 2.4 + (r % 2) * 1.2} cy={y + 4 - r * 3.2} r="1.3" fill="#e5384a" />
        )))}
      </g>;
  }
}

function Bud({ k, x, y }: { k: FlowerKey; x: number; y: number }) {
  if (k === "lavender") return <g>{[0, 1, 2].map((j) => <ellipse key={j} cx={x + (j % 2 ? 1.4 : -1.4)} cy={y + 2 - j * 2.6} rx="1.7" ry="2.3" fill="#8aa07a" />)}</g>;
  const col = k === "daisy" ? "#e9efe0" : flowerInfo(k).colour;
  return <g>
    <ellipse cx={x} cy={y - 3} rx="4.4" ry="7" fill={col} />
    <path d={`M${x - 5} ${y + 1} q5 5 10 0 l-2 -5 l-3 3 l-3 -3z`} fill="var(--mm-sage)" />
  </g>;
}

function Plant({ x, h, stage, k, i, thirst, grow, pop, hint, onPick, base: BASE = 168, scale = 1 }: {
  x: number; h: number; stage: number; k: FlowerKey; i: number; thirst: number; grow: boolean; pop: boolean; hint: boolean; onPick?: OnPick | undefined; base?: number; scale?: number;
}) {
  const info = flowerInfo(k);
  const full = k === "lavender" ? h * 0.9 : h;
  const ph = stage === 1 ? full * 0.4 : stage === 2 ? full * 0.8 : full;
  const top = BASE - ph;
  const droop = thirst * 6 * (i % 2 ? 1 : -1);
  const origin = { transformOrigin: `${x}px ${BASE}px` };
  const label = stage >= 3 ? `${info.name} in bloom` : stage === 2 ? `${info.name} bud` : "A new sprout";
  const pick: Pick = { kind: stage >= 3 ? "flower" : stage === 2 ? "bud" : "sprout", slot: i, flower: k };
  return (
    <g className="garden-sway" style={{ ...origin, animationDelay: `${-i * 0.7}s` }}>
      <g className={grow ? "garden-grow" : pop ? "garden-pop" : ""} style={{ ...origin, animationDelay: grow ? `${0.3 + i * 0.18}s` : undefined }}>
        <g transform={`rotate(${droop} ${x} ${BASE})`} opacity={thirst === 2 ? 0.78 : thirst === 1 ? 0.9 : 1}>
          <Spot label={label} pick={pick} onPick={onPick} spot={`plant-${i}`}>
            <rect x={x - 15} y={top - 16} width="30" height={BASE - top + 16} fill="transparent" />
            <path d={`M${x} ${BASE} C ${x - 3} ${BASE - ph * 0.4}, ${x + 3} ${BASE - ph * 0.7}, ${x} ${top}`} stroke="var(--mm-sage)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d={`M${x} ${BASE - ph * 0.35} q11 -9 17 -3 q-8 9 -17 3z`} fill="var(--mm-sage)" />
            <path d={`M${x} ${BASE - ph * 0.55} q-11 -9 -16 -2 q8 8 16 2z`} fill="var(--mm-sage)" opacity=".85" />
            <g transform={scale === 1 ? undefined : `translate(${x} ${top}) scale(${scale}) translate(${-x} ${-top})`}>
              {stage === 2 && <Bud k={k} x={x} y={top} />}
              {stage >= 3 && <FlowerHead k={k} x={x} y={top} />}
            </g>
            {hint && <circle cx={x} cy={top} r="13" fill="none" stroke="var(--mm-gold)" strokeWidth="2" className="mm-ring" style={{ transformBox: "fill-box", transformOrigin: "center" }} />}
          </Spot>
        </g>
      </g>
    </g>
  );
}

function Cloud({ cx, cy, s, fill }: { cx: number; cy: number; s: number; fill: string }) {
  return <g fill={fill}>
    <ellipse cx={cx} cy={cy} rx={18 * s} ry={8 * s} />
    <circle cx={cx - 7 * s} cy={cy - 5 * s} r={8 * s} />
    <circle cx={cx + 5 * s} cy={cy - 8 * s} r={10 * s} />
  </g>;
}

const CLOUDS: Record<WeatherKey, number> = { sunny: 1, cloudy: 3, windy: 2, rainy: 3, stormy: 4 };

export type SceneProps = {
  petals: number;
  flowers?: FlowerKey[];
  weather?: WeatherKey;
  thirst?: number;
  weeds?: number[];
  pulling?: number | null;
  watering?: number;
  sunBurst?: number;
  grown?: number[];
  pop?: number | null;
  hint?: boolean;
  onPick?: OnPick;
  /** Plants watered this visit stand back up straight away. */
  watered?: number[];
  tool?: GardenTool | null;
  toolProps?: SVGProps<SVGGElement>;
};

export type GardenTool = { kind: "can" | "trowel"; x: number; y: number; tipping: boolean; dragging: boolean };


function ToolView({ t, props }: { t: GardenTool; props?: SVGProps<SVGGElement> | undefined }) {
  const can = t.kind === "can";
  const tilt = can ? (t.tipping ? CAN_TIP : CAN_REST) : t.tipping ? -40 : -12;
  const tip = spoutTip(CAN_TIP);
  return (
    <g
      {...props}
      data-spot="tool"
      role="button"
      tabIndex={0}
      className="mm-hot"
      style={{ transform: `translate(${t.x}px, ${t.y}px)`, transition: t.dragging ? "none" : "transform .45s cubic-bezier(.2,.8,.3,1.1)", touchAction: "none", cursor: t.dragging ? "grabbing" : "grab" }}
    >
      <circle r="26" fill="transparent" />
      <circle r="22" fill="var(--mm-card)" opacity={t.dragging ? 0.35 : 0.18} />
      <g style={{ transform: `rotate(${tilt}deg)`, transition: "transform .35s ease-in-out" }}>
        {can ? (
          <>
            <path d="M-14 -11 q-11 1 -11 10 q0 9 11 9" stroke="#5f8fbf" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M8 -4 L22 -12 L24.5 -9 L10 2z" fill="#6f9cc8" />
            <ellipse cx="24" cy="-11.5" rx="2.6" ry="4.2" fill="#5f8fbf" transform="rotate(-30 24 -11.5)" />
            <path d="M-15 -12 h24 v19 q0 5 -5 5 h-14 q-5 0 -5 -5z" fill="#7aa8d4" />
            <path d="M-15 -12 h24 v4 h-24z" fill="#5f8fbf" />
            <path d="M-11 -6 v12" stroke="#fff" strokeWidth="2" opacity=".35" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="-2.6" y="-26" width="5.2" height="15" rx="2.6" fill="#a8744a" />
            <rect x="-1.2" y="-12" width="2.4" height="6" fill="#8a8f98" />
            <path d="M-7 -6 h14 q0 14 -7 20 q-7 -6 -7 -20z" fill="#b7bcc6" />
            <path d="M-4 -4 q1 9 4 13" stroke="#fff" strokeWidth="1.2" opacity=".5" fill="none" />
          </>
        )}
      </g>
      {can && t.tipping && [0, 1, 2, 3, 4, 5].map((j) => (
        <circle key={j} cx={tip.x + (j % 3) - 1} cy={tip.y} r="1.7" fill="#5f8fbf" className="garden-pour" style={{ animationDelay: `${j * 0.1}s` }} />
      ))}
      {!can && t.tipping && [0, 1, 2, 3].map((j) => (
        <circle key={j} cx={(j - 1.5) * 4} cy="14" r="1.8" fill="#8a6446" className="garden-dirt" style={{ animationDelay: `${j * 0.06}s` }} />
      ))}
    </g>
  );
}

export function GardenScene({ petals, flowers = DEFAULT_FLOWERS, weather = "sunny", thirst = 0, weeds = [], pulling = null, watering = 0, sunBurst = 0, grown = [], pop = null, hint = false, onPick, watered = [], tool = null, toolProps }: SceneProps) {
  const stages = plantStages(petals);
  const back = backStages(petals);
  const blooms = [...stages, ...back].filter((s) => s >= 3).length;
  const growing = [...stages, ...back].filter((s) => s > 0 && s < 3).length;
  const label = `Your garden has ${blooms} ${blooms === 1 ? "flower" : "flowers"}${growing ? ` and ${growing} growing ${growing === 1 ? "plant" : "plants"}` : ""}`;
  const wet = weather === "rainy" || weather === "stormy";
  const shade = { sunny: 0, windy: 0.05, cloudy: 0.14, rainy: 0.24, stormy: 0.4 }[weather];
  const cloudFill = weather === "stormy" ? "#8b8597" : wet ? "#b9b4c2" : "#ffffff";
  const firstBloom = stages.findIndex((s) => s > 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={label} className={`block w-full ${weather === "windy" || weather === "stormy" ? "garden-windy" : ""}`}>
      <rect width={W} height={H} fill="var(--mm-sky)" />
      <rect width={W} height={H} fill="#55607a" opacity={shade} style={{ transition: "opacity 1s" }} />

      <Spot label="The sun" pick={{ kind: "sun" }} onPick={onPick} spot="sun">
        <g opacity={wet ? 0.25 : weather === "cloudy" ? 0.55 : 1} style={{ transition: "opacity 1s" }}>
          <g className="garden-spin" style={{ transformOrigin: "290px 36px" }}>
            {ring(10, (i, d) => <rect key={i} x="288.5" y="8" width="3" height="8" rx="1.5" fill="var(--mm-gold)" opacity=".55" transform={`rotate(${d} 290 36)`} />)}
          </g>
          <circle cx="290" cy="36" r="17" fill="var(--mm-gold-soft)" />
          <circle cx="290" cy="36" r="11" fill="var(--mm-gold)" opacity=".7" />
          <circle cx="290" cy="36" r="26" fill="transparent" />
        </g>
        {sunBurst > 0 && <circle key={sunBurst} cx="290" cy="36" r="20" fill="var(--mm-gold)" className="garden-sunburst" style={{ transformOrigin: "290px 36px" }} />}
      </Spot>

      {Array.from({ length: CLOUDS[weather] }, (_, i) => (
        <g key={`${weather}-${i}`} className={weather === "windy" || weather === "stormy" ? "garden-drift-fast" : "garden-drift"} style={{ animationDelay: `${-i * (weather === "windy" ? 4 : 13) - 3}s` }}>
          <Spot label="A passing cloud" pick={{ kind: "cloud" }} onPick={onPick}>
            <Cloud cx={0} cy={22 + (i % 3) * 16} s={0.8 + (i % 2) * 0.35} fill={cloudFill} />
          </Spot>
        </g>
      ))}

      {weather === "stormy" && <g className="garden-flash"><rect width={W} height={H} fill="#fff" /><path d="M120 20 l-10 26 h9 l-8 24 l22 -32 h-10 l9 -18z" fill="#f6d24a" /></g>}

      <path d={`M0 128 Q 90 100 180 124 T ${W} 112 V${H} H0z`} fill="var(--mm-hill-2)" />
      <path d={`M0 156 Q 110 138 220 154 T ${W} 150 V${H} H0z`} fill="var(--mm-hill)" />

      {BACK.map(([x, h], j) => {
        const st = back[j] ?? 0;
        const k = flowers[(j + 3) % flowers.length] ?? "rose";
        return st > 0 ? <Plant key={`b${j}-${k}`} x={x} h={h} stage={st} k={k} i={j + 7} thirst={watered.includes(j + 7) ? 0 : thirst} grow={grown.includes(j + 7)} pop={pop === j + 7 || pop === -1} hint={false} onPick={onPick} base={BACK_BASE} scale={0.8} /> : null;
      })}

      <Spot label="The soil" pick={{ kind: "soil" }} onPick={onPick} spot="soil">
        <path d={`M0 164 Q170 156 ${W} 164 V${H} H0z`} fill="var(--mm-hill-2)" />
        <path d={`M0 164 Q170 156 ${W} 164 V${H} H0z`} fill="#5a3f2b" opacity={wet ? 0.28 : thirst ? 0 : 0.12} style={{ transition: "opacity 1s" }} />
        {watering > 0 && <path key={watering} d={`M0 164 Q170 156 ${W} 164 V${H} H0z`} fill="#5a3f2b" className="garden-soak" />}
      </Spot>

      {SLOTS.map(([x, h], i) => {
        const st = stages[i] ?? 0;
        const k = flowers[i % flowers.length] ?? "rose";
        return st > 0 ? (
          <Plant key={`${i}-${k}`} x={x} h={h} stage={st} k={k} i={i} thirst={watered.includes(i) ? 0 : thirst} grow={grown.includes(i)} pop={pop === i || pop === -1} hint={hint && i === firstBloom} onPick={onPick} />
        ) : (
          <Spot key={i} label="A seed, waiting" pick={{ kind: "seed", slot: i }} onPick={onPick}>
            <ellipse cx={x} cy={BASE + 1} rx="8" ry="3" fill="var(--mm-hill-2)" />
            <circle cx={x} cy={BASE - 2} r="2.5" fill="var(--mm-gold)" opacity=".7" />
            <circle cx={x} cy={BASE - 7} r="15" fill="transparent" />
          </Spot>
        );
      })}

      {weeds.map((x) => (
        <g key={`w${x}`} className={pulling === x ? "garden-pull" : ""} style={{ transformOrigin: `${x}px ${BASE}px` }}>
          <Spot label="A weed. Tap to pull it out" pick={{ kind: "weed", weed: x }} onPick={onPick} spot={`weed-${x}`}>
            <path d={`M${x} ${BASE + 2} l-6 -9 l4 2 l-1 -8 l3 5 l1 -9 l2 9 l3 -5 l-1 8 l4 -2 l-6 9z`} fill="#5d7a3a" />
            <circle cx={x} cy={BASE - 6} r="13" fill="transparent" />
          </Spot>
        </g>
      ))}

      {blooms >= 1 && !wet && (
        <g className="garden-flutter">
          <Spot label="A butterfly" pick={{ kind: "butterfly" }} onPick={onPick}>
            <circle r="13" fill="transparent" />
            <g className="garden-flap">
              <ellipse cx="-4" cy="-2" rx="4.5" ry="3.6" fill="var(--mm-plum-2)" />
              <ellipse cx="4" cy="-2" rx="4.5" ry="3.6" fill="var(--mm-plum-2)" />
              <ellipse cx="-3" cy="2.4" rx="3" ry="2.4" fill="#f2a65a" />
              <ellipse cx="3" cy="2.4" rx="3" ry="2.4" fill="#f2a65a" />
            </g>
            <rect x="-.7" y="-4" width="1.4" height="8" rx=".7" fill="#3b2e46" />
          </Spot>
        </g>
      )}
      {blooms >= 3 && !wet && (
        <g className="garden-buzz">
          <Spot label="A bee" pick={{ kind: "bee" }} onPick={onPick}>
            <circle r="12" fill="transparent" />
            <ellipse cx="-1" cy="-4" rx="2.6" ry="1.8" fill="#fff" opacity=".85" className="garden-flap" />
            <ellipse rx="4" ry="2.8" fill="#f2b01e" />
            <path d="M-1.2 -2.6 v5.2 M1.4 -2.6 v5.2" stroke="#3b2e46" strokeWidth="1.1" />
          </Spot>
        </g>
      )}

      {wet && Array.from({ length: weather === "stormy" ? 34 : 24 }, (_, i) => (
        <line key={i} x1={(i * 37) % W} y1="-10" x2={(i * 37) % W - 3} y2="0" stroke="#7d8fb0" strokeWidth="1.2" strokeLinecap="round" className="garden-rain" style={{ animationDelay: `${-(i * 0.137) % 1}s` }} />
      ))}
      {weather === "windy" && [40, 90, 70].map((y, i) => (
        <path key={i} d={`M0 ${y} q30 -6 60 0 t60 0`} stroke="#fff" strokeWidth="1.6" fill="none" opacity=".7" strokeLinecap="round" className="garden-gust" style={{ animationDelay: `${-i * 1.1}s` }} />
      ))}

      {tool && <ToolView t={tool} props={toolProps} />}
    </svg>
  );
}
