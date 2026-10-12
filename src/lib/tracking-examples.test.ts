import { describe, expect, it } from "vitest";
import { isDue, observations, PERSONAL_TRACKING_ENABLED, TRACKING_REWARDS } from "./tracking-examples";

describe("Tracking safeguards", () => {
  it("keeps personal health saving disabled pending Australian hosting", () => expect(PERSONAL_TRACKING_ENABLED).toBe(false));
  it("assigns two petals to mood entries regardless of quadrant", () => expect(TRACKING_REWARDS.mood).toBe(2));
  it("assigns no petals to medicine actions", () => expect(TRACKING_REWARDS.medicine).toBe(0));
  it("assigns three petals for quiz completion rather than score", () => expect(TRACKING_REWARDS.quiz).toBe(3));
  it("does not show observations with fewer than three example days", () => expect(observations([{date:"2026-10-10", quadrant:1,tags:["Walk"]},{date:"2026-10-11", quadrant:2,tags:["Walk"]}])).toEqual([]));
  it("does not count multiple entries on one day as three examples", () => expect(observations([1,2,3].map(quadrant => ({date:"2026-10-10",quadrant,tags:["Walk"]})))).toEqual([]));
});
describe("Medicine schedule patterns", () => {
  it("includes daily dates after start, not before", () => { expect(isDue({kind:"daily"},"2026-10-12","2026-10-12")).toBe(true); expect(isDue({kind:"daily"},"2026-10-12","2026-10-11")).toBe(false); });
  it("includes only chosen weekdays", () => { expect(isDue({kind:"weekdays",days:[1,4]},"2026-10-01","2026-10-12")).toBe(true); expect(isDue({kind:"weekdays",days:[1,4]},"2026-10-01","2026-10-13")).toBe(false); });
  it("includes every N days", () => { expect(isDue({kind:"every",interval:3},"2026-10-12","2026-10-15")).toBe(true); expect(isDue({kind:"every",interval:3},"2026-10-12","2026-10-14")).toBe(false); });
  it("wraps on/off cycles at day 28", () => { const p = {kind:"cycle",on:12,length:28} as const; expect(isDue(p,"2026-10-01","2026-10-12")).toBe(true); expect(isDue(p,"2026-10-01","2026-10-13")).toBe(false); expect(isDue(p,"2026-10-01","2026-10-29")).toBe(true); });
  it("switches from 14 start-up days to selected weekdays", () => { const p = {kind:"startup",dailyDays:14,days:[1,4]} as const; expect(isDue({...p,days:[...p.days]},"2026-10-01","2026-10-14")).toBe(true); expect(isDue({...p,days:[...p.days]},"2026-10-01","2026-10-16")).toBe(false); expect(isDue({...p,days:[...p.days]},"2026-10-01","2026-10-19")).toBe(true); });
  it("includes device due date, one month and one week before", () => { const p = {kind:"device",due:"2029-03-12"} as const; for (const d of ["2029-03-12","2029-03-05","2029-02-12"]) expect(isDue(p,"2026-10-12",d)).toBe(true); expect(isDue(p,"2026-10-12","2029-03-04")).toBe(false); });
  it("does not send reminders for only-when-needed entries", () => expect(isDue({kind:"prn"},"2026-10-12","2026-10-12")).toBe(false));
});