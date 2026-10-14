import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { topPercent, type Standing } from "./garden";

/** Public: how a garden with this many petals compares, plus how common each badge is. Aggregates only. */
export const gardenStanding = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ petals: z.number().int().min(0).max(10_000_000) }).parse(d))
  .handler(async ({ data }): Promise<Standing> => {
    try {
      const { gardenDistribution } = await import("./garden.server");
      const d = await gardenDistribution();
      return { gardens: d.totals.length, top: topPercent(d.totals, data.petals), badgeShare: d.badges };
    } catch (e) {
      console.error("garden standing", e);
      return { gardens: 0, top: null, badgeShare: {} };
    }
  });
