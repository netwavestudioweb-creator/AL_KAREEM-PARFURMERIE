import { formatFCFA } from "./currency";

export interface OrderMessageItem {
  name: string;
  volume: string;
  price: number;
  quantity: number;
}

export interface OrderMessageDetails {
  items: OrderMessageItem[];
  total: number;
  name: string;
  phone: string;
  zone: string;
  address?: string;
}

export function buildOrderMessage({
  items,
  total,
  name,
  phone,
  zone,
  address,
}: OrderMessageDetails): string {
  const lines = items
    .map(
      (item) =>
        `• ${item.name}${item.volume ? ` (${item.volume})` : ""} × ${item.quantity} — ${formatFCFA(item.price)} l'unité = ${formatFCFA(item.price * item.quantity)}`,
    )
    .join("\n");

  return (
    `Bonjour Al Kareem Parfumerie 🌸\n\n` +
    `Je souhaite commander les articles suivants sur votre site :\n\n` +
    `${lines}\n\n` +
    `Sous-total : ${formatFCFA(total)}\n` +
    `Frais de livraison : à confirmer selon la zone\n` +
    `Total : ${formatFCFA(total)}\n\n` +
    `Mes coordonnées :\n` +
    `• Nom : ${name}\n` +
    `• Téléphone : ${phone}\n` +
    `• Zone de livraison : ${zone}\n` +
    (address?.trim() ? `• Adresse / point de repère : ${address.trim()}\n` : "") +
    `\nMerci de me confirmer la disponibilité et les modalités de paiement.`
  );
}
