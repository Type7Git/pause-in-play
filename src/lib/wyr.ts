/** Would you rather? scoring. Each choice adds 1 to that option's character. */
export function scoreRound(choices: string[], rand: () => number = Math.random) {
  const tally: Record<string, number> = {};
  choices.forEach((c) => { tally[c] = (tally[c] ?? 0) + 1; });
  const ranked = Object.entries(tally)
    .map(([code, n]) => ({ code, n, r: rand() }))
    .sort((a, b) => b.n - a.n || a.r - b.r);
  return { winner: ranked[0]?.code ?? null, runnerUp: ranked[1]?.code ?? null, tally };
}

export function pickRound<T>(items: T[], n = 10, rand: () => number = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a.slice(0, n);
}

export const WYR_TOPICS: [string, string][] = [
  ["all", "Mix it up"], ["Perimenopause", "Perimenopause"], ["Parenting", "Parenting"], ["Love and relationships", "Love and relationships"],
  ["Work", "Work"], ["Food", "Food"], ["Style", "Style"], ["Superpowers", "Superpowers"], ["People", "People"], ["Just for fun", "Just for fun"],
];
