export const LEVELS: [number, string][] = [
  [0, "Seedling"],
  [20, "Sprout"],
  [50, "Bud"],
  [100, "In bloom"],
  [200, "Wildflower meadow"],
];

export function getLevel(petals: number) {
  let idx = 0;
  LEVELS.forEach(([min], i) => {
    if (petals >= min) idx = i;
  });
  const [min, name] = LEVELS[idx]!;
  const next = LEVELS[idx + 1] ?? null;
  return {
    name,
    next: next ? { min: next[0], name: next[1], remaining: next[0] - petals } : null,
    pct: next ? (petals - min) / (next[0] - min) : 1,
  };
}

/** Growth stage (0 seed … 3 bloom) for each of the 7 garden slots. */
export function plantStages(petals: number, slots = 7) {
  const units = Math.floor(petals / 5);
  return Array.from({ length: slots }, (_, i) =>
    units > i ? Math.min(3, Math.ceil((units - i) / 2)) : 0,
  );
}
