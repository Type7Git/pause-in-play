import { describe, expect, it } from "vitest";
import { isClinical, isCrisis, scrubPII, toTsQuery } from "./sprout-guard";

describe("Sprout safety rules", () => {
  it.each(["I don't want to be here anymore", "everyone would be better off without me", "I want to hurt myself", "I feel suicidal", "I can't go on"])(
    "treats %s as crisis", (m) => expect(isCrisis(m)).toBe(true));
  it("does not flag ordinary messages as crisis", () => expect(isCrisis("I can't sleep")).toBe(false));
  it.each(["Should I try HRT?", "How much magnesium should I take", "Is this bleeding normal?"])(
    "sends %s to the GP message", (m) => expect(isClinical(m)).toBe(true));
  it("keeps everyday questions out of the GP path", () => expect(isClinical("why do i keep losing my keys")).toBe(false));
  it("strips emails and phone numbers before logging", () => {
    const out = scrubPII("My email is jo@example.com, call 0412 345 678");
    expect(out).not.toContain("jo@example.com");
    expect(out).not.toContain("0412");
  });
  it("builds an OR search from meaningful words", () => expect(toTsQuery("why do i keep losing my keys")).toBe("losing | keys"));
});
