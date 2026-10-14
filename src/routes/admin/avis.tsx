import { createFileRoute, redirect } from "@tanstack/react-router";

// Les avis sont gérés dans la page Vitrine : l'ancienne adresse y redirige.
export const Route = createFileRoute("/admin/avis")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/vitrine", hash: "avis" });
  },
});
