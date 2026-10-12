import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

/** Store (or refresh) this device's push registration token for the signed-in user. */
export const savePushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ token: z.string().min(10).max(4096) }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("push_tokens")
      .upsert(
        { user_id: context.userId, token: data.token, last_seen_at: new Date().toISOString() },
        { onConflict: "user_id,token" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Send due Side Quest nudges to the signed-in user's devices and mark them sent.
 * Called from the app when a signed-in user loads it; only quests whose
 * remind_at has passed and that have not been notified yet are sent.
 */
export const sendDueReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const now = new Date().toISOString();

    const { data: due, error: qErr } = await supabase
      .from("side_quests")
      .select("id, doing, next_step")
      .is("done_at", null)
      .is("notified_at", null)
      .not("remind_at", "is", null)
      .lte("remind_at", now)
      .limit(5);
    if (qErr) throw new Error(qErr.message);
    if (!due?.length) return { sent: 0 };

    const { data: tokens, error: tErr } = await supabase
      .from("push_tokens")
      .select("id, token")
      .eq("user_id", userId);
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
    const staleTokenIds: string[] = [];
    for (const quest of due) {
      const body = `Your parked mission is waiting: ${quest.doing}. Next step: ${quest.next_step ?? "Pick up where I left off"}.`;
      let delivered = false;
      for (const t of tokens) {
        if (staleTokenIds.includes(t.id)) continue;
        const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: {
              token: t.token,
              notification: { title: "Pause and Play", body },
              data: { path: "/side-quest" },
            },
          }),
        });
        if (res.ok) {
          delivered = true;
          continue;
        }
        const text = await res.text();
        console.error(`FCM send failed [${res.status}]: ${text}`);
        if (res.status === 404 || res.status === 400) staleTokenIds.push(t.id);
      }
      if (delivered) {
        sent += 1;
        await supabase.from("side_quests").update({ notified_at: now }).eq("id", quest.id);
      }
    }

    if (staleTokenIds.length) {
      await supabase.from("push_tokens").delete().in("id", staleTokenIds);
    }
    return { sent };
  });
