import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/products";
import { useRouterState } from "@tanstack/react-router";

export function WhatsAppFab() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isProductPage = pathname.startsWith("/produit/");

  // Sur la fiche produit mobile, la barre sticky en bas intègre déjà le bouton WhatsApp direct.
  if (isProductPage) {
    return (
      <a
        href={whatsappLink("Bonjour Al Kareem, j'aimerais avoir des informations 🌸")}
        target="_blank"
        rel="noreferrer"
        className="hidden lg:flex fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-whatsapp text-whatsapp-foreground items-center justify-center shadow-elegant hover:scale-105 transition-transform"
        aria-label="Contacter sur WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    );
  }

  return (
    <a
      href={whatsappLink("Bonjour Al Kareem, j'aimerais avoir des informations 🌸")}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-whatsapp text-whatsapp-foreground flex items-center justify-center shadow-elegant hover:scale-105 transition-transform"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
