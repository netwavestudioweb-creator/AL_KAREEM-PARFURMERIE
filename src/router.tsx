import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Les catalogues changent rarement : on garde les données fraîches
        // pendant 5 min et en cache 30 min pour éviter les rechargements
        // à chaque navigation.
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
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
