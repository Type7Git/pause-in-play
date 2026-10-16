import { createFileRoute, redirect } from "@tanstack/react-router";

/** Enera is now Enera; old links and notifications still land in the right place. */
export const Route = createFileRoute("/tell-sprout")({
  beforeLoad: () => { throw redirect({ to: "/tell-enera", replace: true }); },
});
