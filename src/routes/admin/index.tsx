import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchProducts, fetchCategories, formatFCFA } from "@/lib/products";
import { Plus, Search, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminProductsList,
});

function AdminProductsList() {
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const filtered = useMemo(() => {
    let out = products;
    if (cat) out = out.filter((p) => p.categorySlug === cat);
    if (q) {
      const s = q.toLowerCase();
      out = out.filter((p) => p.name.toLowerCase().includes(s));
    }
    return out;
  }, [products, q, cat]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="font-serif text-2xl text-gray-900">Mes produits</h1>
        <Link
          to="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-5 py-3 text-sm font-medium hover:bg-black shadow-sm"
        >
          <Plus className="h-4 w-4" /> Ajouter un produit
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full h-11 rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-gray-900"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-900"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-500">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
          <div className="text-gray-600 mb-4">Aucun produit pour le moment.</div>
          <Link
            to="/admin/produits/nouveau"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-5 py-3 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Ajouter mon premier produit
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                to="/admin/produits/$id"
                params={{ id: p.id }}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-3 hover:border-gray-400 transition-colors"
              >
                <img
                  src={p.image}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {p.category || "Sans catégorie"}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-900">{formatFCFA(p.price)}</span>
                    {p.oldPrice && <span className="text-xs text-gray-400 line-through">{formatFCFA(p.oldPrice)}</span>}
                    <span
                      className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        p.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.inStock ? "En stock" : "Rupture"}
                    </span>
                  </div>
                </div>
                <Pencil className="h-4 w-4 text-gray-400 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
