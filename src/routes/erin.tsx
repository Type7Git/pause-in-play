import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old address; the clinician profile was replaced by the clinical advisory panel. */
export const Route = createFileRoute("/erin")({
  beforeLoad: () => {
    throw redirect({ to: "/panel", statusCode: 301 });
  },
});
