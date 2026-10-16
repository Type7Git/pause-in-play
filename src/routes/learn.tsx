import { createFileRoute, redirect } from "@tanstack/react-router";

/** Learn grew into the Lume Library. */
export const Route = createFileRoute("/learn")({
  beforeLoad: () => { throw redirect({ to: "/library", replace: true }); },
});
