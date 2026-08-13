import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title: "Conditions générales de vente — Al Kareem Parfumerie" },
      { name: "description", content: "Conditions générales de vente d'Al Kareem Parfumerie : commande, paiement, livraison, retours." },
      { property: "og:title", content: "CGV — Al Kareem" },
      { property: "og:description", content: "Conditions générales de vente des parfums Al Kareem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/og-alkareem.jpg" },
      { name: "twitter:image", content: "/og-alkareem.jpg" },
      { property: "og:url", content: "/cgv" },
    ],
    links: [{ rel: "canonical", href: "/cgv" }],
  }),
  component: CGV,
});

function CGV() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
        <h1 className="font-serif text-4xl text-primary-deep">Conditions générales de vente</h1>
        <p className="text-sm text-muted-foreground">Dernière mise à jour : 2025</p>

        <h2>1. Objet</h2>
        <p>
          Les présentes CGV régissent les ventes de parfums et coffrets proposés par
          Al Kareem Parfumerie via son site et son service WhatsApp.
        </p>

        <h2>2. Commande</h2>
        <p>
          La commande est validée après confirmation par WhatsApp. Les prix sont affichés
          en francs CFA (FCFA), toutes taxes locales incluses.
        </p>

        <h2>3. Paiement</h2>
        <p>
          Le paiement est accepté par Mobile Money (MTN MoMo, Moov Money) ou en espèces
          à la livraison. Les modalités précises sont confirmées par WhatsApp.
        </p>

        <h2>4. Livraison</h2>
        <p>
          Livraison à Cotonou, Abomey-Calavi, Porto-Novo et sur demande partout au Bénin.
          Les délais et frais sont communiqués lors de la confirmation.
        </p>

        <h2>5. Retours et remboursements</h2>
        <p>
          Les parfums étant des produits d'hygiène, seuls les articles non ouverts et
          en parfait état peuvent être échangés dans un délai de 7 jours après réception.
          Contactez-nous sur WhatsApp pour organiser le retour.
        </p>

        <h2>6. Service client</h2>
        <p>
          Pour toute réclamation, écrivez-nous au +229 01 61 88 89 87. Nous répondons
          généralement sous quelques heures ouvrées.
        </p>
      </article>
    </SiteLayout>
  );
}
