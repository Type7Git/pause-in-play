import { createFileRoute, redirect } from "@tanstack/react-router";

// The team workspace preview was replaced by the real, protected admin.
export const Route = createFileRoute("/team-preview")({ beforeLoad: () => { throw redirect({ to: "/admin" }); } });
