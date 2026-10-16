import { createFileRoute, notFound } from "@tanstack/react-router";
import { itemById } from "@/every-season/content";
import { ItemPage } from "@/every-season/ItemPage";

export const Route = createFileRoute("/every-season/item/$id")({
  loader: ({ params }) => { const item = itemById(params.id); if (!item) throw notFound(); return item; },
  component: ItemRoute,
});

function ItemRoute() {
  const item = Route.useLoaderData();
  return <ItemPage key={item.id} item={item} />;
}
