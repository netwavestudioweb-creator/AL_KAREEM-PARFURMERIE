import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { OG_IMAGE_META, SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      // Page légale : suivie mais hors index, pour ne pas concurrencer l'accueil sur le nom de la marque.
      { name: "robots", content: "noindex, follow" },
      { title: "Conditions générales de vente — Al Kareem Parfumerie" },
      {
        name: "description",
        content:
          "Conditions générales de vente d'Al Kareem Parfumerie : commande, paiement, livraison, retours.",
      },
      { property: "og:title", content: "CGV — Al Kareem" },
      {
        property: "og:description",
        content: "Conditions générales de vente des parfums Al Kareem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...OG_IMAGE_META,
      {
        name: "twitter:image",
        content: SITE_CONFIG.ogImageUrl,
      },
      { property: "og:url", content: getCanonicalUrl("/cgv") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/cgv") }],
  }),
  component: CGV,
});

function CGV() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      updated="octobre 2026"
      intro={
        <p>
          Les présentes conditions encadrent les ventes de parfums, huiles, brumes et coffrets
          proposés par Al Kareem Parfumerie sur ce site et via WhatsApp.
        </p>
      }
      sections={[
        {
          id: "objet",
          title: "Objet",
          content: (
            <p>
              Les présentes CGV régissent les ventes de parfums et coffrets proposés par Al Kareem
              Parfumerie via son site et son service WhatsApp. Passer commande implique leur
              acceptation.
            </p>
          ),
        },
        {
          id: "commande",
          title: "Commande",
          content: (
            <>
              <p>
                Une demande de commande est créée sur le site puis envoyée sur WhatsApp. La commande
                est validée uniquement après confirmation par Al Kareem sur WhatsApp.
              </p>
              <p>
                Les prix sont affichés en francs CFA (FCFA), toutes taxes locales incluses. Le prix
                retenu est celui affiché au moment de l'envoi de la commande.
              </p>
            </>
          ),
        },
        {
          id: "paiement",
          title: "Paiement",
          content: (
            <p>
              Le paiement s'effectue à la réception, en espèces ou par Mobile Money (MTN MoMo, Moov
              Money). Les modalités précises sont confirmées sur WhatsApp. Aucun paiement n'est
              demandé sur le site.
            </p>
          ),
        },
        {
          id: "livraison",
          title: "Livraison",
          content: (
            <>
              <p>
                Livraison à Cotonou, Abomey-Calavi, Porto-Novo, partout au Bénin et dans la
                sous-région (pays voisins). Les délais et frais sont confirmés sur WhatsApp avant
                validation définitive.
              </p>
              <p>
                À réception, vérifiez l'état du colis avant de l'accepter et contactez-nous
                immédiatement en cas d'anomalie.
              </p>
            </>
          ),
        },
        {
          id: "retours",
          title: "Retours et échanges",
          content: (
            <p>
              Les parfums étant des produits d'hygiène, seuls les articles{" "}
              <strong>non ouverts et en parfait état</strong> peuvent être échangés, dans un délai
              de 7 jours après réception. Contactez-nous sur WhatsApp pour organiser l'échange.
            </p>
          ),
        },
        {
          id: "service-client",
          title: "Service client",
          content: (
            <p>
              Pour toute réclamation, écrivez-nous au +229 01 61 88 89 87. Nous répondons
              généralement sous quelques heures ouvrées.
            </p>
          ),
        },
      ]}
    />
  );
}
