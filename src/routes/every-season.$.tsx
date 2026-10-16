import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/every-season/$")({
  beforeLoad: () => { throw redirect({ to: "/luma", replace: true }); },
});
