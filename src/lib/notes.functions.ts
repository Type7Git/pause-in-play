import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { nextNoteTime } from "./notes";

const LABEL = "little_notes";
const input = z.object({
  on: z.boolean(),
  freq: z.enum(["few", "daily", "twice"]),
  from: z.number().int().min(0).max(23),
  to: z.number().int().min(1).max(24),
  tz: z.string().min(3).max(64).refine((tz) => { try { new Intl.DateTimeFormat("en", { timeZone: tz }); return true; } catch { return false; } }),
});

/** Turn browser push notes on or off for the signed-in user. The 5-minute job sends them (see push.server). */
export const saveLittleNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const schedule = JSON.stringify({ freq: data.freq, from: data.from, to: data.to, tz: data.tz, next: data.on ? nextNoteTime(Date.now(), data, data.tz) : null, recent: [] });
    const { data: existing } = await supabaseAdmin.from("reminders").select("id").eq("user_id", context.userId).eq("label", LABEL).maybeSingle();
    const { error } = existing
      ? await supabaseAdmin.from("reminders").update({ enabled: data.on, schedule }).eq("id", existing.id)
      : await supabaseAdmin.from("reminders").insert({ user_id: context.userId, label: LABEL, enabled: data.on, schedule });
    if (error) throw new Error("Couldn't save your note settings.");
    return { ok: true };
  });
