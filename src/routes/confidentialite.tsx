import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { resetConsent } from "@/lib/consent";
import { OG_IMAGE_META, SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Al Kareem Parfumerie" },
      {
        name: "description",
        content: "Comment Al Kareem Parfumerie protège et utilise vos données personnelles.",
      },
      { property: "og:title", content: "Confidentialité — Al Kareem" },
      {
        property: "og:description",
        content: "Notre engagement pour la protection de vos données personnelles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...OG_IMAGE_META,
      {
        name: "twitter:image",
        content: SITE_CONFIG.ogImageUrl,
      },
      { property: "og:url", content: getCanonicalUrl("/confidentialite") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/confidentialite") }],
  }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="octobre 2026"
      intro={
        <p>
          Nous collectons le strict nécessaire pour traiter vos commandes, et rien n'est vendu à des
          tiers.
        </p>
      }
      sections={[
        {
          id: "donnees",
          title: "Données collectées",
          content: (
            <p>
              Lorsque vous passez commande ou nous contactez, nous collectons uniquement : nom,
              téléphone (ou e-mail), zone de livraison, adresse ou point de repère et détail de la
              commande.
            </p>
          ),
        },
        {
          id: "utilisation",
          title: "Utilisation",
          content: (
            <p>
              Vos données servent exclusivement à traiter votre commande, vous livrer et vous
              recontacter si besoin. Nous ne vendons ni ne louons vos informations.
            </p>
          ),
        },
        {
          id: "conservation",
          title: "Conservation",
          content: (
            <p>
              Commandes et messages sont conservés le temps nécessaire au suivi commercial et légal,
              puis supprimés sur demande. Les coordonnées préremplies dans votre navigateur sont
              conservées au maximum 30 jours pour vous éviter de les ressaisir.
            </p>
          ),
        },
        {
          id: "cookies",
          title: "Cookies et mesure d'audience",
          content: (
            <>
              <p>
                Votre panier et vos coordonnées de commande sont stockés uniquement dans votre
                navigateur. Aucun cookie publicitaire n'est déposé.
              </p>
              <p>
                Avec votre accord seulement, nous mesurons l'audience du site avec Google Analytics
                (adresse IP anonymisée) et Microsoft Clarity, afin de l'améliorer. Votre choix est
                conservé 13 mois.
              </p>
              <p>
                <button
                  type="button"
                  onClick={resetConsent}
                  className="font-semibold text-primary-deep underline underline-offset-4"
                >
                  Modifier mes choix de cookies
                </button>
              </p>
            </>
          ),
        },
        {
          id: "droits",
          title: "Vos droits",
          content: (
            <p>
              Vous pouvez à tout moment demander l'accès, la modification ou la suppression de vos
              données en nous écrivant sur WhatsApp au +229 01 61 88 89 87.
            </p>
          ),
        },
      ]}
    />
  );
}
