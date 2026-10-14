import { describe, expect, it } from "vitest";
import { NOTES } from "@/content/notes";
import { nextNoteTime, noteOfTheDay, pickNote, upcomingNoteTimes, zonedToUtc } from "./notes";

const TZ = "Australia/Sydney";
const hourIn = (t: number) => Number(new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(new Date(t)));
let seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe("little notes timing", () => {
  it("converts Sydney wall time to UTC across daylight saving", () => {
    expect(new Date(zonedToUtc(2026, 10, 14, 9, 0, TZ)).toISOString()).toBe("2026-10-13T22:00:00.000Z"); // AEDT +11
    expect(new Date(zonedToUtc(2026, 6, 14, 9, 0, TZ)).toISOString()).toBe("2026-06-13T23:00:00.000Z"); // AEST +10
  });
  it("only lands inside her chosen hours", () => {
    const start = Date.UTC(2026, 9, 14, 3, 0);
    for (const t of upcomingNoteTimes(start, { on: true, freq: "twice", from: 9, to: 20 }, TZ, 14, rand)) {
      expect(hourIn(t)).toBeGreaterThanOrEqual(9);
      expect(hourIn(t)).toBeLessThan(20);
    }
  });
  it("sends about the right number", () => {
    const start = Date.UTC(2026, 9, 14, 0, 0);
    expect(upcomingNoteTimes(start, { on: true, freq: "daily", from: 9, to: 20 }, TZ, 14, rand).length).toBeGreaterThanOrEqual(13);
    const twice = upcomingNoteTimes(start, { on: true, freq: "twice", from: 9, to: 20 }, TZ, 14, rand);
    expect(twice.length).toBeGreaterThanOrEqual(26);
    const few = upcomingNoteTimes(start, { on: true, freq: "few", from: 9, to: 20 }, TZ, 14, rand);
    expect(few.length).toBeGreaterThanOrEqual(4);
    expect(few.length).toBeLessThanOrEqual(7);
  });
  it("never schedules in the past or too soon", () => {
    const now = Date.UTC(2026, 9, 14, 8, 55); // 7:55pm Sydney, just inside the window
    expect(nextNoteTime(now, { freq: "daily", from: 9, to: 20 }, TZ, rand)).toBeGreaterThan(now + 20 * 60e3);
  });
});

describe("note picking", () => {
  it("avoids recent notes and is stable per day", () => {
    const avoid = NOTES.slice(0, 40).map((n) => n.id);
    expect(avoid).not.toContain(pickNote(avoid, rand).id);
    expect(noteOfTheDay(new Date(2026, 9, 14)).id).toBe(noteOfTheDay(new Date(2026, 9, 14, 20)).id);
  });
  it("has unique ids", () => {
    expect(new Set(NOTES.map((n) => n.id)).size).toBe(NOTES.length);
  });
});
