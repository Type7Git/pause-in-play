import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/flowella/$")({
  beforeLoad: () => { throw redirect({ to: "/", replace: true }); },
});
