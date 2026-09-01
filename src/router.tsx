import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Données fraîches 30s et refetch au focus de fenêtre pour voir immédiatement les modifications faites dans l'admin
        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Précharge la route au survol/focus d'un <Link> (desktop) et au
    // touchstart (mobile), avec un léger délai.
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    // TanStack Query gère la fraîcheur des données ; on désactive le
    // cache SWR du router pour éviter les doubles caches.
    defaultPreloadStaleTime: 0,
  });

  return router;
};
