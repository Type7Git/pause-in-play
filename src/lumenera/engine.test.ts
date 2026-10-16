import { describe, expect, it } from "vitest";
import { PERSONAS, blankProfile } from "./content";
import { checksFor, personal, placeOf, plan } from "./engine";

const Y = new Date().getFullYear();

describe("Lumenera tailoring", () => {
  it("builds different homes for different lives", () => {
    expect(plan(PERSONAS["maddie"]!.profile).spaces.map((s) => s.id)).toEqual(["periods", "contra"]);
    expect(plan(PERSONAS["sam"]!.profile).spaces[0]!.id).toBe("fertility");
    expect(plan(PERSONAS["lyn"]!.profile).spaces.map((s) => s.id)).toEqual(["meno"]);
  });
  it("never shows menopause to a 24-year-old or pregnancy to a 62-year-old unless asked", () => {
    expect(plan(PERSONAS["maddie"]!.profile).spaces.some((s) => s.id === "meno")).toBe(false);
    expect(plan(PERSONAS["lyn"]!.profile).spaces.some((s) => s.id === "fertility")).toBe(false);
  });
  it("explains every pick", () => {
    for (const k of Object.keys(PERSONAS)) for (const pk of plan(PERSONAS[k]!.profile).picks) expect(pk.reasons.length).toBeGreaterThan(0);
  });
  it("puts support first when mood is low", () => {
    expect(plan(PERSONAS["maddie"]!.profile).picks[0]!.id).toBe("talk-to-someone");
  });
});

describe("checks traffic lights", () => {
  const p = (year: number, cervical?: string, mammo?: string) => ({ ...blankProfile(), year: Y - year, ...(cervical ? { cervical } : {}), ...(mammo ? { mammo } : {}) });
  it("cervical: green, orange, red", () => {
    expect(checksFor(p(30, "recent"))[0]!.tone).toBe("ok");
    expect(checksFor(p(30, "mid"))[0]!.tone).toBe("soon");
    expect(checksFor(p(30, "old"))[0]!.tone).toBe("overdue");
    expect(checksFor(p(22))[0]!.status).toBe("From age 25");
  });
  it("breast screen from 50, optional from 40", () => {
    expect(checksFor(p(55, "recent", "old")).find((c) => c.id === "breast")!.tone).toBe("overdue");
    expect(checksFor(p(44, "recent")).find((c) => c.id === "breast")!.tone).toBe("info");
  });
});

describe("places and progress", () => {
  it("reads postcodes", () => {
    expect(placeOf("7000")).toMatchObject({ tas: true, city: "Hobart" });
    expect(placeOf("7250")).toMatchObject({ city: "Launceston" });
    expect(placeOf("3000")?.state).toBe("Victoria");
    expect(placeOf("12")).toBeNull();
  });
  it("fills the personal meter", () => {
    expect(personal(blankProfile())).toBeLessThan(25);
    expect(personal(PERSONAS["lyn"]!.profile)).toBeGreaterThan(90);
  });
});
