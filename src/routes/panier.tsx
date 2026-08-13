import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout";
import { useCart } from "@/lib/cart";
import { formatFCFA, whatsappLink, WHATSAPP_NUMBER } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier — Al Kareem Parfumerie" },
      { name: "description", content: "Finalisez votre commande via WhatsApp. Paiement à la livraison ou en main propre." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Panier — Al Kareem" },
      { property: "og:description", content: "Finalisez votre commande de parfums via WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/og-alkareem.jpg" },
      { name: "twitter:image", content: "/og-alkareem.jpg" },
    ],
  }),
  component: CartPage,
});

const CUSTOMER_KEY = "alkareem_customer_v1";

type ZoneKey = "Cotonou" | "Abomey-Calavi" | "Porto-Novo" | "Autre";
const ZONE_OPTIONS: ZoneKey[] = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Autre"];

/** Numéro béninois : 8 chiffres locaux, éventuellement précédés du préfixe 229
 *  et/ou d'un + ou de 00, et pouvant contenir espaces, tirets ou points. */
function isValidBeninPhone(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  // Accepte 8 chiffres (local), 10 (avec 229) ou 11 (avec 00229)
  if (digits.length === 8) return /^[0-9]{8}$/.test(digits);
  if (digits.length === 10 && digits.startsWith("229")) return true;
  if (digits.length === 11 && digits.startsWith("00229")) return true;
  // Certains numéros locaux courants tapés avec un 0 initial : 9 chiffres
  if (digits.length === 9 && digits.startsWith("0")) return true;
  return false;
}

function CartPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, total, clear } = useCart();
  const [step, setStep] = useState<"cart" | "form" | "confirm">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    tel: "",
    zone: "Cotonou" as ZoneKey,
    autreVille: "",
    adresse: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_KEY);
      if (raw) {
        const c = JSON.parse(raw);
        setForm((f) => ({ ...f, ...c }));
      }
    } catch {}
  }, []);

  const zoneLabel = form.zone === "Autre" && form.autreVille.trim()
    ? form.autreVille.trim()
    : form.zone;

  const goToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      toast.error("Merci d'indiquer votre nom.");
      return;
    }
    if (!isValidBeninPhone(form.tel)) {
      toast.error("Numéro invalide. Utilisez un numéro béninois (8 chiffres, ex : 01 61 88 89 87).");
      return;
    }
    if (form.zone === "Autre" && !form.autreVille.trim()) {
      toast.error("Merci de préciser votre ville.");
      return;
    }
    setStep("confirm");
  };

  const confirmAndSend = async () => {
    if (items.length === 0) {
      toast.error("Votre panier est vide.");
      return;
    }
    setSubmitting(true);

    const orderItems = items.map((i) => ({
      product_id: i.productId,
      name: i.name,
      volume: i.volume,
      unit_price_fcfa: i.price,
      quantity: i.quantity,
      line_total_fcfa: i.price * i.quantity,
    }));

    let error: { message: string } | null = null;
    try {
      const res = await supabase.from("orders").insert({
        customer_name: form.nom.trim(),
        customer_phone: form.tel.trim(),
        zone: zoneLabel,
        address: form.adresse.trim(),
        items: orderItems,
        subtotal_fcfa: total,
        total_fcfa: total,
        status: "envoyee",
      });
      error = res.error;
    } catch {
      // Coupure réseau ou requête interrompue
      setSubmitting(false);
      toast.error("Connexion interrompue. Vérifiez votre réseau puis réessayez.");
      return;
    }

    if (error) {
      setSubmitting(false);
      const m = error.message ?? "";
      toast.error(
        /Trop de commandes/i.test(m)
          ? "Plusieurs commandes ont déjà été envoyées avec ce numéro. Merci de patienter un moment ou de nous écrire sur WhatsApp."
          : /indisponible/i.test(m)
            ? "Un article de votre panier est en rupture de stock. Retirez-le puis réessayez."
            : /introuvable|inconnu/i.test(m)
              ? "Un article de votre panier n'est plus disponible à la vente. Retirez-le puis réessayez."
              : /Failed to fetch|NetworkError/i.test(m)
                ? "Connexion interrompue. Vérifiez votre réseau puis réessayez."
                : "Impossible d'enregistrer la commande. Réessayez ou écrivez-nous sur WhatsApp.",
      );
      return;
    }

    try {
      localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify({ nom: form.nom, tel: form.tel, zone: form.zone, autreVille: form.autreVille, adresse: form.adresse }),
      );
    } catch {}

    const lines = items
      .map(
        (i) =>
          `• ${i.name}${i.volume ? ` (${i.volume})` : ""} × ${i.quantity} — ${formatFCFA(i.price)} l'unité = ${formatFCFA(i.price * i.quantity)}`,
      )
      .join("\n");

    const msg =
      `Bonjour Al Kareem Parfumerie 🌸\n\n` +
      `Je souhaite commander les articles suivants sur votre site :\n\n` +
      `${lines}\n\n` +
      `Sous-total : ${formatFCFA(total)}\n` +
      `Frais de livraison : à confirmer selon la zone\n` +
      `Total : ${formatFCFA(total)}\n\n` +
      `Mes coordonnées :\n` +
      `• Nom : ${form.nom}\n` +
      `• Téléphone : ${form.tel}\n` +
      `• Zone de livraison : ${zoneLabel}\n` +
      (form.adresse.trim() ? `• Adresse / point de repère : ${form.adresse}\n` : "") +
      `\nMerci de me confirmer la disponibilité et les modalités de paiement.`;

    window.open(whatsappLink(msg), "_blank");
    clear();
    setSubmitting(false);
    navigate({ to: "/commande-envoyee" });
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-24 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-accent flex items-center justify-center text-primary-deep mb-6">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl text-primary-deep">Votre panier est vide</h1>
          <p className="text-muted-foreground mt-2">Découvrez nos fragrances et laissez-vous séduire.</p>
          <Link to="/boutique" className="inline-flex mt-6 rounded-full bg-primary-deep text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary transition-colors">
            Aller à la boutique
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl text-primary-deep mb-8">Votre panier</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {items.map((i) => (
              <div key={i.productId} className="flex gap-4 p-4 rounded-2xl bg-white border border-border">
                <img src={i.image} alt={i.name} className="h-24 w-24 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-lg text-primary-deep">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.volume}</div>
                  <div className="mt-2 font-medium text-primary-deep">{formatFCFA(i.price)}</div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(i.productId)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  <div className="inline-flex items-center border border-border rounded-full">
                    <button onClick={() => updateQty(i.productId, i.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-l-full"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm font-medium">{i.quantity}</span>
                    <button onClick={() => updateQty(i.productId, i.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-r-full"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">Vider le panier</button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border h-fit space-y-5 shadow-soft">
            <div className="flex justify-between font-medium">
              <span>Sous-total</span>
              <span className="font-serif text-2xl text-primary-deep">{formatFCFA(total)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Frais de livraison confirmés sur WhatsApp selon votre zone.
            </div>

            {step === "cart" && (
              <button
                onClick={() => setStep("form")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary-deep text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Finaliser ma commande
              </button>
            )}

            {step === "form" && (
              <form onSubmit={goToConfirm} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-deep"
                >
                  <ArrowLeft className="h-3 w-3" /> Retour
                </button>

                <div className="grid gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-foreground/70">Nom complet</span>
                    <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-foreground/70">Téléphone (Bénin)</span>
                    <input
                      required
                      type="tel"
                      inputMode="tel"
                      placeholder="Ex : 01 61 88 89 87"
                      value={form.tel}
                      onChange={(e) => setForm({ ...form, tel: e.target.value })}
                      className="mt-1 w-full h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                    />
                    <span className="text-[11px] text-muted-foreground">Format : 8 chiffres, ou avec préfixe +229.</span>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-foreground/70">Zone de livraison</span>
                    <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value as ZoneKey })} className="mt-1 w-full h-11 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary">
                      {ZONE_OPTIONS.map((z) => (
                        <option key={z} value={z}>{z === "Autre" ? "Autre — préciser la ville" : z}</option>
                      ))}
                    </select>
                  </label>
                  {form.zone === "Autre" && (
                    <label className="block">
                      <span className="text-xs font-medium text-foreground/70">Ville</span>
                      <input required value={form.autreVille} onChange={(e) => setForm({ ...form, autreVille: e.target.value })} placeholder="Ex : Parakou" className="mt-1 w-full h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
                    </label>
                  )}
                  <label className="block">
                    <span className="text-xs font-medium text-foreground/70">Adresse ou point de repère <span className="text-muted-foreground">(facultatif)</span></span>
                    <textarea value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary-deep text-primary-foreground py-3.5 text-sm font-medium hover:bg-primary transition-colors"
                >
                  Vérifier ma commande
                </button>
              </form>
            )}

            {step === "confirm" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-deep"
                >
                  <ArrowLeft className="h-3 w-3" /> Modifier
                </button>

                <div className="rounded-xl bg-secondary/40 border border-border p-4 space-y-3 text-sm">
                  <div className="font-serif text-lg text-primary-deep flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Récapitulatif
                  </div>
                  <ul className="space-y-1">
                    {items.map((i) => (
                      <li key={i.productId} className="flex justify-between gap-3">
                        <span className="text-foreground/80">{i.name}{i.volume ? ` (${i.volume})` : ""} × {i.quantity}</span>
                        <span className="text-foreground/70">{formatFCFA(i.price * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between border-t border-border pt-2 font-medium">
                    <span>Total</span>
                    <span>{formatFCFA(total)}</span>
                  </div>
                  <div className="border-t border-border pt-2 space-y-0.5 text-foreground/80">
                    <div><span className="text-muted-foreground">Nom : </span>{form.nom}</div>
                    <div><span className="text-muted-foreground">Téléphone : </span>{form.tel}</div>
                    <div><span className="text-muted-foreground">Zone : </span>{zoneLabel}</div>
                    {form.adresse.trim() && (
                      <div><span className="text-muted-foreground">Adresse : </span>{form.adresse}</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={confirmAndSend}
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp text-whatsapp-foreground py-3.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <MessageCircle className="h-4 w-4" />
                  {submitting ? "Envoi…" : "Confirmer et ouvrir WhatsApp"}
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  Vous serez redirigé·e vers WhatsApp pour finaliser avec Al Kareem (+229 {WHATSAPP_NUMBER.slice(3)}).
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
