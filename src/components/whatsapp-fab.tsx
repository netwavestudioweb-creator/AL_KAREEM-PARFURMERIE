import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/products";
import { useRouterState } from "@tanstack/react-router";

export function WhatsAppFab() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isProductPage = pathname.startsWith("/produit/");

  const content = (
    <div className="group fixed bottom-6 right-6 z-50 flex items-center gap-2.5">
      {/* Infobulle 'Conseil Privé' au survol */}
      <div className="pointer-events-none opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rounded-full bg-primary-deep/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-white shadow-elegant border border-gold/40 whitespace-nowrap flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-whatsapp animate-pulse" />
        <span>Conseil Privé</span>
      </div>

      <a
        href={whatsappLink(
          "Bonjour Al Kareem, je souhaite un conseil personnalisé pour choisir mon parfum 🌸",
        )}
        target="_blank"
        rel="noreferrer"
        className="h-14 w-14 rounded-full bg-whatsapp text-whatsapp-foreground flex items-center justify-center shadow-elegant hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Conseil Privé WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );

  // Sur la fiche produit mobile, la barre sticky en bas intègre déjà le bouton WhatsApp direct.
  if (isProductPage) {
    return <div className="hidden lg:block">{content}</div>;
  }

  return content;
}
