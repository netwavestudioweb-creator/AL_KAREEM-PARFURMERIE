import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "./site-config";

export type Score = "oui" | "moyen" | "non";
export type ReviewStatus = "requested" | "received" | "published" | "internal" | "archived";

export interface Review {
  id: string;
  order_id: string | null;
  token: string;
  customer_name: string;
  display_name: string;
  city: string;
  rating: number | null;
  product_score: Score | null;
  delivery_score: Score | null;
  service_score: Score | null;
  message: string;
  consent_publish: boolean;
  status: ReviewStatus;
  testimonial_id: string | null;
  created_at: string;
  submitted_at: string | null;
}

export const REVIEW_QUESTIONS = [
  {
    key: "product_score",
    label: "Le parfum",
    question: "Le parfum correspond-il à vos attentes ?",
  },
  {
    key: "delivery_score",
    label: "La livraison",
    question: "La livraison a-t-elle été rapide et soignée ?",
  },
  {
    key: "service_score",
    label: "Le service",
    question: "Avez-vous été bien conseillé(e) et accompagné(e) ?",
  },
] as const;

export const SCORE_LABELS: Record<Score, string> = { oui: "Oui", moyen: "Moyen", non: "Non" };

/**
 * Numéro au format WhatsApp (chiffres, indicatif inclus). Les commandes béninoises sont
 * enregistrées sans indicatif (« 01 61 88 89 87 ») : on ajoute 229.
 */
export function whatsappNumberFromOrderPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return phone.trim().startsWith("+") ? digits : `229${digits}`;
}

export function reviewUrl(token: string): string {
  return `${SITE_CONFIG.url}/avis/${token}`;
}

export function reviewRequestMessage(customerName: string, token: string): string {
  const first = customerName.trim().split(/\s+/)[0] || "";
  return (
    `Bonjour ${first}, merci pour votre commande chez Al Kareem Parfumerie !\n\n` +
    `Votre avis compte beaucoup pour nous : pouvez-vous nous dire en 30 secondes ce que vous avez pensé du parfum, de la livraison et du service ?\n\n` +
    `${reviewUrl(token)}\n\nMerci et à très bientôt.`
  );
}

/** Crée (ou retrouve) la demande d'avis d'une commande et renvoie son lien personnel. */
export async function ensureReviewRequest(orderId: string, customerName: string): Promise<string> {
  const existing = await supabase
    .from("reviews")
    .select("token")
    .eq("order_id", orderId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.token;
  const created = await supabase
    .from("reviews")
    .insert({ order_id: orderId, customer_name: customerName })
    .select("token")
    .single();
  if (created.error) throw created.error;
  return created.data.token;
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

/** Publie l'avis sur le site (il devient un témoignage marqué « Achat vérifié »). */
export async function publishReview(r: Review): Promise<void> {
  if (!r.consent_publish) throw new Error("La cliente n'a pas accepté la publication.");
  const name = [r.display_name, r.city].filter(Boolean).join(", ").slice(0, 60);
  const t = await supabase
    .from("testimonials")
    .insert({ name: name || "Cliente", message: r.message.slice(0, 600), rating: r.rating })
    .select("id")
    .single();
  if (t.error) throw t.error;
  const u = await supabase
    .from("reviews")
    .update({ status: "published", testimonial_id: t.data.id })
    .eq("id", r.id);
  if (u.error) throw u.error;
}

/** Retire l'avis du site sans le supprimer. */
export async function setReviewStatus(r: Review, status: "internal" | "archived"): Promise<void> {
  if (r.testimonial_id) {
    const d = await supabase.from("testimonials").delete().eq("id", r.testimonial_id);
    if (d.error) throw d.error;
  }
  const u = await supabase.from("reviews").update({ status, testimonial_id: null }).eq("id", r.id);
  if (u.error) throw u.error;
}
