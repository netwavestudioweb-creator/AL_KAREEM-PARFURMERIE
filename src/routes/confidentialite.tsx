import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Al Kareem Parfumerie" },
      { name: "description", content: "Comment Al Kareem Parfumerie protège et utilise vos données personnelles." },
      { property: "og:title", content: "Confidentialité — Al Kareem" },
      { property: "og:description", content: "Notre engagement pour la protection de vos données personnelles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/og-alkareem.jpg" },
      { name: "twitter:image", content: "/og-alkareem.jpg" },
      { property: "og:url", content: "/confidentialite" },
    ],
    links: [{ rel: "canonical", href: "/confidentialite" }],
  }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
        <h1 className="font-serif text-4xl text-primary-deep">Politique de confidentialité</h1>
        <p className="text-sm text-muted-foreground">Dernière mise à jour : 2025</p>

        <h2>Données que nous collectons</h2>
        <p>
          Lorsque vous passez commande ou nous contactez, nous collectons uniquement les
          informations nécessaires : nom, téléphone (ou e-mail), zone de livraison,
          adresse et détails de commande.
        </p>

        <h2>Utilisation des données</h2>
        <p>
          Vos données servent exclusivement à traiter votre commande, vous livrer et vous
          recontacter si besoin. Nous ne vendons ni ne louons vos informations à des tiers.
        </p>

        <h2>Conservation</h2>
        <p>
          Les commandes et messages sont conservés le temps nécessaire au suivi commercial
          et légal, puis supprimés sur demande.
        </p>

        <h2>Cookies</h2>
        <p>
          Le site utilise uniquement des données locales de navigation (panier) stockées
          dans votre navigateur. Aucun cookie publicitaire n'est déposé.
        </p>

        <h2>Vos droits</h2>
        <p>
          Vous pouvez à tout moment demander l'accès, la modification ou la suppression de
          vos données en nous contactant sur WhatsApp au +229 01 61 88 89 87.
        </p>
      </article>
    </SiteLayout>
  );
}
