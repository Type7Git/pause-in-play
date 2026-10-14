import { createRouter, rootRouteId } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { panel, whyThisHelps } from "@/content/panel";

describe("Clinical advisory panel", () => {
  it("lists four panel members including the psychosexual therapist", () => {
    expect(panel).toHaveLength(4);
    const st = panel.find((m) => m.initials === "ST");
    expect(st?.role).toBe("Psychosexual therapist or sexologist");
    expect(st?.tile).toBe("bg-rose-soft");
  });

  it("has a why-this-helps line for every tool screen", () => {
    expect(Object.keys(whyThisHelps).sort()).toEqual(["laugh", "littleWin", "remember", "sideQuest", "tabs"].sort());
  });

  it("serves /panel", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/panel").at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
