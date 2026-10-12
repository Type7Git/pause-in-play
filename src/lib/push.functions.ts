import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


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

/** Send the signed-in user's due nudges now (app open); the scheduled job covers closed apps. */
export const sendDueReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { deliverDueNudges } = await import("./push.server");
    return deliverDueNudges(context.supabase, context.userId);
  });
