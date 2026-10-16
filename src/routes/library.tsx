import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/lumenera/Menu";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Lume Library · Lumenera" }] }),
  component: LibraryPage,
});
