import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import {
  Sparkles,
  PartyPopper,
  Flame,
  Moon,
  Wine,
  Play,
  Eye,
  Sliders,
  Palette,
  Star,
  Crown,
  Check,
  Volume2,
  Clock,
  ArrowRight,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/fetes")({
  head: () => ({
    meta: [
      { title: "Ambiance Féerique & Nuits de Fêtes — Al Kareem Parfumerie" },
      {
        name: "description",
        content:
          "Plongez dans l'ambiance féerique de Noël et du Réveillon avec Al Kareem Parfumerie : lumières dorées, sillages de gala et élégance festive.",
      },
    ],
  }),
  component: FetesAtmospherePage,
});

type TabView = "vitrine" | "affiche" | "video" | "elements";

export function FetesAtmospherePage() {
  const [activeTab, setActiveTab] = useState<TabView>("vitrine");

  // Commandes interactives d'ambiance pour l'utilisateur
  const [showSparkles, setShowSparkles] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [showSnowflakes, setShowSnowflakes] = useState(true);
  const [ambientScent, setAmbientScent] = useState<"tous" | "ambre" | "oud" | "petillant">("tous");
  const [afficheStyle, setAfficheStyle] = useState<"nuit" | "or">("nuit");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  // Filtres olfactifs pour l'ambiance des fêtes
  const scentsAtmosphere = useMemo(() => {
    if (ambientScent === "ambre") {
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes("amber") ||
          p.name.toLowerCase().includes("ambre") ||
          p.name.toLowerCase().includes("rouge") ||
          p.name.toLowerCase().includes("vanilla") ||
          p.name.toLowerCase().includes("velvet"),
      );
    }
    if (ambientScent === "oud") {
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes("oud") ||
          p.name.toLowerCase().includes("bois") ||
          p.name.toLowerCase().includes("royal") ||
          p.name.toLowerCase().includes("noir") ||
          p.name.toLowerCase().includes("intense"),
      );
    }
    if (ambientScent === "petillant") {
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes("white") ||
          p.name.toLowerCase().includes("cristal") ||
          p.name.toLowerCase().includes("rose") ||
          p.name.toLowerCase().includes("eau") ||
          p.name.toLowerCase().includes("musk"),
      );
    }
    return products.slice(0, 8);
  }, [ambientScent, products]);

  const displayedProducts =
    scentsAtmosphere.length > 0 ? scentsAtmosphere.slice(0, 8) : products.slice(0, 8);

  return (
    <SiteLayout>
      {/* ────────────────────────────────────────────────────────── */}
      {/* CONSOLE DE NAVIGATION & DE TEST DE L'AMBIANCE FESTIVE      */}
      {/* ────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Console d'ambiance festive"
        className="sticky top-[64px] z-40 border-b border-[#E9C46A]/50 bg-[#1A0A26] text-white shadow-xl backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#E9C46A] to-[#FDF0CD] text-[#241034] shadow">
              <PartyPopper className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E9C46A]">
                Esquisse & Démo d'Ambiance de Noël
              </p>
              <p className="text-xs font-medium text-white/90">
                Al Kareem Parfumerie · Célébration & Nuits Précieuses
              </p>
            </div>
          </div>

          {/* Navigation entre les exemples concrets */}
          <nav
            aria-label="Vues de l'ambiance"
            className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-black/40 p-1 text-xs"
          >
            <button
              onClick={() => setActiveTab("vitrine")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-all ${
                activeTab === "vitrine"
                  ? "bg-[#E9C46A] text-[#241034] font-semibold shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              1. Esquisse Site : Ambiance Festive
            </button>
            <button
              onClick={() => setActiveTab("affiche")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-all ${
                activeTab === "affiche"
                  ? "bg-[#E9C46A] text-[#241034] font-semibold shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              2. Esquisse Affiche : Nuit de Réveillon
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-all ${
                activeTab === "video"
                  ? "bg-[#E9C46A] text-[#241034] font-semibold shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              3. Esquisse Vidéo : Storyboard & Spot
            </button>
            <button
              onClick={() => setActiveTab("elements")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-all ${
                activeTab === "elements"
                  ? "bg-[#E9C46A] text-[#241034] font-semibold shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              4. Décomposition des Éléments
            </button>
          </nav>
        </div>

        {/* Contrôleur en direct des effets visuels de fête */}
        <div className="border-t border-white/10 bg-black/30 px-4 py-2 text-[11px] text-white/80">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#E9C46A]">
              <Sliders className="h-3.5 w-3.5" />
              <span className="font-semibold uppercase tracking-wider">
                Testez l'ambiance en direct :
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-100">
                <input
                  type="checkbox"
                  checked={showSparkles}
                  onChange={(e) => setShowSparkles(e.target.checked)}
                  className="rounded border-[#E9C46A] accent-[#E9C46A]"
                />
                <span>✨ Particules dorées scintillantes</span>
              </label>

              <label className="flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-100">
                <input
                  type="checkbox"
                  checked={showGlow}
                  onChange={(e) => setShowGlow(e.target.checked)}
                  className="rounded border-[#E9C46A] accent-[#E9C46A]"
                />
                <span>🕯️ Lueurs chaudes de Réveillon</span>
              </label>

              <label className="flex cursor-pointer items-center gap-1.5 transition-opacity hover:opacity-100">
                <input
                  type="checkbox"
                  checked={showSnowflakes}
                  onChange={(e) => setShowSnowflakes(e.target.checked)}
                  className="rounded border-[#E9C46A] accent-[#E9C46A]"
                />
                <span>❄️ Étoiles & Cristaux festifs</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 1 : ESQUISSE DU SITE EN MODE FÊTE & RÉVEILLON         */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "vitrine" && (
        <div className="relative min-h-screen bg-[#FAF7F2] pb-24 text-[#241034]">
          {/* BANDEAU FESTIF POÉTIQUE (Non commercial, pure ambiance de Noël) */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#1E092F] via-[#3B1457] to-[#1E092F] px-4 py-2.5 text-center text-xs text-white shadow-inner">
            <div className="flex items-center justify-center gap-2 font-light tracking-wide">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#E9C46A]" />
              <p>
                <span className="font-serif italic text-[#E9C46A]">Nuits Précieuses :</span> Que la
                magie de Noël et l'éclat du Réveillon illuminent vos plus beaux moments avec Al
                Kareem.
              </p>
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#E9C46A]" />
            </div>
          </div>

          {/* HERO SPÉCIAL AMBIANCE DE FÊTE */}
          <section className="relative mx-auto mt-4 w-full max-w-[1320px] px-4 lg:mt-6 lg:px-8">
            <div
              className={`relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#12041D] via-[#240A38] to-[#0A0210] p-8 text-white shadow-2xl transition-all duration-700 lg:p-16 ${
                showGlow ? "shadow-[0_0_50px_rgba(233,196,106,0.2)]" : ""
              }`}
            >
              {/* Effet lueur / bokeh de fête */}
              {showGlow && (
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#E9C46A]/20 blur-3xl animate-pulse"
                  style={{ animationDuration: "4s" }}
                />
              )}
              {showGlow && (
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#6C2599]/25 blur-3xl" />
              )}

              {/* Particules scintillantes dorées */}
              {showSparkles && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(#E9C46A 1.5px, transparent 1.5px), radial-gradient(#F3D89A 1px, transparent 1px)",
                    backgroundSize: "36px 36px, 52px 52px",
                    backgroundPosition: "0 0, 18px 18px",
                  }}
                />
              )}

              {/* Flocons / cristaux dorés subtils flottants */}
              {showSnowflakes && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden text-xs text-[#E9C46A]/30">
                  <span
                    className="absolute left-[10%] top-[15%] text-lg animate-bounce"
                    style={{ animationDuration: "6s" }}
                  >
                    ✦
                  </span>
                  <span
                    className="absolute left-[30%] top-[70%] text-sm animate-pulse"
                    style={{ animationDuration: "3s" }}
                  >
                    ✧
                  </span>
                  <span
                    className="absolute left-[75%] top-[25%] text-base animate-bounce"
                    style={{ animationDuration: "5s" }}
                  >
                    ✦
                  </span>
                  <span
                    className="absolute left-[85%] top-[65%] text-xl animate-pulse"
                    style={{ animationDuration: "4s" }}
                  >
                    ✧
                  </span>
                  <span className="absolute left-[50%] top-[10%] text-sm">✦</span>
                </div>
              )}

              <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Texte d'ambiance */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E9C46A]/40 bg-[#E9C46A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#E9C46A] backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>L'Esprit des Fêtes · Célébration & Lumière</span>
                  </div>

                  <h1 className="font-serif text-4xl font-normal leading-[1.08] text-white lg:text-[64px]">
                    Quand la Magie de Noël <br />
                    s'habille de <span className="italic text-[#E9C46A]">Lumière</span> & de{" "}
                    <span className="italic text-[#E9C46A]">Sillage</span>.
                  </h1>

                  <p className="max-w-xl text-base leading-relaxed text-[#EADAF3]">
                    Pour vos dîners de réveillon, vos grandes soirées de fête et vos instants
                    précieux en famille. Découvrez les fragrances nobles qui capturent la chaleur,
                    l'éclat et l'émotion de cette fin d'année à Cotonou.
                  </p>

                  {/* Accents de fête */}
                  <div className="grid grid-cols-3 gap-3 border-y border-white/15 py-5 text-xs text-[#EADAF3]">
                    <div className="flex items-center gap-2.5">
                      <Flame className="h-4 w-4 text-[#E9C46A]" />
                      <span>Sillages Chaleureux</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Wine className="h-4 w-4 text-[#E9C46A]" />
                      <span>Nuits de Gala</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Moon className="h-4 w-4 text-[#E9C46A]" />
                      <span>Éclat du Réveillon</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <a
                      href="#ambiance-olfactive"
                      className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#E9C46A] to-[#F3D89A] px-8 text-sm font-semibold text-[#241034] shadow-lg transition-transform hover:scale-105"
                    >
                      <Sparkles className="h-4 w-4" />
                      Explorer les Parfums de Réveillon
                    </a>
                    <button
                      onClick={() => setActiveTab("affiche")}
                      className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4 text-[#E9C46A]" />
                      Voir l'Affiche de Soirée
                    </button>
                  </div>
                </div>

                {/* Illustration festive scénarisée */}
                <div className="relative hidden items-center justify-center lg:flex">
                  <div className="relative aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-3xl border border-[#E9C46A]/40 bg-gradient-to-b from-[#250B3B]/80 to-[#12041D]/90 p-8 shadow-2xl backdrop-blur-md">
                    {/* Ruban festif doré stylisé en coin */}
                    <div className="absolute -right-12 -top-12 h-28 w-28 rotate-45 bg-gradient-to-r from-[#E9C46A] to-[#F3D89A] shadow-md flex items-end justify-center pb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#241034]">
                        FÊTE
                      </span>
                    </div>

                    <div className="flex h-full flex-col justify-between text-center">
                      <div className="space-y-2 pt-4">
                        <span className="text-4xl">🕯️✨</span>
                        <h2 className="font-serif text-2xl font-normal text-white">
                          La Nuit du Réveillon
                        </h2>
                        <p className="text-xs text-[#E5D7F0]/80">
                          Une présence inoubliable jusqu'au bout de la nuit
                        </p>
                      </div>

                      {/* Notes olfactives de fête */}
                      <div className="my-auto space-y-2.5 rounded-2xl border border-white/10 bg-black/40 p-5 text-left text-xs">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-[#E5D7F0]">Ambiance</span>
                          <span className="font-serif italic text-[#E9C46A]">
                            Élégante & Festive
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-[#E5D7F0]">Notes Clés</span>
                          <span className="font-medium text-white">Ambre, Oud & Vanille</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-[#E5D7F0]">Sillage</span>
                          <span className="font-medium text-[#E9C46A]">Intense & Majestueux</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#E5D7F0]">Moment</span>
                          <span className="font-medium text-emerald-300">24 & 31 Décembre</span>
                        </div>
                      </div>

                      <p className="font-serif italic text-xs text-[#E9C46A]">
                        « Que votre sillage soit le plus beau souvenir de cette fête. »
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION : LES SILLAGES QUI FONT LA FÊTE (AMBIANCE SENSORIELLE) */}
          {/* ────────────────────────────────────────────────────────── */}
          <section
            id="ambiance-olfactive"
            className="mx-auto mt-16 w-full max-w-[1320px] px-4 lg:px-8"
          >
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A6420]">
                Symphonie des Fêtes
              </span>
              <h2 className="mt-2 font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
                Les Parfums des Nuits de Célébration
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
                Comment la parfumerie raconte Noël et le Nouvel An : par des notes chaleureuses qui
                réchauffent l'atmosphère et des sillages étincelants taillés pour les grandes
                soirées.
              </p>
            </div>

            {/* Sélecteur d'atmosphère olfactive */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { id: "tous", label: "🌟 Toute l'Ambiance de Fête", icon: Sparkles },
                { id: "ambre", label: "🕯️ Les Nuits Ambrées & Chaleureuses", icon: Flame },
                { id: "oud", label: "👑 L'Oud Impérial du Réveillon", icon: Crown },
                { id: "petillant", label: "🥂 L'Éclat Pétillant du Nouvel An", icon: Wine },
              ].map((btn) => {
                const Icon = btn.icon;
                const isSelected = ambientScent === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setAmbientScent(btn.id as any)}
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

            {/* Vitrine des flacons baignés dans l'ambiance */}
            <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-6">
              {isLoading ? (
                <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
                  Illumination de la galerie des fêtes…
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
                  Chargement des fragrances de réveillon…
                </div>
              ) : (
                displayedProducts.map((p) => (
                  <div key={p.id} className="relative group">
                    <span className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-[#1C082A] px-2.5 py-0.5 text-[10px] font-semibold text-[#E9C46A] shadow border border-[#E9C46A]/30">
                      <Sparkles className="h-2.5 w-2.5" />
                      Édition Fêtes
                    </span>
                    <ProductCard product={p} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ────────────────────────────────────────────────────────── */}
          {/* L'EXPÉRIENCE SENSORIELLE DE FIN D'ANNÉE À COTONOU          */}
          {/* ────────────────────────────────────────────────────────── */}
          <section className="mx-auto mt-20 w-full max-w-[1320px] px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E9C46A]/30 bg-white p-7 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                  <Flame className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-medium text-[#241034]">
                  La Chaleur du Dîner de Noël
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Le moment où les proches se réunissent autour d'une table illuminée. Le parfum
                  crée une enveloppe rassurante, gourmande et inoubliable, mariant épices douces et
                  vanille noble.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E9C46A]/30 bg-white p-7 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                  <Moon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-medium text-[#241034]">
                  La Nuit du Réveillon du 31
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  L'énergie des réceptions de Cotonou, les tenues de gala et le compte à rebours
                  vers minuit. Un sillage puissant à base de bois précieux et de muscs intenses pour
                  marquer les esprits.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E9C46A]/30 bg-white p-7 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                  <Wine className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-medium text-[#241034]">
                  L'Éclat du Premier Matin
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Le renouveau du 1er janvier : un parfum d'agrumes vifs, de bergamote fraîche et de
                  fleurs blanches pour entamer la nouvelle année sous le signe de l'élégance et de
                  la sérénité.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 2 : ESQUISSE D'AFFICHE - L'ATMOSPHÈRE DE RÉVEILLON    */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "affiche" && (
        <section
          aria-label="Esquisse de l'affiche festive"
          className="mx-auto my-10 w-full max-w-[1320px] px-4 lg:px-8"
        >
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8A6420]">
              Esquisse Visuelle Publicitaire
            </span>
            <h2 className="mt-1 font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
              L'Affiche Festive : Pure Ambiance de Réveillon
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Voici exactement à quoi ressemble une affiche qui respire la fête sans être agressive
              : un hommage à la nuit, aux bougies, à la lumière et à l'élégance de la fin d'année.
            </p>

            {/* Sélecteur de style d'affiche */}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setAfficheStyle("nuit")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  afficheStyle === "nuit"
                    ? "bg-[#241034] text-white shadow"
                    : "border border-border bg-white text-[#241034]"
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-[#E9C46A]" />
                Variante 1 : Nuit Étoilée & Bougies
              </button>
              <button
                onClick={() => setAfficheStyle("or")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  afficheStyle === "or"
                    ? "bg-[#241034] text-white shadow"
                    : "border border-border bg-white text-[#241034]"
                }`}
              >
                <Wine className="h-3.5 w-3.5 text-[#E9C46A]" />
                Variante 2 : Gala Or & Champagne
              </button>
            </div>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            {/* ───────────── LE RENDU GRAPHIQUE DE L'AFFICHE (ESQUISSE) ───────────── */}
            <div className="mx-auto w-full max-w-[460px]">
              <div
                className={`relative aspect-[4/5] overflow-hidden rounded-3xl border-2 shadow-2xl p-8 flex flex-col justify-between text-white transition-all duration-500 ${
                  afficheStyle === "nuit"
                    ? "border-[#E9C46A]/60 bg-gradient-to-b from-[#0A0210] via-[#210935] to-[#0A0210]"
                    : "border-[#E9C46A] bg-gradient-to-b from-[#1C0D02] via-[#38164A] to-[#140520]"
                }`}
              >
                {/* Bokeh de lumières de fête en arrière plan */}
                <div className="pointer-events-none absolute -right-10 top-10 h-48 w-48 rounded-full bg-[#E9C46A]/20 blur-2xl" />
                <div className="pointer-events-none absolute -left-10 bottom-20 h-48 w-48 rounded-full bg-[#E9C46A]/15 blur-2xl" />
                <div className="pointer-events-none absolute right-10 bottom-10 h-32 w-32 rounded-full bg-purple-500/20 blur-xl" />

                {/* Étoiles scintillantes */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: "radial-gradient(#E9C46A 1.5px, transparent 1.5px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* En-tête de l'affiche */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E9C46A]">
                      Al Kareem Parfumerie
                    </p>
                    <p className="font-serif italic text-xs text-[#E5D7F0]">
                      Haute Fragrance · Cotonou
                    </p>
                  </div>
                  <span className="rounded-full border border-[#E9C46A]/40 bg-[#E9C46A]/15 px-3 py-1 font-serif text-[10px] text-[#E9C46A]">
                    Édition Fêtes 2026
                  </span>
                </div>

                {/* Cœur visuel de l'affiche : La mise en scène du flacon sous les lumières */}
                <div className="relative z-10 my-auto text-center space-y-4 py-6">
                  <div className="inline-block relative">
                    {/* Halo lumineux derrière le flacon */}
                    <div className="absolute inset-0 rounded-full bg-[#E9C46A]/30 blur-xl animate-pulse" />
                    <div className="relative rounded-2xl border border-[#E9C46A]/40 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
                      <span className="text-5xl drop-shadow-[0_0_20px_rgba(233,196,106,0.6)]">
                        ✨🍾✨
                      </span>
                      <p className="mt-3 font-serif text-xl font-normal text-white">
                        L'Éclat d'une Nuit Inoubliable
                      </p>
                      <p className="text-[11px] text-[#E5D7F0]">
                        Quand le réveillon s'habille de votre plus beau sillage
                      </p>
                    </div>
                  </div>

                  <h3 className="font-serif text-3xl font-light leading-tight text-white lg:text-4xl">
                    Brillez au <span className="italic text-[#E9C46A]">Réveillon</span>.
                  </h3>
                </div>

                {/* Bas de l'affiche */}
                <div className="relative z-10 border-t border-white/15 pt-4 text-center">
                  <p className="font-serif italic text-xs text-[#E5D7F0]">
                    « La plus belle tenue commence par la signature que vous laissez derrière vous.
                    »
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-[#E9C46A]">
                    <span>Boutique Cotonou & Calavi</span>
                    <span className="font-semibold tracking-wider">
                      www.al-kareemparfurmerie.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ───────────── ANALYSE DES ÉLÉMENTS DE CETTE AFFICHE ───────────── */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#E9C46A]/40 bg-white p-7 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                    <Palette className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#241034]">
                      Pourquoi cette affiche respire « La Fête » ?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Analyse des choix artistiques par rapport à une pub classique
                    </p>
                  </div>
                </div>

                <ul className="mt-5 space-y-3.5 text-xs text-foreground/90">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <strong className="text-[#241034]">
                        Les halos de lumière dorée (Bokeh) :
                      </strong>{" "}
                      Ils évoquent immédiatement les guirlandes, les bougies de Noël et l'éclairage
                      tamisé des dîners de gala.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <strong className="text-[#241034]">Le contraste Velours Noir & Or :</strong>{" "}
                      C'est le code universel du luxe de fin d'année, inspiré des nuits de gala et
                      des réveillons prestigieux.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <strong className="text-[#241034]">L'émotion plutôt que le prix :</strong>{" "}
                      Aucun prix barré ni slogan agressif. Le spectateur s'imagine déjà élégant,
                      souriant et parfumé le soir du 31 décembre.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Exemple de texte d'accompagnement pour les réseaux sociaux */}
              <div className="rounded-2xl border border-border bg-[#FAF7F2] p-6">
                <h4 className="font-serif text-base font-semibold text-[#241034]">
                  📱 Texte de publication (Instagram / Statut WhatsApp) :
                </h4>
                <div className="mt-3 rounded-xl bg-white p-4 font-mono text-xs text-foreground shadow-sm">
                  « La nuit du réveillon n'arrive qu'une fois par an. ✨ <br />
                  <br />
                  Chaque détail compte : votre tenue, votre sourire, et ce sillage mystérieux qui
                  flotte dans l'air quand vous entrez dans la pièce. <br />
                  <br />
                  Célébrez la magie des fêtes avec les fragrances d'exception Al Kareem. <br />
                  <br />
                  📍 Cotonou & Calavi · Lien en bio pour explorer la collection. <br />
                  #AlKareem #MagieDeNoel #Reveillon2026 #Cotonou #ParfumerieLuxe »
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 3 : ESQUISSE VIDÉO - LE SPOT D'AMBIANCE DE FÊTE        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "video" && (
        <section
          aria-label="Esquisse de la vidéo publicitaire"
          className="mx-auto my-10 w-full max-w-[1320px] px-4 lg:px-8"
        >
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8A6420]">
              Esquisse Vidéo Publicitaire
            </span>
            <h2 className="mt-1 font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
              Le Spot Vidéo : L'Émotion des Préparatifs de Réveillon
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Découvrez la vidéo d'ambiance et son découpage scène par scène : comment plonger le
              spectateur dans la féerie d'une soirée inoubliable.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* LECTEUR VIDÉO INTERACTIF */}
            <div className="flex flex-col rounded-3xl border border-[#E9C46A]/40 bg-[#1A0A26] p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E9C46A] text-[#241034]">
                    <Play className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-white">
                      Extrait Vidéo : « L'Éclat de la Fête »
                    </h3>
                    <p className="text-xs text-[#E5D7F0]">
                      Projet publicitaire Al Kareem (Prêt à visionner)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#E9C46A]/20 px-3 py-1 text-[11px] font-semibold text-[#E9C46A]">
                  40 secondes
                </span>
              </div>

              {/* Le lecteur HTML5 branché sur le fichier vidéo */}
              <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-inner">
                <video
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                  poster="/alkareem-logo.webp"
                >
                  <source src="/video-fetes.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de cette vidéo.
                </video>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[#E5D7F0]">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-[#E9C46A]" />
                  <span>Bande-son : Mélodie de gala chaleureuse & violons feutrés</span>
                </div>
                <span className="italic text-[#E9C46A]">Al Kareem 2026</span>
              </div>
            </div>

            {/* LE STORYBOARD SCÈNE PAR SCÈNE */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-medium text-[#241034]">
                Le Storyboard d'Ambiance de Noël
              </h3>
              <p className="text-xs text-muted-foreground">
                Ce spot ne vend pas un objet : il vend le moment magique où l'on s'apprête à faire
                la fête.
              </p>

              {/* Scène 1 */}
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2 text-xs">
                  <span className="font-bold text-[#241034]">
                    Scène 1 : L'Illumination de la Nuit (0s - 10s)
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px]">Plan Large</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <strong>Visuel :</strong> Les lumières festives scintillent à travers la vitre. En
                  arrière-plan, l'ambiance chaleureuse d'un réveillon qui se prépare.
                  <br />
                  <strong>Voix-off :</strong>{" "}
                  <em>« Il y a des nuits où chaque seconde a le goût de l'exception… »</em>
                </p>
              </div>

              {/* Scène 2 */}
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2 text-xs">
                  <span className="font-bold text-[#241034]">
                    Scène 2 : Le Rituel du Flacon (10s - 25s)
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px]">
                    Macro Slow-Motion
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <strong>Visuel :</strong> Gros plan sur le flacon Al Kareem qui tourne sous un
                  faisceau doré. La vaporisation se fait au ralenti, créant une brume dorée
                  étincelante.
                  <br />
                  <strong>Voix-off :</strong>{" "}
                  <em>
                    « Quand l'or, l'ambre et le bois noble s'unissent pour sublimer votre allure. »
                  </em>
                </p>
              </div>

              {/* Scène 3 */}
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-2 text-xs">
                  <span className="font-bold text-[#241034]">
                    Scène 3 : L'Entrée dans la Fête (25s - 40s)
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px]">
                    Émotion & Signature
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <strong>Visuel :</strong> L'arrivée dans le salon illuminé, les regards qui se
                  tournent, le sourire complice. Le logo Al Kareem apparaît dans une pluie d'étoiles
                  dorées.
                  <br />
                  <strong>Voix-off :</strong>{" "}
                  <em>
                    « Pour les fêtes, offrez-vous l'inoubliable. Al Kareem Parfumerie, Cotonou. »
                  </em>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VUE 4 : DÉCOMPOSITION COMPLÈTE DES ÉLÉMENTS DE FÊTE        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "elements" && (
        <section
          aria-label="Décomposition des éléments de fête"
          className="mx-auto my-10 w-full max-w-[1320px] px-4 lg:px-8"
        >
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8A6420]">
              Guide & Architecture
            </span>
            <h2 className="mt-1 font-serif text-3xl font-medium text-[#241034] lg:text-4xl">
              En quoi consiste « L'Ambiance de Fête » pour Al Kareem ?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Voici la division méthodique des 4 piliers indispensables qui transforment
              l'expérience visuelle sans paraître trop commerciale.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Pilier 1 */}
            <div className="rounded-2xl border border-[#E9C46A]/30 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#241034]">
                    1. La Lumière & La Féerie Visuelle
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ce qui capte immédiatement le regard
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li>
                  • <strong>Particules dorées :</strong> Scintillement subtil rappelant les étoiles
                  et les réveillons.
                </li>
                <li>
                  • <strong>Bokeh & Halos :</strong> Effets de flou lumineux simulant les guirlandes
                  et les bougies.
                </li>
                <li>
                  • <strong>Typographie Serif & Or :</strong> L'alliance du classique Cormorant
                  Garamond avec l'or chaud.
                </li>
              </ul>
            </div>

            {/* Pilier 2 */}
            <div className="rounded-2xl border border-[#E9C46A]/30 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                  <Flame className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#241034]">
                    2. L'Atmosphère Olfactive des Soirées
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    L'évocation des sens et du confort
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li>
                  • <strong>Notes de Réveillon :</strong> Ambre chaud, cannelle douce, vanille
                  bourbon et bois d'oud.
                </li>
                <li>
                  • <strong>Tenue exceptionnelle :</strong> Des fragrances pensées pour durer
                  jusqu'aux premières lueurs de l'aube.
                </li>
                <li>
                  • <strong>Vocabulaire poétique :</strong> On parle de « sillage », de « présence
                  », d'« éclat ».
                </li>
              </ul>
            </div>

            {/* Pilier 3 */}
            <div className="rounded-2xl border border-[#E9C46A]/30 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                  <Wine className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#241034]">
                    3. L'Art de Vivre & La Célébration
                  </h3>
                  <p className="text-xs text-muted-foreground">L'émotion du rassemblement</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li>
                  • <strong>Les préparatifs :</strong> Le plaisir de choisir sa tenue et de se
                  parfumer pour une nuit spéciale.
                </li>
                <li>
                  • <strong>La fête à Cotonou :</strong> Les retrouvailles en famille, les
                  réceptions, la musique et les dîners.
                </li>
                <li>
                  • <strong>L'accueil de la Nouvelle Année :</strong> L'énergie de l'espérance, de
                  la joie et de la beauté.
                </li>
              </ul>
            </div>

            {/* Pilier 4 */}
            <div className="rounded-2xl border border-[#E9C46A]/30 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#241034] text-[#E9C46A]">
                  <Palette className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#241034]">
                    4. La Sobriété Luxueuse (Non Agressif)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    La signature d'une grande maison de parfum
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li>
                  • <strong>Pas de bandeau criard :</strong> Pas de remises en gros caractères
                  rouges qui cassent le prestige.
                </li>
                <li>
                  • <strong>Raffinement des visuels :</strong> Chaque image donne envie de célébrer
                  avec élégance.
                </li>
                <li>
                  • <strong>L'humain au centre :</strong> Le parfum comme sublimateur de votre
                  personnalité lors des fêtes.
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
