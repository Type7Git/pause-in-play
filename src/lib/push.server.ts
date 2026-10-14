import type { SupabaseClient } from "@supabase/supabase-js";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

type Quest = { id: string; user_id: string; doing: string; next_step: string | null };

/**
 * Send due Side Quest nudges and mark them sent. With userId, only that user's
 * quests (RLS client); without, all users (admin client, scheduled job).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deliverDueNudges(supabase: SupabaseClient<any>, userId?: string) {
  const now = new Date().toISOString();
  let q = supabase
    .from("side_quests")
    .select("id, user_id, doing, next_step")
    .is("done_at", null)
    .is("notified_at", null)
    .not("remind_at", "is", null)
    .lte("remind_at", now)
    .limit(userId ? 5 : 200);
  if (userId) q = q.eq("user_id", userId);
  const { data: due, error: qErr } = await q;
  if (qErr) throw new Error(qErr.message);
  const quests = (due ?? []) as Quest[];
  if (!quests.length) return { sent: 0 };

  const userIds = [...new Set(quests.map((x) => x.user_id))];
  const { data: tokens, error: tErr } = await supabase
    .from("push_tokens")
    .select("id, user_id, token")
    .in("user_id", userIds);
  if (tErr) throw new Error(tErr.message);
  if (!tokens?.length) return { sent: 0 };

  const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
  const connectionApiKey = process.env["FIREBASE_MESSAGING_API_KEY"];
  if (!LOVABLE_API_KEY || !connectionApiKey) throw new Error("Push is not configured");
  const headers = {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": connectionApiKey,
    "Content-Type": "application/json",
  };

  let sent = 0;
  const stale: string[] = [];
  for (const quest of quests) {
    const body = `Your parked mission is waiting: ${quest.doing}. Next step: ${quest.next_step ?? "Pick up where I left off"}.`;
    let delivered = false;
    for (const t of tokens.filter((t) => t.user_id === quest.user_id)) {
      if (stale.includes(t.id)) continue;
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: {
            token: t.token,
            notification: { title: "Pause in Play", body },
            data: { path: "/side-quest" },
          },
        }),
      });
      if (res.ok) {
        delivered = true;
        continue;
      }
      console.error(`FCM send failed [${res.status}]: ${await res.text()}`);
      if (res.status === 404 || res.status === 400) stale.push(t.id);
    }
    if (delivered) {
      sent += 1;
      await supabase.from("side_quests").update({ notified_at: now }).eq("id", quest.id);
    }
  }
  if (stale.length) await supabase.from("push_tokens").delete().in("id", stale);
  return { sent };
}
