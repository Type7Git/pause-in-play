import { createFileRoute, notFound } from "@tanstack/react-router";
import { HUB_IDS, type HubId } from "@/every-season/content";
import { SpacePage } from "@/every-season/Detail";

export const Route = createFileRoute("/every-season/space/$id")({
  beforeLoad: ({ params }) => { if (!HUB_IDS.includes(params.id as HubId)) throw notFound(); },
  component: SpaceRoute,
});

function SpaceRoute() {
  const { id } = Route.useParams();
  return <SpacePage key={id} id={id as HubId} />;
}
