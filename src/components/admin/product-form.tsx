import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical, Trash2, ImagePlus, Loader2, ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, slugify } from "@/lib/catalog";
import { uploadProductImage } from "@/lib/image-upload";

export interface ProductFormValues {
  name: string;
  category_id: string | null;
  price_fcfa: number;
  promo_price_fcfa: number | null;
  promo_end_date: string | null;
  description: string;
  volume: string;
  in_stock: boolean;
  image_urls: string[];
}

export function emptyProduct(): ProductFormValues {
  return {
    name: "",
    category_id: null,
    price_fcfa: 0,
    promo_price_fcfa: null,
    promo_end_date: null,
    description: "",
    volume: "",
    in_stock: true,
    image_urls: [],
  };
}

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial: ProductFormValues;
  onDelete?: () => void;
}

export function ProductForm({ mode, productId, initial, onDelete }: Props) {
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!values.name.trim()) throw new Error("Le nom est requis.");
      if (values.price_fcfa <= 0) throw new Error("Le prix doit être supérieur à 0.");

      const payload = {
        name: values.name.trim(),
        slug:
          slugify(values.name) +
          (mode === "create" ? "-" + Math.random().toString(36).slice(2, 6) : ""),
        category_id: values.category_id,
        price_fcfa: Math.round(values.price_fcfa),
        promo_price_fcfa:
          values.promo_price_fcfa != null ? Math.round(values.promo_price_fcfa) : null,
        promo_end_date: values.promo_end_date || null,
        description: values.description,
        volume: values.volume.trim() || null,
        in_stock: values.in_stock,
        image_urls: values.image_urls,
      };

      if (mode === "create") {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      } else {
        // Preserve existing slug on edit
        const { slug: _s, ...rest } = payload;
        const { error } = await supabase.from("products").update(rest).eq("id", productId!);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["product"] });
      await qc.invalidateQueries({ queryKey: ["admin-product"] });
      toast.success(mode === "create" ? "Produit ajouté ✨" : "Modifications enregistrées ✨");
      navigate({ to: "/admin" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const url = await uploadProductImage(f);
        urls.push(url);
      }
      setValues((v) => ({ ...v, image_urls: [...v.image_urls, ...urls] }));
      toast.success(`${urls.length} photo(s) ajoutée(s). Cliquez sur "Enregistrer" en bas pour valider.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi de la photo échoué");
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (from: number, to: number) => {
    setValues((v) => {
      const arr = v.image_urls.slice();
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...v, image_urls: arr };
    });
  };

  const removeImage = (idx: number) => {
    setValues((v) => ({ ...v, image_urls: v.image_urls.filter((_, i) => i !== idx) }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/admin" })}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      </div>

      <h1 className="font-serif text-2xl text-gray-900">
        {mode === "create" ? "Nouveau produit" : "Modifier le produit"}
      </h1>

      {/* IMAGES */}
      <section className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="text-sm font-medium mb-3">Photos du produit</div>
        {values.image_urls.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {values.image_urls.map((url, i) => (
              <li
                key={url}
                className="relative group border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
              >
                <img src={url} alt="" className="w-full aspect-square object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Photo principale
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveImage(i, i - 1)}
                      className="h-7 w-7 grid place-items-center rounded hover:bg-white/10 disabled:opacity-30"
                      title="Reculer"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      disabled={i === values.image_urls.length - 1}
                      onClick={() => moveImage(i, i + 1)}
                      className="h-7 w-7 grid place-items-center rounded hover:bg-white/10 disabled:opacity-30"
                      title="Avancer"
                    >
                      ›
                    </button>
                    <GripVertical className="h-3 w-3 opacity-60" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="h-7 w-7 grid place-items-center rounded hover:bg-red-500/70"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-gray-500 text-gray-600">
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" /> Envoi en cours…
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm font-medium">Ajouter des photos</span>
              <span className="text-xs text-gray-500">
                Depuis la galerie de votre téléphone ou votre ordinateur
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </section>

      {/* CORE */}
      <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        <Field label="Nom du produit *">
          <input
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            className={INPUT}
            placeholder="ex : Rose Éternelle"
          />
        </Field>

        <Field label="Catégorie">
          <select
            value={values.category_id ?? ""}
            onChange={(e) => setValues({ ...values, category_id: e.target.value || null })}
            className={INPUT}
          >
            <option value="">— Aucune —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">
            Besoin d'une nouvelle catégorie ? Rendez-vous dans l'onglet <b>Catégories</b>.
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prix (FCFA) *">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              required
              value={values.price_fcfa || ""}
              onChange={(e) => setValues({ ...values, price_fcfa: Number(e.target.value) })}
              className={INPUT}
            />
          </Field>
          <Field label="Contenance">
            <input
              value={values.volume}
              onChange={(e) => setValues({ ...values, volume: e.target.value })}
              placeholder="ex : 50 ml"
              className={INPUT}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prix promo (optionnel)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={values.promo_price_fcfa ?? ""}
              onChange={(e) =>
                setValues({
                  ...values,
                  promo_price_fcfa: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={INPUT}
            />
          </Field>
          <Field label="Fin de la promo (optionnel)">
            <input
              type="date"
              value={values.promo_end_date ?? ""}
              onChange={(e) => setValues({ ...values, promo_end_date: e.target.value || null })}
              className={INPUT}
            />
          </Field>
        </div>

        <Field label="Description courte">
          <textarea
            rows={4}
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            placeholder="Quelques lignes pour décrire le produit…"
            className={INPUT + " min-h-[110px] py-2"}
          />
        </Field>

        <label className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 p-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium">Produit en stock</div>
            <div className="text-xs text-gray-500">Désactivez si le produit est en rupture</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values.in_stock}
            onClick={() => setValues({ ...values, in_stock: !values.in_stock })}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${values.in_stock ? "bg-emerald-500" : "bg-gray-300"}`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${values.in_stock ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </label>
      </section>

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent">
        <button
          type="submit"
          disabled={save.isPending}
          className="w-full h-14 rounded-xl bg-gray-900 text-white text-base font-medium hover:bg-black inline-flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {save.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-2 w-full h-12 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 inline-flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> Supprimer ce produit
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const INPUT =
  "w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
