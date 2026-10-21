import { describe, expect, it } from "vitest";
import { joinResults } from "./speech";

describe("joining speech results", () => {
  it("keeps separate phrases from desktop browsers", () => {
    expect(joinResults(["I can't sleep", "and my head is busy"])).toBe("I can't sleep and my head is busy");
  });
  it("doesn't double or triple words when Android sends the phrase so far each time", () => {
    expect(joinResults(["I've been", "I've been feeling", "I've been feeling really overwhelmed"])).toBe("I've been feeling really overwhelmed");
    expect(joinResults(["hello", "hello", "hello my name is Al"])).toBe("hello my name is Al");
  });
  it("drops a repeat of the last phrase, even with different capitals or punctuation", () => {
    expect(joinResults(["My periods are heavy.", "my periods are heavy"])).toBe("My periods are heavy.");
  });
  it("handles a result that repeats everything said so far, then adds more", () => {
    expect(joinResults(["where are my keys", "I left them", "where are my keys I left them on the bench"])).toBe("where are my keys I left them on the bench");
  });
  it("ignores empty results", () => expect(joinResults(["", "  ", "hi"])).toBe("hi"));
});
