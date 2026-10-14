import { describe, expect, it } from "vitest";
import { buildKindly } from "@/routes/intimacy.say-it-kindly";
import { CHECKIN_STATEMENTS, GP_KEYS } from "@/content/intimacy";

describe("intimacy", () => {
  it("builds the Say it kindly sentence in the agreed order", () => {
    expect(buildKindly(["I'm exhausted by bedtime", "how much I love you", "taking things slower", "try that this week?"]))
      .toBe("I've noticed I'm exhausted by bedtime. It's not about how much I love you, it's this stage of life. What would help me is taking things slower. Could we try that this week?");
  });
  it("GP card triggers on dryness, pain and bladder statements only", () => {
    expect(GP_KEYS).toEqual(["dry", "pain", "blad"]);
    for (const k of GP_KEYS) expect(CHECKIN_STATEMENTS.some((s) => s.key === k)).toBe(true);
  });
});
