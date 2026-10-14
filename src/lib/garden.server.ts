/** Server only: anonymous garden totals for "top X%" and badge rarity. Never returns anyone's identity. */
type Dist = { at: number; totals: number[]; badges: Record<string, number> };
let cache: Dist | null = null;
const TTL = 10 * 60_000;
const PAGE = 1000;
const MAX_ROWS = 500_000;

export async function gardenDistribution(): Promise<Dist> {
  if (cache && Date.now() - cache.at < TTL) return cache;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const sums = new Map<string, number>();
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await supabaseAdmin.from("petal_events").select("user_id, amount").order("id").range(from, from + PAGE - 1);
    if (error) throw error;
    for (const r of data) sums.set(r.user_id, (sums.get(r.user_id) ?? 0) + r.amount);
    if (data.length < PAGE) break;
  }
  const holders = new Map<string, Set<string>>();
  const users = new Set(sums.keys());
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await supabaseAdmin.from("badges_earned").select("user_id, badge_key").order("user_id").order("badge_key").range(from, from + PAGE - 1);
    if (error) throw error;
    for (const r of data) {
      users.add(r.user_id);
      if (!holders.has(r.badge_key)) holders.set(r.badge_key, new Set());
      holders.get(r.badge_key)!.add(r.user_id);
    }
    if (data.length < PAGE) break;
  }
  cache = {
    at: Date.now(),
    totals: [...users].map((u) => sums.get(u) ?? 0),
    badges: Object.fromEntries([...holders].map(([k, s]) => [k, s.size])),
  };
  return cache;
}
