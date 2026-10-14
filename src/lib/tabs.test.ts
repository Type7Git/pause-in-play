import { describe, expect, it } from "vitest";
import { addTab, closeTab, emptyBasket, restoreAll, restoreTab, syncVit, type TabState } from "./tabs";

const empty: TabState = { open: [], basket: [], clearedVit: [] };

describe("37 tabs", () => {
  it("adds tabs, ignoring blanks and repeats", () => {
    let s = addTab(empty, "  Book the dentist ");
    s = addTab(s, "book the dentist");
    s = addTab(s, "   ");
    expect(s.open.map((t) => t.text)).toEqual(["Book the dentist"]);
  });
  it("closing moves to the basket, never deletes, and restores", () => {
    let s = addTab(addTab(empty, "A"), "B");
    s = closeTab(s, s.open[0]!.id);
    expect(s.open.map((t) => t.text)).toEqual(["B"]);
    expect(s.basket.map((t) => t.text)).toEqual(["A"]);
    s = restoreTab(s, s.basket[0]!.id);
    expect(s.open.map((t) => t.text)).toEqual(["B", "A"]);
    s = restoreAll(closeTab(closeTab(s, s.open[0]!.id), s.open[1]!.id));
    expect(s.open).toHaveLength(2);
    expect(s.basket).toHaveLength(0);
  });
  it("brings in Help me remember items once, and follows removals", () => {
    const vit = [{ id: "v1", thing: "Passport", location: "Top drawer" }, { id: "ex", thing: "Example", location: "x", example: true }];
    let s = syncVit(empty, vit);
    expect(s.open).toHaveLength(1);
    expect(s.open[0]).toMatchObject({ text: "Passport", note: "Top drawer", vitId: "v1" });
    s = syncVit(s, vit);
    expect(s.open).toHaveLength(1);
    s = syncVit(s, []);
    expect(s.open).toHaveLength(0);
  });
  it("emptying the basket stops remembered items coming back", () => {
    const vit = [{ id: "v1", thing: "Passport", location: "Top drawer" }];
    let s = syncVit(empty, vit);
    s = emptyBasket(closeTab(s, s.open[0]!.id));
    expect(syncVit(s, vit).open).toHaveLength(0);
  });
});
