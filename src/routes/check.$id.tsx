import { createFileRoute, notFound } from "@tanstack/react-router";
import type { CheckId } from "@/lumenera/content";
import { CheckPage } from "@/lumenera/Detail";

const IDS: CheckId[] = ["cervical", "breast", "bones"];
export const Route = createFileRoute("/check/$id")({
  beforeLoad: ({ params }) => { if (!IDS.includes(params.id as CheckId)) throw notFound(); },
  component: CheckRoute,
});

function CheckRoute() {
  const { id } = Route.useParams();
  return <CheckPage key={id} id={id as CheckId} />;
}
