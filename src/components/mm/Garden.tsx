import { plantStages } from "@/lib/levels";

const SLOTS: [number, number][] = [[40, 52], [82, 70], [124, 46], [166, 80], [208, 58], [250, 74], [292, 50]];
const COLS = ["var(--mm-rose)", "var(--mm-plum-2)", "var(--mm-gold)"];

function Flower({ x, stage, col, h: full }: { x: number; stage: number; col: string; h: number }) {
  const base = 150;
  const h = stage === 1 ? full * 0.45 : full;
  const top = base - h;
  return (
    <g>
      <path d={`M${x} ${base} C ${x - 3} ${base - h * 0.4}, ${x + 3} ${base - h * 0.7}, ${x} ${top}`} stroke="var(--mm-sage)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d={`M${x} ${base - h * 0.35} q10 -8 16 -3 q-8 8 -16 3z`} fill="var(--mm-sage)" />
      <path d={`M${x} ${base - h * 0.55} q-10 -8 -15 -2 q8 7 15 2z`} fill="var(--mm-sage)" opacity=".85" />
      {stage === 2 && (
        <>
          <ellipse cx={x} cy={top - 4} rx="5" ry="8" fill={col} />
          <path d={`M${x - 5} ${top} q5 4 10 0`} fill="var(--mm-sage)" />
        </>
      )}
      {stage >= 3 && (
        <>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <ellipse key={k} cx={x} cy={top - 8} rx="5" ry="8" fill={col} transform={`rotate(${k * 60} ${x} ${top})`} />
          ))}
          <circle cx={x} cy={top} r="4.5" fill="var(--mm-gold-soft)" />
          <circle cx={x} cy={top} r="2" fill="var(--mm-gold)" />
        </>
      )}
    </g>
  );
}

export function GardenScene({ petals }: { petals: number }) {
  const stages = plantStages(petals);
  return (
    <svg viewBox="0 0 340 170" role="img" aria-label="Your garden" className="block w-full">
      <rect width="340" height="170" fill="var(--mm-sky)" />
      <circle cx="286" cy="38" r="18" fill="var(--mm-gold-soft)" />
      <circle cx="286" cy="38" r="11" fill="var(--mm-gold)" opacity=".55" />
      <path d="M0 120 Q 90 92 180 116 T 340 104 V170 H0z" fill="var(--mm-hill-2)" />
      <path d="M0 146 Q 110 128 220 144 T 340 140 V170 H0z" fill="var(--mm-hill)" />
      {SLOTS.map(([x, h], i) =>
        stages[i] ? (
          <Flower key={i} x={x} h={h} stage={stages[i]} col={COLS[i % 3]} />
        ) : (
          <g key={i}>
            <ellipse cx={x} cy="151" rx="8" ry="3" fill="var(--mm-hill-2)" />
            <circle cx={x} cy="148" r="2.5" fill="var(--mm-gold)" opacity=".7" />
          </g>
        ),
      )}
      <path d="M0 156 Q170 148 340 156 V170 H0z" fill="var(--mm-hill-2)" />
    </svg>
  );
}
