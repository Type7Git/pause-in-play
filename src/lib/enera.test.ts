import { describe, expect, it } from "vitest";
import { appKnowledge, appMap, searchKnowledge } from "./enera-knowledge";
import { shapeReply, type Sources } from "./enera-reply";

const top = (q: string) => searchKnowledge(appKnowledge(), q, 6).map((c) => c.id);

describe("Enera knows the whole app", () => {
  it.each([
    ["My periods are really heavy", "item-heavy-periods"],
    ["How do I add my medicines?", "tool-meds"],
    ["When should I have a cervical screening test?", "check-cervical"],
    ["What checks should I have at 50?", "life-stages"],
    ["How do I invite a friend to the Lume Lounge?", "tool-invite"],
    ["Exercises for my pelvic floor after birth", "tool-pelvic"],
    ["I can't sleep, I keep waking at 3am", "tool-wind"],
    ["How do I log my mood?", "tool-mood"],
    ["How can I talk to my partner about sex?", "tool-kindly"],
  ])("%s → %s", (q, id) => expect(top(q)).toContain(id));
  it("has a map of every space and tool to link to", () => {
    const map = appMap();
    for (const id of ["space-meno", "space-fertility", "space-baby", "tool-meds", "tool-cycle", "check-cervical"]) expect(map).toContain(id);
  });
});

describe("Enera's replies are checked against her sources", () => {
  const sources: Sources = {
    library: [{ id: "abc", title: "Sleep and night waking", body: "…", linked_tool: "wind-down", keywords: [] }],
    articles: [],
    guide: appKnowledge().filter((c) => c.id === "tool-mood"),
  };
  it("credits the library and links the entry's tool", () => {
    const r = shapeReply(JSON.stringify({ reply: "The Lumenera library says…", source: "library", used: ["L:abc"], link: null, gap: false, next: ["Tell me more", "What else helps?"] }), sources);
    expect(r?.kind).toBe("answer");
    expect(r?.source).toEqual({ title: "Sleep and night waking", reviewed: true });
    expect(r?.link?.to).toBe("/wind-down");
    expect(r?.next).toHaveLength(2);
  });
  it("never credits a source it wasn't given, and drops made-up links", () => {
    const r = shapeReply(`Here you go: {"reply":"That sounds hard. Want to tell me more?","source":"library","used":["L:nope"],"link":"tool-nothing","gap":false,"next":[]}`, sources);
    expect(r?.kind).toBe("chat");
    expect(r?.source).toBeUndefined();
    expect(r?.link).toBeUndefined();
  });
  it("links any real space or tool from the app map", () => {
    const r = shapeReply(JSON.stringify({ reply: "Mood Mapper might help.", source: "guide", used: ["G:tool-mood"], link: "space-mind", gap: false, next: [] }), sources);
    expect(r?.source).toEqual({ title: "Mood Mapper", reviewed: false });
    expect(r?.link).toEqual({ to: "/space/mind", label: "Mood and mind" });
  });
  it("returns nothing usable for broken output", () => expect(shapeReply("sorry", sources)).toBeNull());
});
