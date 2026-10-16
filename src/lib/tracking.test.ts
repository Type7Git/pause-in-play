import { describe, expect, it } from "vitest";
import { cycleStats, gpSummary, lastDays, observations, periods, type CycleLog, type MoodEntry } from "./tracking";

const bleed = (flow: "Light" | "Medium" | "Heavy" = "Medium") => ({ flow, hourly: false, symptoms: [] as string[] });

describe("cycle tracker", () => {
  const log: CycleLog = {
    "2026-08-01": bleed("Heavy"), "2026-08-02": bleed(), "2026-08-04": bleed("Light"), // one gap day keeps it one period
    "2026-08-29": bleed(), "2026-08-30": bleed(),
    "2026-09-15": { flow: "Spotting", hourly: false, symptoms: ["Cramps"] },
    "2026-10-06": bleed(), "2026-10-07": { flow: "Heavy", hourly: true, symptoms: ["Cramps", "Poor sleep"] },
  };
  it("finds periods from runs of bleeding days, ignoring spotting", () => {
    expect(periods(log).map((p) => [p.start, p.days])).toEqual([["2026-08-01", 4], ["2026-08-29", 2], ["2026-10-06", 2]]);
  });
  it("works out cycle lengths and a range only once there are two cycles", () => {
    const s = cycleStats(log, new Date("2026-10-17T10:00:00"));
    expect(s.lengths).toEqual([28, 38]);
    expect(s.sinceLast).toBe(11);
    expect(s.range).toEqual([28, 38]);
    expect(cycleStats({ "2026-10-06": bleed() }).range).toBeNull();
  });
  it("writes a GP summary from what she logged", () => {
    const text = gpSummary(log, new Date("2026-10-17T10:00:00"));
    expect(text).toContain("Recent cycle lengths: 28, 38 days");
    expect(text).toContain("Spotting days: 1");
    expect(text).toContain("Days changing protection every hour or less: 1");
    expect(text).toContain("Cramps (2 days)");
  });
});

describe("mood mapper", () => {
  const m = (date: string, quadrant: number, tags: string[]): MoodEntry => ({ id: date + quadrant, at: date, date, quadrant, words: [], tags });
  it("shows the latest check-in per day and leaves empty days empty", () => {
    const days = lastDays([m("2026-10-16", 3, []), m("2026-10-16", 4, [])], 3, new Date("2026-10-17T10:00:00"));
    expect(days.map((d) => d.entry?.quadrant ?? null)).toEqual([null, 4, null]);
    expect(days[1]?.count).toBe(2);
  });
  it("only notices a pattern after three days with the same tag", () => {
    expect(observations([m("2026-10-01", 1, ["Poor sleep"]), m("2026-10-02", 3, ["Poor sleep"])])).toEqual([]);
    expect(observations([m("2026-10-01", 1, ["Poor sleep"]), m("2026-10-02", 3, ["Poor sleep"]), m("2026-10-03", 4, ["Poor sleep"])])[0]).toBe("On 2 of 3 days tagged poor sleep, you also logged a tense or low mood.");
  });
});
