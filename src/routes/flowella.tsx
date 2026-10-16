import { createFileRoute, redirect } from "@tanstack/react-router";

/** Earlier demo names (Every Season, Flowella) land on Lumenera. */
export const Route = createFileRoute("/flowella")({
  beforeLoad: () => { throw redirect({ to: "/", replace: true }); },
});
