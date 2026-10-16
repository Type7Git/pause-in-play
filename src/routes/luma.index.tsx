import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Questionnaire } from "@/luma/Questionnaire";
import { useEs } from "@/luma/store";

type Search = { mode?: "changed" | "build" };
export const Route = createFileRoute("/luma/")({
  validateSearch: (s: Record<string, unknown>): Search => (s["mode"] === "changed" || s["mode"] === "build" ? { mode: s["mode"] } : {}),
  component: Welcome,
});

function Welcome() {
  const { mode } = Route.useSearch();
  const { ready, done, epoch } = useEs();
  const navigate = useNavigate();
  // Someone who has already built their space goes straight home.
  useEffect(() => { if (ready && done && !mode) void navigate({ to: "/luma/home", replace: true }); }, [ready, done, mode, navigate]);
  if (!ready || (done && !mode)) return <main className="stage" key="welcome" />;
  return <Questionnaire key={`${mode ?? "start"}-${epoch}`} mode={mode} />;
}
