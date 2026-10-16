import { describe, expect, it } from "vitest";
import { MEDICINES, searchMedicines } from "@/content/medicines";
import { describe as describeSchedule, dosesOn, replaceBy, type CabinetEntry } from "./cabinet";

const entry = (schedule: CabinetEntry["schedule"], start = "2026-10-05"): CabinetEntry => ({ id: "a", name: "Test", form: "tablet", amount: "", schedule, start, remind: false, discreet: true });
const day = (s: string) => new Date(`${s}T10:00:00`);

describe("medicine schedules", () => {
  it("daily and chosen weekdays", () => {
    expect(dosesOn(entry({ pattern: "daily", times: ["08:00", "20:00"] }), day("2026-10-17"))).toEqual(["08:00", "20:00"]);
    const twiceWeekly = entry({ pattern: "weekdays", days: ["Mon", "Thu"], times: ["21:00"] });
    expect(dosesOn(twiceWeekly, day("2026-10-19"))).toEqual(["21:00"]); // Monday
    expect(dosesOn(twiceWeekly, day("2026-10-20"))).toEqual([]);
  });
  it("start-up then ongoing, as for vaginal estradiol", () => {
    const e = entry({ pattern: "startup", startupDays: 14, days: ["Mon", "Thu"], times: ["21:00"] }, "2026-10-01");
    expect(dosesOn(e, day("2026-10-10"))).toEqual(["21:00"]); // day 9 of start-up (a Saturday)
    expect(dosesOn(e, day("2026-10-17"))).toEqual([]); // after start-up, a Saturday
    expect(dosesOn(e, day("2026-10-19"))).toEqual(["21:00"]); // Monday
  });
  it("days on and off, every few days, courses and devices", () => {
    const ring = entry({ pattern: "cycle", on: 21, off: 7, times: ["08:00"] }, "2026-10-01");
    expect(dosesOn(ring, day("2026-10-21"))).toEqual(["08:00"]); // day 20
    expect(dosesOn(ring, day("2026-10-25"))).toEqual([]); // day 24, a week off
    expect(dosesOn(entry({ pattern: "everyN", every: 3, times: ["09:00"] }, "2026-10-01"), day("2026-10-04"))).toEqual(["09:00"]);
    expect(dosesOn(entry({ pattern: "course", courseDays: 5, times: ["08:00"] }, "2026-10-01"), day("2026-10-06"))).toEqual([]);
    expect(dosesOn(entry({ pattern: "asNeeded" }), day("2026-10-17"))).toEqual([]);
    expect(replaceBy(entry({ pattern: "device", replaceMonths: 36 }, "2026-10-01"))?.getFullYear()).toBe(2029);
    expect(dosesOn(entry({ pattern: "daily" }, "2026-11-01"), day("2026-10-17"))).toEqual([]); // not started yet
  });
  it("describes schedules plainly", () => {
    expect(describeSchedule({ pattern: "weekdays", days: ["Mon", "Thu"], times: ["21:00"] })).toBe("Mon and Thu · 21:00");
    expect(describeSchedule({ pattern: "device", replaceMonths: 36 })).toBe("Replace every 3 years");
  });
});

describe("finding a medicine", () => {
  it("finds by brand or generic name, best match first", () => {
    expect(searchMedicines(MEDICINES, "estrogel")[0]?.name).toBe("Estradiol gel");
    expect(searchMedicines(MEDICINES, "thyrox")[0]?.name).toBe("Levothyroxine");
    expect(searchMedicines(MEDICINES, "mirena")[0]?.name).toBe("Hormonal IUD (52 mg)");
    expect(searchMedicines(MEDICINES, "zzzz")).toHaveLength(0);
  });
  it("narrows by what it's for and its form when she isn't sure", () => {
    const r = searchMedicines(MEDICINES, "", { tags: ["menopause"], form: "patch" });
    expect(r.map((m) => m.name)).toContain("Estradiol patch");
    expect(r.every((m) => m.form === "patch")).toBe(true);
  });
  it("has a thorough, unique starter list", () => {
    expect(MEDICINES.length).toBeGreaterThan(140);
    expect(new Set(MEDICINES.map((m) => m.id)).size).toBe(MEDICINES.length);
  });
});
