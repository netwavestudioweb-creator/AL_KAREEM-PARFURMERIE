import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Al Kareem Parfumerie" },
      {
        name: "description",
        content: "Mentions légales du site Al Kareem Parfumerie, Cotonou (Bénin).",
      },
      { property: "og:title", content: "Mentions légales — Al Kareem" },
      { property: "og:description", content: "Informations légales du site Al Kareem Parfumerie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: SITE_CONFIG.ogImageUrl },
      {
        name: "twitter:image",
        content: SITE_CONFIG.ogImageUrl,
      },
      { property: "og:url", content: getCanonicalUrl("/mentions-legales") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/mentions-legales") }],
  }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <LegalPage
      title="Mentions légales"
      updated="octobre 2026"
      sections={[
        {
          id: "editeur",
          title: "Éditeur du site",
          content: (
            <p>
              Al Kareem Parfumerie — Cotonou, Bénin.
              <br />
              Téléphone et WhatsApp : +229 01 61 88 89 87 · Instagram : @khadisidibehassan
            </p>
          ),
        },
        {
          id: "publication",
          title: "Responsable de la publication",
          content: <p>La direction d'Al Kareem Parfumerie.</p>,
        },
        {
          id: "hebergement",
          title: "Hébergement",
          content: (
            <p>
              Site hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
              Données de la boutique hébergées par Supabase.
            </p>
          ),
        },
        {
          id: "propriete",
          title: "Propriété intellectuelle",
          content: (
            <p>
              L'ensemble des contenus (textes, photos, marques, logos) présents sur ce site sont la
              propriété d'Al Kareem Parfumerie ou de ses partenaires. Toute reproduction sans
              autorisation écrite préalable est interdite.
            </p>
          ),
        },
        {
          id: "signalement",
          title: "Signalement",
          content: (
            <p>
              Pour toute question relative à ces mentions, contactez-nous sur WhatsApp au +229 01 61
              88 89 87.
            </p>
          ),
        },
      ]}
    />
  );
}
