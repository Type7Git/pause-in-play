import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently delete the signed-in user's rows and their account. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const table of ["side_quests", "vit_items", "petal_events", "badges_earned", "reminders", "push_tokens", "user_favourites", "colouring_saves", "wyr_results"] as const) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      if (error) throw new Error("Could not delete your data. Nothing further was removed.");
    }
    const { data: files } = await supabaseAdmin.storage.from("gallery").list(userId);
    if (files?.length) await supabaseAdmin.storage.from("gallery").remove(files.map((f) => `${userId}/${f.name}`));
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("Your data was deleted but the account could not be closed. Please try again.");
    return { ok: true };
  });
