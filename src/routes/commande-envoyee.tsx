import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { whatsappLink, WHATSAPP_NUMBER } from "@/lib/products";

export const Route = createFileRoute("/commande-envoyee")({
  head: () => ({
    meta: [
      { title: "Commande envoyée — Al Kareem Parfumerie" },
      {
        name: "description",
        content:
          "Votre commande a bien été envoyée sur WhatsApp. Nous vous contactons sur WhatsApp pour la confirmation.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Commande envoyée — Al Kareem" },
      {
        property: "og:description",
        content: "Merci pour votre commande — nous vous contactons sur WhatsApp.",
      },
    ],
  }),
  component: OrderSentPage,
});

function OrderSentPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-accent flex items-center justify-center text-primary-deep mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-primary-deep">
          Votre commande a été envoyée sur WhatsApp
        </h1>
        <p className="text-foreground/70 mt-4 leading-relaxed">
          Merci pour votre confiance ! Nous vous contactons très bientôt pour confirmer la
          disponibilité, la livraison et le mode de paiement (à la livraison ou en main propre).
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink("Bonjour, je viens d'envoyer une commande sur votre site 🌸")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" /> Ouvrir WhatsApp
          </a>
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 rounded-full border border-primary text-primary-deep px-6 py-3 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Continuer mes achats <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Contact : +229 {WHATSAPP_NUMBER.slice(3)}
        </p>
      </section>
    </SiteLayout>
  );
}
