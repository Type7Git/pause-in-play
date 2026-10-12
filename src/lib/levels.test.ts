import { describe, expect, it } from "vitest";
import { getLevel } from "./levels";

describe("garden levels", () => {
  it("starts as Seedling", () => expect(getLevel(0).name).toBe("Seedling"));
  it("Sprout at 20", () => expect(getLevel(20).name).toBe("Sprout"));
  it("Bud at 50", () => expect(getLevel(50).name).toBe("Bud"));
  it("In bloom at 100", () => expect(getLevel(100).name).toBe("In bloom"));
  it("Wildflower meadow at 200 is top", () => {
    expect(getLevel(200).name).toBe("Wildflower meadow");
    expect(getLevel(200).next).toBeNull();
  });
  it("counts petals to next level", () => expect(getLevel(18).next?.remaining).toBe(2));
});
