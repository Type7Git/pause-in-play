import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import type { SproutReply } from "./sprout-guard";

const input = z.object({
  message: z.string().trim().min(1).max(600),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) })).max(8).default([]),
});

/** Public: anyone can chat with Sprout. Nothing is stored except anonymised unanswered questions. */
export const askSprout = createServerFn({ method: "POST" })
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data }): Promise<SproutReply> => {
    const req = getRequest();
    const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`sprout:${ip}`));
    const bucket = [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { handleSprout } = await import("./sprout.server");
    try {
      return await handleSprout(data.message, data.history.slice(-4), bucket);
    } catch (e) {
      console.error("sprout", e);
      return { kind: "error", text: "Sprout had a little wobble. Please try again in a moment." };
    }
  });
