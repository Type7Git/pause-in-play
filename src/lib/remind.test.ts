import { describe, expect, it } from "vitest";
import { remindAtFor } from "./rewards";

const now = new Date("2026-10-12T09:00:00");

describe("nudge times", () => {
  it("No reminder stores nothing", () => expect(remindAtFor("No reminder", now)).toBeNull());
  it("In 10 min", () => expect(new Date(remindAtFor("In 10 min", now)!).getTime() - now.getTime()).toBe(600_000));
  it("In 30 min", () => expect(new Date(remindAtFor("In 30 min", now)!).getTime() - now.getTime()).toBe(1_800_000));
  it("Tonight is 8pm", () => expect(new Date(remindAtFor("Tonight", now)!).getHours()).toBe(20));
});
