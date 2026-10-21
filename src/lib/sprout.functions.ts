import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SproutReply } from "./sprout-guard";

const input = z.object({
  message: z.string().trim().min(1).max(600),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) })).max(8).default([]),
});

/** Signed-in only, because every answer calls a paid AI model. Nothing is stored except anonymised unanswered questions. */
export const askSprout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }): Promise<SproutReply> => {
    // The hourly limit is per account; the bucket is a one-way hash so usage rows never name anyone.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`sprout:user:${context.userId}`));
    const bucket = [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { handleSprout } = await import("./sprout.server");
    try {
      return await handleSprout(data.message, data.history.slice(-4), bucket);
    } catch (e) {
      console.error("sprout", e);
      return { kind: "error", text: "Enera had a little wobble. Please try again in a moment." };
    }
  });
