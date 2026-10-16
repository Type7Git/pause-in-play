import { createFileRoute } from "@tanstack/react-router";
import { ToolsPage } from "@/lumenera/Menu";

export const Route = createFileRoute("/tools")({
  head: () => ({ meta: [{ title: "Quick tools · Lumenera" }] }),
  component: ToolsPage,
});
