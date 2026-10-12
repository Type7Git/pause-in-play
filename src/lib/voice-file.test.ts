import { describe, expect, it } from "vitest";
import { sanitiseFiled } from "./voice-file";

describe("Tell Sprout sorting", () => {
  it("keeps a quest with doing, next step and 10-minute nudge", () => {
    expect(sanitiseFiled({ type: "quest", doing: "emptying the dishwasher", next_step: "", remind: "10min" }))
      .toMatchObject({ type: "quest", doing: "Emptying the dishwasher", remind: "10min" });
  });
  it("keeps a VIT with thing and location", () => {
    expect(sanitiseFiled({ type: "vit", thing: "passport", location: "in the top drawer in the study" }))
      .toMatchObject({ type: "vit", thing: "Passport", location: "In the top drawer in the study" });
  });
  it("a VIT with no location becomes unsure", () => {
    expect(sanitiseFiled({ type: "vit", thing: "milk", location: "" }).type).toBe("unsure");
  });
  it("garbage becomes unsure with no reminder", () => {
    expect(sanitiseFiled("nonsense")).toMatchObject({ type: "unsure", remind: "none" });
  });
});
