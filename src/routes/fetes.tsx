import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { formatFCFA, type Product } from "@/lib/products";
import {
  Sparkles,
  Gift,
  Truck,
  ShieldCheck,
  Clock,
  MessageCircle,
  Play,
  Heart,
  Share2,
  CheckCircle2,
  Award,
  Volume2,
  ShoppingBag,
  Star,
  Eye,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/fetes")({
  head: () => ({
    meta: [
      { title: "Édition Spéciale Fêtes de Fin d'Année — Al Kareem Parfumerie" },
      {
        name: "description",
        content:
          "Découvrez notre sélection féerique pour Noël et le Nouvel An : coffrets cadeaux d'exception, parfums de fête et livraison express garantie à Cotonou.",
      },
    ],
  }),
  component: FetesPage,
});

type TabMode = "maquette" | "affiches" | "videos" | "guide";

export function FetesPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("maquette");
  const [giftFilter, setGiftFilter] = useState<string>("tous");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  // Sélections pour la maquette fêtes
  const coffrets = useMemo(() => {
    return products.filter(
      (p) =>
        p.category === "coffrets-cadeaux" ||
        p.category === "coffrets" ||
        p.name.toLowerCase().includes("coffret") ||
        p.name.toLowerCase().includes("set") ||
        p.name.toLowerCase().includes("collection"),
    );
  }, [products]);

  const pourElle = useMemo(() => {
    return products.filter(
      (p) =>
        p.category === "femmes" ||
        p.category === "femme" ||
        p.name.toLowerCase().includes("pour femme") ||
        p.name.toLowerCase().includes("woman") ||
        p.name.toLowerCase().includes("her") ||
        p.name.toLowerCase().includes("femme"),
    );
  }, [products]);

  const pourLui = useMemo(() => {
    return products.filter(
      (p) =>
        p.category === "hommes" ||
        p.category === "homme" ||
        p.name.toLowerCase().includes("pour homme") ||
        p.name.toLowerCase().includes("men") ||
        p.name.toLowerCase().includes("him") ||
        p.name.toLowerCase().includes("homme"),
    );
  }, [products]);

  const petitsPrix = useMemo(() => {
    return products.filter((p) => p.price <= 25000);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (giftFilter === "coffrets") return coffrets.length > 0 ? coffrets : products.slice(0, 8);
    if (giftFilter === "elle") return pourElle.length > 0 ? pourElle : products.slice(0, 8);
    if (giftFilter === "lui") return pourLui.length > 0 ? pourLui : products.slice(0, 8);
    if (giftFilter === "petits-prix")
      return petitsPrix.length > 0 ? petitsPrix : products.slice(0, 8);
    return products.slice(0, 12);
  }, [giftFilter, products, coffrets, pourElle, pourLui, petitsPrix]);

  return (
    <SiteLayout>
      {/* ────────────────────────────────────────────────────────── */}
      {/* BARRE DE CONTRÔLE DU STUDIO DE PROPOSITION (STICKY HEADER) */}
      {/* ────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Console de prévisualisation des Fêtes"
        className="sticky top-[64px] z-30 border-b border-[#E9C46A]/40 bg-[#241034] text-white shadow-lg backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E9C46A] text-[#241034]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E9C46A]">
                Proposition Noël & Nouvel An 2026
              </p>
              <p className="text-xs font-medium text-white/90">
                Aperçu local interactif pour Al Kareem
              </p>
            </div>
          </div>

          {/* Onglets de navigation dans la proposition */}
          <nav
            aria-label="Vues de la proposition"
            className="flex items-center gap-1.5 overflow-x-auto rounded-lg bg-black/30 p-1 text-xs"
          >
            <button
              onClick={() => setActiveTab("maquette")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                activeTab === "maquette"
                  ? "bg-[#E9C46A] text-[#241034] shadow font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              1. Maquette Site Fêtes
            </button>
            <button
              onClick={() => setActiveTab("affiches")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                activeTab === "affiches"
                  ? "bg-[#E9C46A] text-[#241034] shadow font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              2. Les 3 Affiches Publicitaires
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                activeTab === "videos"
                  ? "bg-[#E9C46A] text-[#241034] shadow font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              3. Vidéos & Storyboards
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                activeTab === "guide"
                  ? "bg-[#E9C46A] text-[#241034] shadow font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Gift className="h-3.5 w-3.5" />
              4. Stratégie Cadeaux
            </button>
          </nav>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 1 : MAQUETTE INTERACTIVE DU SITE SPÉCIAL FÊTES        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "maquette" && (
        <div className="bg-[#FAF7F2]">
          {/* BANDEAU ANNONCE NOËL / RÉVEILLON */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#2D1244] via-[#4A1D6D] to-[#2D1244] px-4 py-2.5 text-center text-xs font-medium text-white shadow-inner">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#E9C46A]" />
              <p>
                <span className="font-semibold text-[#E9C46A]">Fêtes 2026 :</span> Emballage cadeau
                luxe & ruban doré <strong className="underline">offerts</strong> sur toutes vos
                commandes. Livraison express garantie à Cotonou & Calavi ! 🎁
              </p>
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#E9C46A]" />
            </div>
          </div>

          {/* HERO SPÉCIAL FÊTES */}
          <section className="relative mx-auto mt-2 w-full max-w-[1320px] px-4 lg:mt-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1E092F] via-[#2F1149] to-[#12041D] text-white shadow-2xl">
              {/* Étoiles dorées d'arrière-plan */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(#E9C46A 1px, transparent 1px), radial-gradient(#E9C46A 1.5px, transparent 1.5px)",
                  backgroundSize: "28px 28px, 44px 44px",
                  backgroundPosition: "0 0, 14px 14px",
                }}
              />

              <div className="relative grid min-h-[480px] lg:grid-cols-[1.1fr_0.9fr]">
                {/* Texte et appel à l'action */}
                <div className="flex flex-col justify-center px-6 py-12 lg:px-14 lg:py-16">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E9C46A]/40 bg-[#E9C46A]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#E9C46A]">
                    <Sparkles className="h-3 w-3" /> Édition Spéciale Fêtes de Fin d'Année
                  </div>

                  <h1 className="mt-4 font-serif text-[38px] font-medium leading-[1.08] text-white lg:text-[62px]">
                    Offrez la Magie d'un <span className="italic text-[#E9C46A]">Sillage d'Or</span>
                    .
                  </h1>

                  <p className="mt-4 max-w-[480px] text-sm leading-relaxed text-[#E5D7F0] lg:text-base">
                    Pour Noël et le Réveillon, sublimez ceux que vous aimez avec nos coffrets
                    d'exception, fragrances rares et huiles pures. Prêts à offrir dans un écrin de
                    fête raffiné.
                  </p>

                  {/* Boutons d'action */}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href="#selection-fetes"
                      className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-[#E9C46A] px-7 text-sm font-semibold text-[#241034] shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      <Gift className="h-4 w-4" />
                      Découvrir la Sélection Fêtes
                    </a>
                    <a
                      href="https://wa.me/2290161888987?text=Bonjour%20Al%20Kareem,%20je%20souhaite%20un%20conseil%20cadeau%20pour%20les%20f%C3%AAtes."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    >
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      Conseil Cadeau WhatsApp
                    </a>
                  </div>

                  {/* Badges de réassurance fêtes */}
                  <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-white/10 pt-5 text-xs text-[#E5D7F0]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#E9C46A]" />
                      <span>Emballage cadeau offert</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#E9C46A]" />
                      <span>Livré le jour même à Cotonou</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#E9C46A]" />
                      <span>100% Parfums certifiés</span>
                    </div>
                  </div>
                </div>

                {/* Visuel vitrine de fête */}
                <div className="relative hidden items-center justify-center p-8 lg:flex">
                  <div className="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#E9C46A]/30 bg-gradient-to-b from-white/10 to-transparent p-6 shadow-2xl backdrop-blur-sm">
                    <div className="flex h-full flex-col justify-between rounded-xl border border-dashed border-[#E9C46A]/40 p-6 text-center">
                      <div className="space-y-1">
                        <span className="text-3xl">🎁</span>
                        <h2 className="font-serif text-2xl font-medium text-[#E9C46A]">
                          Le Coffret Idéal
                        </h2>
                        <p className="text-xs text-white/70">
                          Composé selon vos envies ou prêt-à-offrir
                        </p>
                      </div>

                      <div className="space-y-2 rounded-lg bg-black/40 p-4 text-left text-xs">
                        <div className="flex justify-between border-b border-white/10 pb-1.5">
                          <span className="text-white/80">Flacon 100ml au choix</span>
                          <span className="font-semibold text-[#E9C46A]">Inclus</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1.5">
                          <span className="text-white/80">Déodorant ou Brume assortie</span>
                          <span className="font-semibold text-[#E9C46A]">Inclus</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1.5">
                          <span className="text-white/80">Écrin rigide & ruban doré</span>
                          <span className="font-semibold text-emerald-400">Offert</span>
                        </div>
                        <div className="flex justify-between pt-1 font-medium">
                          <span>Carte de vœux manuscrite</span>
                          <span className="font-semibold text-emerald-400">Offerte</span>
                        </div>
                      </div>

                      <a
                        href="https://wa.me/2290161888987?text=Bonjour%20Al%20Kareem,%20je%20veux%20composer%20un%20coffret%20cadeau%20de%20f%C3%AAte."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#E9C46A] text-xs font-semibold text-[#241034] transition-transform hover:scale-102"
                      >
                        Composer mon Coffret Fêtes
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SÉLECTEUR RAPIDE D'IDÉES CADEAUX (FILTRES INTERACTIFS)     */}
          {/* ────────────────────────────────────────────────────────── */}
          <section
            id="selection-fetes"
            className="mx-auto mt-12 w-full max-w-[1320px] px-4 lg:px-8"
          >
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6420]">
                Trouvez le Cadeau Parfait
              </span>
              <h2 className="mt-1 font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
                À qui souhaitez-vous faire plaisir ?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Une sélection sur-mesure pour chaque personnalité et chaque budget.
              </p>
            </div>

            {/* Boutons de filtres */}
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {[
                { id: "tous", label: "✨ Toute la Sélection Fêtes", icon: Sparkles },
                { id: "coffrets", label: "🎁 Coffrets Cadeaux", icon: Gift },
                { id: "elle", label: "🌸 Pour Elle (Féminin & Envoûtant)", icon: Heart },
                { id: "lui", label: "👑 Pour Lui (Boisé & Intense)", icon: Award },
                { id: "petits-prix", label: "💎 Moins de 25 000 FCFA", icon: ShoppingBag },
              ].map((btn) => {
                const Icon = btn.icon;
                const isSelected = giftFilter === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setGiftFilter(btn.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-[#241034] bg-[#241034] text-white shadow-md scale-105"
                        : "border-[#E9C46A]/50 bg-white text-[#241034] hover:bg-[#FAF4E8]"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${isSelected ? "text-[#E9C46A]" : "text-[#8A6420]"}`}
                    />
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Grille de produits */}
            <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-6">
              {isLoading ? (
                <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
                  Chargement des fragrances de fête…
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
                  Aucun produit ne correspond à ce filtre actuellement.
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div key={p.id} className="relative">
                    {/* Badge cadeau festif */}
                    <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#241034] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#E9C46A] shadow">
                      Cadeau Fêtes 🎁
                    </span>
                    <ProductCard product={p} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ────────────────────────────────────────────────────────── */}
          {/* BANDEAU DES 4 ENGAGEMENTS FÊTES AL KAREEM                  */}
          {/* ────────────────────────────────────────────────────────── */}
          <section className="mx-auto mt-16 w-full max-w-[1320px] px-4 lg:px-8">
            <div className="rounded-2xl border border-[#E9C46A]/40 bg-gradient-to-r from-[#FBF6EE] via-white to-[#FBF6EE] p-6 shadow-sm lg:p-10">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#241034]">
                      Emballage Luxe Offert
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Pochette ou coffret rigide avec ruban satiné or et carte de vœux
                      personnalisée.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#241034]">
                      Livraison Express Réveillon
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Livré en 2h à 4h à Cotonou & Calavi. Assuré jusqu'au 24 et 31 décembre à 19h !
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#241034]">
                      Authenticité Garantie
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      100% de parfums authentiques vérifiés. Tenue exceptionnelle pour les soirées.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                    <MessageCircle className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#241034]">
                      Paiement à la Réception
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Validez sur WhatsApp, payez en mains propres (MTN MoMo, Moov ou Espèces).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* APPEL WHATSAPP VIP FÊTES */}
          <section className="mx-auto my-16 w-full max-w-[1320px] px-4 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-[#241034] p-8 text-white lg:flex-row lg:px-12">
              <div className="space-y-1 text-center lg:text-left">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E9C46A]">
                  Assistance Personnalisée Fêtes
                </span>
                <h3 className="font-serif text-2xl font-medium lg:text-3xl">
                  Vous hésitez sur le choix du parfum ?
                </h3>
                <p className="text-sm text-[#E5D7F0]">
                  Donnez-nous la personnalité ou les goûts de la personne, nous sélectionnons son
                  parfum idéal.
                </p>
              </div>

              <a
                href="https://wa.me/2290161888987?text=Bonjour%20Al%20Kareem,%20j'aimerais%20de%20l'aide%20pour%20choisir%20un%20cadeau%20de%20f%C3%AAte."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[52px] shrink-0 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-8 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-5 w-5" />
                Écrire à notre Conseillère WhatsApp
              </a>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 2 : LES 3 AFFICHES PUBLICITAIRES RECOMMANDÉES         */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "affiches" && (
        <section
          aria-label="Affiches publicitaires"
          className="mx-auto my-10 w-full max-w-[1320px] px-4 lg:px-8"
        >
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6420]">
              Campagne Visuelle Fêtes 2026
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
              3 Affiches Clés en Main pour Réseaux Sociaux & Print
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Ces 3 affiches couvrent les 3 moments critiques de décembre : le lancement des
              cadeaux, la promotion des coffrets, et la commande d'urgence avant le réveillon.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* ───────────── AFFICHE 1 : L'ART D'OFFRIR ───────────── */}
            <div className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 text-xs">
                <span className="rounded-full bg-[#241034] px-2.5 py-0.5 font-semibold text-[#E9C46A]">
                  Affiche N°1 · Lancement
                </span>
                <span className="text-muted-foreground">Format 4:5 & 9:16</span>
              </div>

              {/* Rendu Visuel de l'Affiche */}
              <div className="mt-4 flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl border border-[#E9C46A]/50 bg-gradient-to-b from-[#1C072A] via-[#2D1244] to-[#12041D] p-6 text-white shadow-md relative">
                <div className="absolute top-0 right-0 p-4 opacity-15 text-5xl">✨</div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#E9C46A]">
                    Al Kareem Parfumerie · Cotonou
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-medium leading-tight text-white">
                    Offrez un Sillage <br />
                    <span className="italic text-[#E9C46A]">Inoubliable</span>.
                  </h3>
                </div>

                <div className="my-auto py-4 text-center">
                  <div className="inline-block rounded-2xl border border-[#E9C46A]/30 bg-white/5 p-5 backdrop-blur-sm">
                    <span className="text-4xl">🎁✨</span>
                    <p className="mt-2 font-serif text-lg font-medium text-white">
                      Collection Prestige 2026
                    </p>
                    <p className="text-[11px] text-[#E5D7F0]">
                      Parfums raffinés · Flacons d'exception
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#E9C46A] font-semibold">Emballage Luxe Offert</span>
                    <span className="rounded bg-[#25D366] px-2 py-0.5 text-[10px] font-bold text-white">
                      WhatsApp 61 88 89 87
                    </span>
                  </div>
                  <p className="mt-1 text-[9px] text-white/60">
                    www.al-kareemparfurmerie.com · Cotonou & Calavi
                  </p>
                </div>
              </div>

              {/* Arguments & Texte de publication */}
              <div className="mt-5 space-y-2 text-xs">
                <h4 className="font-semibold text-[#241034]">💡 Objectif :</h4>
                <p className="text-muted-foreground">
                  Positionner Al Kareem comme la référence incontournable du cadeau chic à Cotonou
                  dès le 1er décembre.
                </p>
                <h4 className="font-semibold text-[#241034]">📝 Texte de publication prêt :</h4>
                <div className="rounded-lg bg-secondary/50 p-3 font-mono text-[11px] text-foreground">
                  « Le meilleur cadeau n'est pas celui qui s'oublie, c'est celui qui laisse une
                  empreinte… ✨ Découvrez notre collection féerique des fêtes chez Al Kareem.
                  Emballage luxe avec ruban or offert ! 🎁 Commandes WhatsApp en bio ou sur le site.
                  #AlKareem #Cotonou #Noel2026 »
                </div>
              </div>
            </div>

            {/* ───────────── AFFICHE 2 : LES COFFRETS PRESTIGE ───────────── */}
            <div className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 text-xs">
                <span className="rounded-full bg-[#8A6420] px-2.5 py-0.5 font-semibold text-white">
                  Affiche N°2 · Offre Vedette
                </span>
                <span className="text-muted-foreground">Format 4:5 & Carré</span>
              </div>

              {/* Rendu Visuel de l'Affiche */}
              <div className="mt-4 flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl border border-[#E9C46A]/50 bg-gradient-to-b from-[#2B1408] via-[#3F1A5E] to-[#1F082F] p-6 text-white shadow-md relative">
                <div>
                  <span className="rounded-full bg-[#E9C46A] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#241034]">
                    Offre Spéciale Fêtes
                  </span>
                  <h3 className="mt-2.5 font-serif text-2xl font-medium leading-tight text-white">
                    Les Coffrets Cadeaux <br />
                    <span className="text-[#E9C46A]">Duo & Trio</span>
                  </h3>
                </div>

                <div className="my-auto rounded-xl border border-white/10 bg-black/30 p-4 text-center">
                  <p className="text-xs font-semibold text-[#E9C46A]">LE PACK PRÊT-À-OFFRIR</p>
                  <p className="mt-1 text-sm font-medium">Parfum 100ml + Déodorant / Brume</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-xs text-white/60 line-through">35 000 FCFA</span>
                    <span className="rounded-full bg-[#E9C46A] px-3 py-1 font-serif text-base font-bold text-[#241034]">
                      Dès 25 000 FCFA
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-emerald-300">
                    + Carte de vœux manuscrite incluse
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">Stock Spécial Fêtes</span>
                    <span className="rounded bg-[#25D366] px-2 py-0.5 text-[10px] font-bold text-white">
                      Commandez sur WhatsApp
                    </span>
                  </div>
                  <p className="mt-1 text-[9px] text-white/60">
                    Paiement à la livraison : MoMo, Moov ou Espèces
                  </p>
                </div>
              </div>

              {/* Arguments & Texte de publication */}
              <div className="mt-5 space-y-2 text-xs">
                <h4 className="font-semibold text-[#241034]">💡 Objectif :</h4>
                <p className="text-muted-foreground">
                  Générer des paniers moyens élevés en vendant des duos et coffrets prêts à offrir
                  sans prise de tête pour le client.
                </p>
                <h4 className="font-semibold text-[#241034]">📝 Texte de publication prêt :</h4>
                <div className="rounded-lg bg-secondary/50 p-3 font-mono text-[11px] text-foreground">
                  « Pas le temps de courir les boutiques ? 🎄 Nos coffrets prestige sont prêts à
                  être posés sous le sapin. Parfum d'exception + soin assorti dans un écrin de luxe.
                  Faites briller les yeux de vos proches en un clic WhatsApp ! 💫 »
                </div>
              </div>
            </div>

            {/* ───────────── AFFICHE 3 : URGENCE RÉVEILLON ───────────── */}
            <div className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 text-xs">
                <span className="rounded-full bg-red-700 px-2.5 py-0.5 font-semibold text-white">
                  Affiche N°3 · Urgence 24h
                </span>
                <span className="text-muted-foreground">Format 9:16 (Story/Statut)</span>
              </div>

              {/* Rendu Visuel de l'Affiche */}
              <div className="mt-4 flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl border border-red-500/40 bg-gradient-to-b from-[#330914] via-[#240A28] to-[#12041D] p-6 text-white shadow-md relative">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    <Clock className="h-3 w-3" /> Dernière Ligne Droite
                  </span>
                  <h3 className="mt-2.5 font-serif text-2xl font-medium leading-tight text-white">
                    Prêt(e) pour le <br />
                    <span className="text-[#E9C46A]">Réveillon ?</span>
                  </h3>
                </div>

                <div className="my-auto space-y-2 rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                  <p className="text-xs font-semibold text-white">
                    ⚡ LIVRAISON EXPRESS COTONOU & CALAVI
                  </p>
                  <p className="text-xs text-[#E5D7F0]">
                    Commandez avant 16h, livré chez vous avant votre soirée !
                  </p>
                  <div className="rounded-lg bg-white/10 py-1.5 text-[11px] font-semibold text-[#E9C46A]">
                    Ne sortez pas sans votre signature olfactive
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400">Livreurs mobilisés</span>
                    <span className="rounded bg-[#25D366] px-2 py-0.5 text-[10px] font-bold text-white">
                      WhatsApp Direct
                    </span>
                  </div>
                  <p className="mt-1 text-[9px] text-white/60">
                    Service garanti les 24, 25 et 31 Décembre 2026
                  </p>
                </div>
              </div>

              {/* Arguments & Texte de publication */}
              <div className="mt-5 space-y-2 text-xs">
                <h4 className="font-semibold text-[#241034]">💡 Objectif :</h4>
                <p className="text-muted-foreground">
                  Capter les acheteurs de dernière minute du 20 au 31 décembre avec la promesse
                  d'une livraison express ultra fiable.
                </p>
                <h4 className="font-semibold text-[#241034]">📝 Texte de publication prêt :</h4>
                <div className="rounded-lg bg-secondary/50 p-3 font-mono text-[11px] text-foreground">
                  « La fête est dans quelques heures et il vous manque le cadeau parfait ou votre
                  parfum de soirée ? ⏳ Pas de panique : nos livreurs sillonnent Cotonou et Calavi
                  en continu. Écrivez-nous sur WhatsApp, c'est chez vous en un éclair ! ⚡🍾 »
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 3 : LES VIDÉOS PUBLICITAIRES (STORYBOARDS & SCRIPTS)   */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "videos" && (
        <section
          aria-label="Storyboards des vidéos publicitaires"
          className="mx-auto my-10 w-full max-w-[1320px] px-4 lg:px-8"
        >
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6420]">
              Production Vidéo Fêtes 2026
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
              2 Concepts Vidéos Publicitaires avec Scripts & Storyboards
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Conçus spécialement pour les formats courts TikTok / Instagram Reels / Statuts
              WhatsApp, et prêts à être enregistrés ou montés avec les visuels du site.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* ───────────── VIDÉO 1 : FORMAT COURT 20s (REELS / TIKTOK) ───────────── */}
            <div className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E9C46A] text-[#241034]">
                    <Play className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#241034]">
                      Spot Court 20s · « Le Dilemme du Cadeau »
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Format vertical 9:16 pour TikTok, Reels et Statuts WhatsApp
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Haute Conversion
                </span>
              </div>

              {/* Storyboard pas à pas */}
              <div className="mt-5 space-y-4 text-xs">
                {/* Plan 1 */}
                <div className="flex gap-3 rounded-xl border border-border/60 bg-[#FAF7F2] p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#241034] font-bold text-[#E9C46A]">
                    0-3s
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#241034]">
                      Scène 1 : L'Accroche / Le Problème (Pattern Interrupt)
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Visuel :</strong> Gros plan dynamique sur une personne songeuse avec
                      son smartphone à Cotonou. Texte clignotant à l'écran : « Tu n'as toujours pas
                      trouvé ton cadeau de fête ? »
                    </p>
                    <p className="italic text-[#8A6420]">
                      <strong>🎙️ Voix-off (chaleureuse & rythmée) :</strong> « Décembre avance… et
                      tu ne sais toujours pas quoi lui offrir pour les fêtes ? »
                    </p>
                  </div>
                </div>

                {/* Plan 2 */}
                <div className="flex gap-3 rounded-xl border border-border/60 bg-[#FAF7F2] p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#241034] font-bold text-[#E9C46A]">
                    3-10s
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#241034]">
                      Scène 2 : La Solution Sensorielle (Unboxing Prestige)
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Visuel :</strong> Gros plan macro ralenti sur les mains qui délient un
                      ruban satin doré Al Kareem, ouverture du coffret, flacon étincelant avec la
                      lumière dorée des fêtes.
                    </p>
                    <p className="italic text-[#8A6420]">
                      <strong>🎙️ Voix-off :</strong> « Chez Al Kareem Parfumerie, on a préparé
                      l'inratable : des fragrances authentiques qui marquent les esprits, dans un
                      coffret luxe prêt à offrir. »
                    </p>
                  </div>
                </div>

                {/* Plan 3 */}
                <div className="flex gap-3 rounded-xl border border-border/60 bg-[#FAF7F2] p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#241034] font-bold text-[#E9C46A]">
                    10-15s
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#241034]">
                      Scène 3 : La Réassurance Express (Zéro stress)
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Visuel :</strong> Capture rapide de l'écran WhatsApp avec la commande
                      en 1 clic, puis le livreur souriant remettant le colis avec le badge Al
                      Kareem.
                    </p>
                    <p className="italic text-[#8A6420]">
                      <strong>🎙️ Voix-off :</strong> « Tu commandes sur WhatsApp en 30 secondes, et
                      c'est livré chez toi le jour même à Cotonou et Calavi ! »
                    </p>
                  </div>
                </div>

                {/* Plan 4 */}
                <div className="flex gap-3 rounded-xl border border-border/60 bg-[#FAF7F2] p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#241034] font-bold text-[#E9C46A]">
                    15-20s
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#241034]">
                      Scène 4 : Appel à l'action immédiat (Call-to-Action)
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Visuel :</strong> Logo Al Kareem éclatant, bouton WhatsApp vert
                      vibrant avec le numéro 61 88 89 87 et le site web.
                    </p>
                    <p className="italic text-[#8A6420]">
                      <strong>🎙️ Voix-off :</strong> « Écris-nous vite sur WhatsApp avant la rupture
                      des coffrets. Al Kareem : sublimez votre aura pour les fêtes. »
                    </p>
                  </div>
                </div>
              </div>

              {/* Fiche technique de production */}
              <div className="mt-5 rounded-xl bg-secondary/50 p-4 text-xs space-y-1.5">
                <p>
                  <strong>🎵 Ambiance sonore :</strong> Beat Afro-House / R&B doux avec carillon de
                  cloches festives en fond sonore.
                </p>
                <p>
                  <strong>💡 Matériel nécessaire :</strong> Un smartphone (iPhone/Samsung) en mode
                  cinématique 4K 60fps pour les ralentis sur le ruban et le flacon.
                </p>
              </div>
            </div>

            {/* ───────────── VIDÉO 2 : SPOT PRESTIGE 40s (V9 FÊTES) ───────────── */}
            <div className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#241034] text-[#E9C46A]">
                    <Volume2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#241034]">
                      Spot 40s « La Magie des Fêtes »
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Évolution festive du projet V9 existant (`video siteweb`)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-900">
                  Image de Marque & Ventes
                </span>
              </div>

              {/* Déroulé complet scène par scène */}
              <div className="mt-5 space-y-3.5 text-xs">
                <div className="rounded-xl border border-border/60 bg-[#FAF7F2] p-3">
                  <p className="font-semibold text-[#241034]">
                    ⏱️ 00:00 - 00:08 · Introduction Féerique
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    <strong>Visuel :</strong> Coucher de soleil élégant sur Cotonou, transition vers
                    une ambiance tamisée de fête. Flacon de parfum mis en lumière avec poussière
                    d'étoiles dorées.
                  </p>
                  <p className="italic text-[#8A6420] mt-0.5">
                    « Pour ces fêtes de fin d'année, il y a ce que l'on porte… et il y a l'émotion
                    que l'on laisse derrière soi. »
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-[#FAF7F2] p-3">
                  <p className="font-semibold text-[#241034]">
                    ⏱️ 00:08 - 00:18 · Le Savoir-Faire & L'Authenticité
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    <strong>Visuel :</strong> Défilé dynamique des catégories phares : flacons
                    scellés, vaporisation ralentie, zoom sur les marques prestigieuses disponibles
                    en boutique.
                  </p>
                  <p className="italic text-[#8A6420] mt-0.5">
                    « Al Kareem Parfumerie réunit pour vous les plus grandes fragrances d'Orient et
                    d'Occident. 100 % authentiques, testées pour tenir toute la nuit du réveillon. »
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-[#FAF7F2] p-3">
                  <p className="font-semibold text-[#241034]">
                    ⏱️ 00:18 - 00:28 · L'Offre Coffrets & Le Cadeau
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    <strong>Visuel :</strong> Préparation soignée d'une commande : pose du ruban or,
                    carte manuscrite glissée dans le paquet cadeau avec soin.
                  </p>
                  <p className="italic text-[#8A6420] mt-0.5">
                    « Profitez de nos coffrets cadeaux exclusifs : duo parfum et déodorant, huiles
                    rares et brumes corporelles, emballés avec raffinement et offerts avec amour. »
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-[#FAF7F2] p-3">
                  <p className="font-semibold text-[#241034]">
                    ⏱️ 00:28 - 00:40 · Clôture & Appel à l'action
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    <strong>Visuel :</strong> Sourire d'une cliente recevant son paquet, puis carton
                    final doré avec l'adresse du site et le numéro WhatsApp 61 88 89 87.
                  </p>
                  <p className="italic text-[#8A6420] mt-0.5">
                    « Commandez dès maintenant sur al-kareemparfurmerie.com ou via WhatsApp.
                    Livraison express partout au Bénin. Al Kareem : votre signature olfactive pour
                    des fêtes magiques. »
                  </p>
                </div>
              </div>

              {/* Fiche technique */}
              <div className="mt-5 rounded-xl bg-secondary/50 p-4 text-xs space-y-1.5">
                <p>
                  <strong>🎙️ Enregistrement voix :</strong> Voix posée, confiante et raffinée
                  (idéalement féminine ou masculine chaleureuse).
                </p>
                <p>
                  <strong>📹 Réutilisation V9 :</strong> Vous pouvez reprendre la vidéo existante
                  située dans le dossier `video siteweb` et poser cette voix-off dessus avec une
                  musique festive !
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 4 : STRATÉGIE CADEAUX & LOGISTIQUE FÊTES 2026          */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "guide" && (
        <section
          aria-label="Stratégie commerciale des Fêtes"
          className="mx-auto my-10 w-full max-w-[1320px] px-4 lg:px-8"
        >
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6420]">
              Plan d'Action Commercial
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
              Guide Stratégique pour Maximiser les Ventes des Fêtes
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Voici les 4 leviers concrets à activer pour faire de ce mois de décembre le meilleur
              mois de l'année pour Al Kareem.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <span className="text-3xl">🎁</span>
              <h3 className="mt-3 font-serif text-lg font-semibold text-[#241034]">
                1. L'Emballage Cadeau Gratuit
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                À Cotonou, la corvée de faire emballer un cadeau fait perdre des ventes. En offrant
                une pochette rigide luxe et un ruban satiné or sur chaque commande, le client gagne
                du temps et n'hésite plus à acheter chez vous.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <span className="text-3xl">📦</span>
              <h3 className="mt-3 font-serif text-lg font-semibold text-[#241034]">
                2. Les Packs « Duo Gagnant »
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Proposer un parfum + son déodorant ou brume assortie avec une réduction de 2 000
                FCFA augmente le panier moyen de 40%. Présentez-les comme le « Pack Clé-en-main ».
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <span className="text-3xl">⚡</span>
              <h3 className="mt-3 font-serif text-lg font-semibold text-[#241034]">
                3. Garantie 24 Déc. & 31 Déc.
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Mobiliser 2 livreurs dédiés les 23, 24, 30 et 31 décembre et communiquer sur le
                slogan : « Commandé à midi, sous votre sapin à 16h ». L'urgence est le premier
                déclencheur d'achat de fin d'année.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <span className="text-3xl">📲</span>
              <h3 className="mt-3 font-serif text-lg font-semibold text-[#241034]">
                4. Statuts WhatsApp Quotidien
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Publier 3 à 5 statuts par jour : 1 parfum du jour, 1 coffret avec son prix, 1
                témoignage client satisfait, et un rappel du lien vers la sélection fêtes du site
                web.
              </p>
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
