import { createFileRoute, notFound } from "@tanstack/react-router";
import { itemById } from "@/flowella/content";
import { ItemPage } from "@/flowella/ItemPage";

export const Route = createFileRoute("/flowella/item/$id")({
  loader: ({ params }) => { const item = itemById(params.id); if (!item) throw notFound(); return item; },
  component: ItemRoute,
});

function ItemRoute() {
  const item = Route.useLoaderData();
  return <ItemPage key={item.id} item={item} />;
}
