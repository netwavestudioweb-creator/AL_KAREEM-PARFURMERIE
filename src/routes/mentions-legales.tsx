import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Al Kareem Parfumerie" },
      { name: "description", content: "Mentions légales du site Al Kareem Parfumerie, Cotonou (Bénin)." },
      { property: "og:title", content: "Mentions légales — Al Kareem" },
      { property: "og:description", content: "Informations légales du site Al Kareem Parfumerie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/og-alkareem.jpg" },
      { name: "twitter:image", content: "/og-alkareem.jpg" },
      { property: "og:url", content: "/mentions-legales" },
    ],
    links: [{ rel: "canonical", href: "/mentions-legales" }],
  }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
        <h1 className="font-serif text-4xl text-primary-deep">Mentions légales</h1>
        <p className="text-sm text-muted-foreground">Dernière mise à jour : 2025</p>

        <h2>Éditeur du site</h2>
        <p>
          Al Kareem Parfumerie — Cotonou, Bénin.<br />
          Contact : +229 01 61 88 89 87 · Instagram : @khadisidibehassan
        </p>

        <h2>Responsable de la publication</h2>
        <p>La direction d'Al Kareem Parfumerie.</p>

        <h2>Hébergement</h2>
        <p>Le site est hébergé sur une infrastructure cloud sécurisée.</p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus (textes, photos, marques, logos) présents sur ce site sont
          la propriété d'Al Kareem Parfumerie ou de ses partenaires. Toute reproduction sans
          autorisation écrite préalable est interdite.
        </p>

        <h2>Signalement</h2>
        <p>
          Pour toute question ou demande relative à ces mentions, contactez-nous via WhatsApp
          au +229 01 61 88 89 87.
        </p>
      </article>
    </SiteLayout>
  );
}
