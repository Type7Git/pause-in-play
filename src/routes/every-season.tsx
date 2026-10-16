import { createFileRoute, redirect } from "@tanstack/react-router";

/** The demo's working name was Every Season; old links land on Luma. */
export const Route = createFileRoute("/every-season")({
  beforeLoad: () => { throw redirect({ to: "/luma", replace: true }); },
});
