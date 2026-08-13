import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/products";

export function WhatsAppFab() {
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
