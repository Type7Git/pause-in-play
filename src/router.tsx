import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Lumenera scrolls inside its phone frame, so new pages start that panel at the top too.
    scrollToTopSelectors: [".es .stage"],
    defaultPreloadStaleTime: 0,
  });

  return router;
};
