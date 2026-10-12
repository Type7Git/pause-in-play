import { useState, type ReactNode } from "react";
import { plantStages } from "@/lib/levels";

const SLOTS: [number, number][] = [[40, 52], [82, 70], [124, 46], [166, 80], [208, 58], [250, 74], [292, 50]];
const COLS = ["var(--mm-rose)", "var(--mm-plum-2)", "var(--mm-gold)"];

type SpotProps = { label: string; message: string; onPick: (message: string) => void; children: ReactNode };
function Spot({ label, message, onPick, children }: SpotProps) {
  return <g role="button" tabIndex={0} aria-label={label} className="mm-hot cursor-pointer" onClick={() => onPick(message)} onKeyDown={e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(message); }
  }}><title>{label}</title>{children}</g>;
}

function Flower({ x, stage, col, h: full, onPick }: { x: number; stage: number; col: string; h: number; onPick: (message: string) => void }) {
  const base = 150;
  const h = stage === 1 ? full * 0.45 : full;
  const top = base - h;
  return <g>
    <Spot label="Stem · Small steps" message="Small acts of care give you something steady to lean on. One small step is enough." onPick={onPick}>
      <path d={`M${x} ${base} C ${x - 3} ${base - h * 0.4}, ${x + 3} ${base - h * 0.7}, ${x} ${top}`} stroke="var(--mm-sage)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d={`M${x} ${base} V${top}`} stroke="transparent" strokeWidth="18" />
    </Spot>
    <Spot label="Right leaf · Room to rest" message="Rest is part of growing. You don't have to earn a moment to yourself." onPick={onPick}>
      <path d={`M${x} ${base - h * 0.35} q10 -8 16 -3 q-8 8 -16 3z`} fill="var(--mm-sage)" stroke="transparent" strokeWidth="16" />
    </Spot>
    <Spot label="Left leaf · Kind words" message="Try speaking to yourself as you would to someone you love. You deserve that kindness too." onPick={onPick}>
      <path d={`M${x} ${base - h * 0.55} q-10 -8 -15 -2 q8 7 15 2z`} fill="var(--mm-sage)" opacity=".85" stroke="transparent" strokeWidth="16" />
    </Spot>
    {stage === 2 && <Spot label="Flower bud · Your own pace" message="You can grow at your own pace. Quiet progress still counts." onPick={onPick}>
      <ellipse cx={x} cy={top - 4} rx="5" ry="8" fill={col} stroke="transparent" strokeWidth="16" />
      <path d={`M${x - 5} ${top} q5 4 10 0`} fill="var(--mm-sage)" />
    </Spot>}
    {stage >= 3 && <>
      {[0, 1, 2, 3, 4, 5].map(k => <Spot key={k} label={`Flower petal ${k + 1} · A little care`} message={[
        "A little care today matters, even when no one else sees it.",
        "Taking a pause leaves room for what matters to you.",
        "You don't have to do everything to be doing enough.",
        "There is room for joy alongside the everyday things.",
        "Being gentle with yourself is a strength, not a shortcut.",
        "You can begin again whenever you need to. No catching up required.",
      ][k] ?? "You deserve kindness."} onPick={onPick}>
        <ellipse cx={x} cy={top - 8} rx="5" ry="8" fill={col} transform={`rotate(${k * 60} ${x} ${top})`} stroke="transparent" strokeWidth="6" />
      </Spot>)}
      <Spot label="Flower centre · You matter" message="You matter just as you are, not only for what you get done." onPick={onPick}>
        <circle cx={x} cy={top} r="4.5" fill="var(--mm-gold-soft)" />
        <circle cx={x} cy={top} r="2" fill="var(--mm-gold)" />
        <circle cx={x} cy={top} r="6" fill="transparent" />
      </Spot>
    </>}
  </g>;
}

export function GardenScene({ petals }: { petals: number }) {
  const [message, setMessage] = useState("Every small act of looking after yourself grows your garden.");
  const stages = plantStages(petals);
  const flowers = stages.filter(s => s >= 3).length;
  const growing = stages.filter(s => s > 0 && s < 3).length;
  const label = `Your garden has ${flowers} ${flowers === 1 ? "flower" : "flowers"}${growing ? ` and ${growing} growing ${growing === 1 ? "plant" : "plants"}` : ""}`;
  return <div>
    <svg viewBox="0 0 340 170" role="group" aria-label={label} className="block w-full">
      <rect width="340" height="170" fill="var(--mm-sky)" />
      <Spot label="Sunshine · A little warmth" message="A moment of kindness can bring a little warmth to your day. You deserve it." onPick={setMessage}>
        <circle cx="286" cy="38" r="18" fill="var(--mm-gold-soft)" />
        <circle cx="286" cy="38" r="11" fill="var(--mm-gold)" opacity=".55" />
      </Spot>
      <path d="M0 120 Q 90 92 180 116 T 340 104 V170 H0z" fill="var(--mm-hill-2)" />
      <path d="M0 146 Q 110 128 220 144 T 340 140 V170 H0z" fill="var(--mm-hill)" />
      {SLOTS.map(([x, h], i) => (stages[i] ?? 0) > 0 ?
        <Flower key={i} x={x} h={h} stage={stages[i] ?? 0} col={COLS[i % 3] ?? COLS[0] ?? "var(--mm-rose)"} onPick={setMessage} /> :
        <Spot key={i} label={`Seed ${i + 1} · Small beginnings`} message="Even the smallest beginning counts. A kind moment for yourself is a lovely place to start." onPick={setMessage}>
          <ellipse cx={x} cy="151" rx="8" ry="3" fill="var(--mm-hill-2)" />
          <circle cx={x} cy="148" r="2.5" fill="var(--mm-gold)" opacity=".7" />
          <circle cx={x} cy="143" r="15" fill="transparent" />
        </Spot>,
      )}
      <Spot label="Soil · Support" message="You don't have to hold everything on your own. It's okay to make room for support." onPick={setMessage}>
        <path d="M0 156 Q170 148 340 156 V170 H0z" fill="var(--mm-hill-2)" />
      </Spot>
    </svg>
    <p role="status" aria-live="polite" aria-atomic="true" className="flex min-h-20 items-center px-[18px] py-3 text-sm text-muted-foreground">{message}</p>
  </div>;
}
