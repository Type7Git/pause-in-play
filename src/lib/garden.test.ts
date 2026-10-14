import { describe, expect, it } from "vitest";
import { MIN_GARDENS, badgeShareLine, standingLine, thirstLevel, topPercent, weedsFor } from "./garden";

const day = 864e5;

describe("thirstLevel", () => {
  it("is fresh for new gardens and recent care", () => {
    expect(thirstLevel(null)).toBe(0);
    expect(thirstLevel(Date.now() - day)).toBe(0);
  });
  it("gets a little thirsty, then very thirsty, and stops there", () => {
    expect(thirstLevel(Date.now() - 3 * day)).toBe(1);
    expect(thirstLevel(Date.now() - 6 * day)).toBe(2);
    expect(thirstLevel(Date.now() - 90 * day)).toBe(2);
  });
});

describe("weedsFor", () => {
  it("is stable for a day and gives distinct spots", () => {
    const a = weedsFor("2026-10-14");
    expect(a).toEqual(weedsFor("2026-10-14"));
    expect(new Set(a).size).toBe(2);
  });
});

describe("topPercent", () => {
  const totals = Array.from({ length: 100 }, (_, i) => i); // 0..99
  it("rounds up to a friendly bucket", () => {
    expect(topPercent(totals, 99)).toBe(1);
    expect(topPercent(totals, 92)).toBe(10); // 7 above → rank 8 → 8% → 10
    expect(topPercent(totals, 60)).toBe(40);
  });
  it("never ranks gardens outside the top half", () => {
    expect(topPercent(totals, 10)).toBeNull();
  });
  it("waits for enough gardens before ranking", () => {
    expect(topPercent([1, 2, 3], 3)).toBeNull();
  });
});

describe("standing wording", () => {
  it("is honest when the community is small", () => {
    expect(standingLine({ gardens: 1, top: null, badgeShare: {} })).toMatch(/very first/);
    expect(standingLine({ gardens: 12, top: null, badgeShare: {} })).toMatch(/first 12 gardens/);
    expect(badgeShareLine({ gardens: 12, top: null, badgeShare: { x: 3 } }, "x")).toBeNull();
  });
  it("celebrates the top half and stays kind otherwise", () => {
    expect(standingLine({ gardens: 500, top: 10, badgeShare: {} })).toMatch(/top 10%/);
    expect(standingLine({ gardens: 500, top: null, badgeShare: {} })).toMatch(/alongside 499 other gardens/);
  });
  it("describes badge rarity", () => {
    const s = { gardens: MIN_GARDENS * 4, top: null, badgeShare: { a: 25, b: 0 } };
    expect(badgeShareLine(s, "a")).toBe("25% of Pause in Play gardens have this badge.");
    expect(badgeShareLine(s, "b")).toMatch(/rare/);
  });
});
