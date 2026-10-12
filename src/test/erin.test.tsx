import { createRouter, rootRouteId } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { erin, whyThisHelps } from "@/content/erin";

// Erin's photo and her small avatar are two different files: the portrait is
// only for the profile card, the circular crop is for every small appearance.
describe("Erin content", () => {
  it("uses the portrait for the profile card and the circular crop for small uses", () => {
    expect(erin.photo).toMatch(/erin-photo\.jpg$/);
    expect(erin.avatar).toMatch(/erin-avatar\.png$/);
    expect(erin.photo).not.toBe(erin.avatar);
    expect(erin.photoAlt).toBe("Dr Erin Kelly, Clinical Psychologist");
  });

  it("has a why-this-helps line for every tool screen", () => {
    expect(Object.keys(whyThisHelps).sort()).toEqual(
      ["laugh", "littleWin", "remember", "sideQuest", "tabs"].sort(),
    );
    for (const line of Object.values(whyThisHelps)) expect(line.trim().length).toBeGreaterThan(10);
  });

  it("serves a page at /erin", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/erin").at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
