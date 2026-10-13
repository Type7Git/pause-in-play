import { createServerFn } from "@tanstack/react-start";
import rows from "./_seed-library.json";
export const _seedLibrary = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const del = await supabaseAdmin.from("library_entries").delete().not("id", "is", null);
  if (del.error) throw new Error(del.error.message);
  const ins = await supabaseAdmin.from("library_entries").insert(rows as never);
  if (ins.error) throw new Error(ins.error.message);
  return { inserted: rows.length };
});
