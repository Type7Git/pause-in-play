import { describe, expect, it } from "vitest";
import { isClinical, isCrisis, isUrgent, scrubPII, toTsQuery } from "./sprout-guard";

describe("Enera safety rules", () => {
  it.each(["I don't want to be here anymore", "everyone would be better off without me", "I want to hurt myself", "I feel suicidal", "I can't go on"])(
    "treats %s as crisis", (m) => expect(isCrisis(m)).toBe(true));
  it("does not flag ordinary messages as crisis", () => expect(isCrisis("I can't sleep")).toBe(false));
  it.each(["Should I try HRT?", "How much magnesium should I take", "Is this bleeding normal?", "I missed my pill last night", "Do I have endometriosis?", "Am I in perimenopause?", "What do my blood test results mean?", "I found a lump", "Can I take ibuprofen with my HRT?"])(
    "sends %s to the GP message", (m) => expect(isClinical(m)).toBe(true));
  it.each(["why do i keep losing my keys", "How often should I have a cervical screening test?", "What is HRT?", "How do I add my medicines?", "My periods are really heavy", "What helps with hot flushes?", "Is it normal to feel flat after having a baby?", "Can I use the cycle tracker on the pill?"])(
    "lets %s reach Enera's library", (m) => expect(isClinical(m)).toBe(false));
  it.each(["I have chest pain", "I'm soaking a pad every hour", "My baby has stopped moving", "I think I fainted"])(
    "sends %s to urgent care", (m) => expect(isUrgent(m)).toBe(true));
  it("doesn't treat everyday worries as urgent", () => expect(isUrgent("I'm worried about my periods")).toBe(false));
  it("strips emails and phone numbers before logging", () => {
    const out = scrubPII("My email is jo@example.com, call 0412 345 678");
    expect(out).not.toContain("jo@example.com");
    expect(out).not.toContain("0412");
  });
  it("builds an OR search from meaningful words", () => expect(toTsQuery("why do i keep losing my keys")).toBe("losing | keys"));
});
