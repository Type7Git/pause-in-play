import { describe, expect, it } from "vitest";
import { pickRound, scoreRound } from "./wyr";

describe("would you rather scoring", () => {
  it("picks the character chosen most and the runner-up", () => {
    const r = scoreRound(["q", "h", "q", "e", "q", "h"]);
    expect(r.winner).toBe("q");
    expect(r.runnerUp).toBe("h");
  });
  it("breaks ties randomly between the tied characters", () => {
    const winners = new Set([0.1, 0.9].map((x) => { let i = 0; return scoreRound(["a", "b"], () => (i++ === 0 ? x : 0.5)).winner; }));
    expect(winners).toEqual(new Set(["a", "b"]));
  });
  it("a round has at most 10 questions", () => {
    expect(pickRound(Array.from({ length: 30 }, (_, i) => i))).toHaveLength(10);
  });
});
