import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/lumenera/Menu";

export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [{ title: "Guide · Lumenera" }] }),
  component: GuidePage,
});
