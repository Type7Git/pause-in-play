import { describe, expect, it } from "vitest";
import { filterSessions, repPhases, weekStats, type LogEntry } from "./body";

const now = new Date(2026, 9, 14, 12); // Wed 14 Oct 2026
const at = (d: number) => new Date(2026, 9, d, 10).toISOString();

describe("resilient body rules", () => {
  it("energy chips show sessions at or below that level", () => {
    const list = [{ energy: "gentle", type: "Stretch" }, { energy: "steady", type: "Yoga" }, { energy: "energetic", type: "Strength" }] as const;
    expect(filterSessions([...list], "steady", "All")).toHaveLength(2);
    expect(filterSessions([...list], "gentle", "All")).toHaveLength(1);
  });
  it("strength days count Strength or Pilates, one per day, this week only", () => {
    const log: LogEntry[] = [
      { session_key: "a", type: "Strength", minutes: 11, completed_at: at(12), via: "player" },
      { session_key: "b", type: "Pilates", minutes: 7, completed_at: at(12), via: "tick" },
      { session_key: "c", type: "Pilates", minutes: 7, completed_at: at(13), via: "tick" },
      { session_key: "d", type: "Yoga", minutes: 9, completed_at: at(14), via: "tick" },
      { session_key: "e", type: "Strength", minutes: 8, completed_at: at(11), via: "tick" }, // last Sunday
    ];
    const s = weekStats(log, now);
    expect(s.strengthDays).toBe(2);
    expect(s.sessions).toBe(4);
    expect(s.minutes).toBe(34);
  });
  it("a pelvic rep is hold, let go 4s, 3 quick squeezes, rest 3s", () => {
    const p = repPhases(5);
    expect(p.reduce((n, x) => n + x.seconds, 0)).toBe(5 + 4 + 6 + 3);
    expect(p.filter((x) => x.label === "Quick squeeze")).toHaveLength(3);
  });
});
