import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/lumenera/Menu";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile and account · Lumenera" }] }),
  component: ProfilePage,
});
