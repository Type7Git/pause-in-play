import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Filed } from "./voice-file";

/** Public: sorts a note into fields. Stores nothing. */
export const fileVoiceNote = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().trim().min(1).max(600) }).parse(d))
  .handler(async ({ data }): Promise<Filed> => {
    const { fileNote } = await import("./voice.server");
    try {
      return await fileNote(data.text);
    } catch (e) {
      console.error("voice-file", e);
      return { type: "error", text: "Sprout had a little wobble. Please try again." };
    }
  });

/** Public: turns a short clip (base64, ≤ ~1.5MB) into text. Audio is discarded after. */
export const transcribeVoice = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ audio: z.string().min(10).max(2_000_000), mime: z.string().regex(/^audio\/[\w.+-]+/) }).parse(d))
  .handler(async ({ data }): Promise<{ text: string } | { error: string }> => {
    const { transcribeClip } = await import("./voice.server");
    try {
      const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
      const ext = data.mime.includes("mp4") ? "mp4" : data.mime.includes("ogg") ? "ogg" : "webm";
      const text = await transcribeClip(new File([bytes], `clip.${ext}`, { type: data.mime.split(";")[0] ?? data.mime }));
      return { text };
    } catch (e) {
      console.error("transcribe", e);
      return { error: "Sprout couldn't hear that clearly. Try again, or type it." };
    }
  });
