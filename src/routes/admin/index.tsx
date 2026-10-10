import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, formatFCFA, type Product } from "@/lib/products";
import { useAdminCounts } from "@/lib/admin-counts";

export const Route = createFileRoute("/admin/")({
  component: AdminProductsList,
});

type Filter = "tous" | "stock" | "epuises" | "promo" | "sans-photo";

const FILTERS: { id: Filter; label: string; test: (p: Product) => boolean }[] = [
  { id: "tous", label: "Tous", test: () => true },
  { id: "stock", label: "En stock", test: (p) => p.inStock },
  { id: "epuises", label: "Épuisés", test: (p) => !p.inStock },
  { id: "promo", label: "En promo", test: (p) => p.promo },
  {
    id: "sans-photo",
    label: "Sans photo",
    test: (p) => !p.rawImage || p.rawImage.startsWith("data:"),
  },
];

function greeting() {
  const h = new Date().getHours();
  return h < 18 ? "Bonjour" : "Bonsoir";
}

function AdminProductsList() {
  const qc = useQueryClient();
  const counts = useAdminCounts();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("tous");

  const filtered = useMemo(() => {
    const test = FILTERS.find((f) => f.id === filter)!.test;
    const needle = q.trim().toLowerCase();
    return products.filter((p) => test(p) && (!needle || p.name.toLowerCase().includes(needle)));
  }, [products, q, filter]);

  const soldOut = products.filter((p) => !p.inStock).length;
  const noPhoto = products.filter(FILTERS[4].test).length;

  const toggleStock = useMutation({
    mutationFn: async (p: Product) => {
      const { error } = await supabase
        .from("products")
        .update({ in_stock: !p.inStock })
        .eq("id", p.id);
      if (error) throw error;
      return !p.inStock;
    },
    onSuccess: async (inStock, p) => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["product"] });
      toast.success(`${p.name} : ${inStock ? "remis en stock" : "marqué épuisé"}.`);
    },
    onError: () => toast.error("Mise à jour impossible. Vérifiez votre connexion."),
  });

  const kpi = "flex flex-col gap-1 rounded-[14px] p-3.5 lg:p-5";

  return (
    <div>
      {/* Tableau de bord */}
      <section className="-mx-4 -mt-5 mb-5 bg-[#2A1838] px-4 pb-5 pt-4 text-white lg:mx-0 lg:mt-0 lg:rounded-2xl lg:p-6">
        <h1 className="font-serif text-2xl lg:text-3xl">{greeting()}</h1>
        <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
          <Link to="/admin/commandes" className={`${kpi} bg-gold text-[#2A1838]`}>
            <span className="text-[26px] font-semibold leading-none">{counts.orders}</span>
            <span className="text-[12.5px] font-semibold">Commandes à traiter</span>
          </Link>
          <Link to="/admin/messages" className={`${kpi} bg-white/10`}>
            <span className="text-[26px] font-semibold leading-none">{counts.messages}</span>
            <span className="text-[12.5px]">Messages non lus</span>
          </Link>
          <span className={`${kpi} bg-white/10`}>
            <span className="text-[26px] font-semibold leading-none">{products.length}</span>
            <span className="text-[12.5px]">Produits en ligne</span>
          </span>
          <button
            type="button"
            onClick={() => setFilter("epuises")}
            className={`${kpi} bg-white/10 text-left`}
          >
            <span className="text-[26px] font-semibold leading-none">{soldOut}</span>
            <span className="text-[12.5px]">Épuisés</span>
          </button>
        </div>
      </section>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-[28px] font-medium text-primary-deep lg:text-4xl">
            Mes produits
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {products.length} produits · {soldOut} épuisés · {noPhoto} sans photo
          </p>
        </div>
        <Link
          to="/admin/produits/nouveau"
          className="hidden h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep lg:inline-flex"
        >
          <Plus className="h-4 w-4" /> Ajouter un parfum
        </Link>
      </div>

      <label className="relative block">
        <span className="sr-only">Rechercher un produit</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un parfum…"
          className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-base outline-none focus:border-primary"
        />
      </label>
      <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] ${filter === f.id ? "bg-primary-deep font-semibold text-primary-foreground" : "border border-input bg-card"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Aucun produit dans cette vue.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-border bg-card p-2.5 lg:grid-cols-[56px_minmax(0,2fr)_minmax(0,1fr)_120px_auto] lg:px-4"
            >
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="h-16 w-16 rounded-[10px] bg-secondary object-cover lg:h-14 lg:w-14"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[14.5px] font-semibold">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground lg:hidden">
                  {p.category || "Sans catégorie"}
                  {p.volume ? ` · ${p.volume}` : ""}
                </span>
                <span className="text-[13.5px] font-semibold text-primary-deep lg:hidden">
                  {formatFCFA(p.price)}
                  {p.oldPrice && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">
                      {formatFCFA(p.oldPrice)}
                    </span>
                  )}
                </span>
                <span className="hidden text-xs text-muted-foreground lg:block">{p.volume}</span>
              </span>
              <span className="hidden text-sm text-foreground/75 lg:block">
                {p.category || "—"}
              </span>
              <span className="hidden text-sm font-semibold lg:block">{formatFCFA(p.price)}</span>
              <span className="flex flex-col items-end gap-2 lg:flex-row lg:items-center lg:gap-5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={p.inStock}
                  aria-label={`${p.name} en stock`}
                  disabled={toggleStock.isPending && toggleStock.variables?.id === p.id}
                  onClick={() => toggleStock.mutate(p)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold ${p.inStock ? "text-[oklch(0.45_0.12_150)]" : "text-muted-foreground"}`}
                >
                  {p.inStock ? "En stock" : "Épuisé"}
                  <span
                    className={`relative block h-6 w-10 rounded-full transition-colors ${p.inStock ? "bg-whatsapp" : "bg-[#CFC6BA]"}`}
                  >
                    <span
                      className={`absolute top-[3px] block h-[18px] w-[18px] rounded-full bg-white transition-all ${p.inStock ? "left-[19px]" : "left-[3px]"}`}
                    />
                  </span>
                </button>
                <Link
                  to="/admin/produits/$id"
                  params={{ id: p.id }}
                  className="text-[12.5px] font-semibold text-primary-deep hover:text-primary lg:text-[13.5px]"
                >
                  Modifier
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Bouton d'ajout flottant (mobile) */}
      <Link
        to="/admin/produits/nouveau"
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(63,26,94,0.35)] lg:hidden"
      >
        <Plus className="h-5 w-5" /> Ajouter un parfum
      </Link>
    </div>
  );
}
