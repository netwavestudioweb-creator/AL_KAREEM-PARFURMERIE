import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, Loader2, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, getOptimizedImageUrl, slugify } from "@/lib/catalog";
import { formatFCFA } from "@/lib/currency";
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

const QUICK_VOLUMES = ["30 ml", "50 ml", "100 ml", "200 ml"];

export function ProductForm({ mode, productId, initial, onDelete }: Props) {
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [promoOn, setPromoOn] = useState(initial.promo_price_fcfa != null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      if (!values.name.trim()) throw new Error("Le nom est requis.");
      if (values.price_fcfa <= 0) throw new Error("Le prix doit être supérieur à 0.");
      if (promoOn) {
        if (!values.promo_price_fcfa || values.promo_price_fcfa <= 0)
          throw new Error("Indiquez le prix promo, ou désactivez la promotion.");
        if (values.promo_price_fcfa >= values.price_fcfa)
          throw new Error("Le prix promo doit être inférieur au prix normal.");
      }

      const payload = {
        name: values.name.trim(),
        slug:
          slugify(values.name) +
          (mode === "create" ? "-" + Math.random().toString(36).slice(2, 6) : ""),
        category_id: values.category_id,
        price_fcfa: Math.round(values.price_fcfa),
        promo_price_fcfa:
          promoOn && values.promo_price_fcfa != null ? Math.round(values.promo_price_fcfa) : null,
        promo_end_date: promoOn ? values.promo_end_date || null : null,
        description: values.description,
        volume: values.volume.trim() || null,
        in_stock: values.in_stock,
        image_urls: values.image_urls,
      };

      if (mode === "create") {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      } else {
        // L'adresse de la page (slug) est conservée lors d'une modification.
        const { slug: _s, ...rest } = payload;
        const { error } = await supabase.from("products").update(rest).eq("id", productId!);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["product"] });
      await qc.invalidateQueries({ queryKey: ["admin-product"] });
      toast.success(mode === "create" ? "Parfum publié." : "Modifications enregistrées.");
      navigate({ to: "/admin" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadProductImage(f));
      setValues((v) => ({ ...v, image_urls: [...v.image_urls, ...urls] }));
      toast.success(`${urls.length} photo(s) ajoutée(s). Pensez à enregistrer.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi de la photo échoué");
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (from: number, to: number) =>
    setValues((v) => {
      const arr = v.image_urls.slice();
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...v, image_urls: arr };
    });

  const removeImage = (idx: number) =>
    setValues((v) => ({ ...v, image_urls: v.image_urls.filter((_, i) => i !== idx) }));

  const slugPreview = slugify(values.name || "nom-du-parfum");
  const categoryName = categories.find((c) => c.id === values.category_id)?.name ?? "";
  const previewPrice =
    promoOn && values.promo_price_fcfa && values.promo_price_fcfa < values.price_fcfa
      ? values.promo_price_fcfa
      : values.price_fcfa;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="flex flex-col gap-4 pb-24 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-6"
    >
      <div className="flex items-center justify-between lg:col-span-2">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Mes produits
        </Link>
        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        )}
      </div>
      <h1 className="font-serif text-[28px] font-medium text-primary-deep lg:col-span-2 lg:text-4xl">
        {mode === "create" ? "Nouveau parfum" : "Modifier le parfum"}
      </h1>

      <div className="flex flex-col gap-4">
        {/* Photos */}
        <Group title="Photos">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {values.image_urls.map((url, i) => (
              <div
                key={url}
                className={`relative aspect-square overflow-hidden rounded-xl ${i === 0 ? "border-2 border-primary" : "border border-border"}`}
              >
                <img
                  src={getOptimizedImageUrl(url, 240, 240, 70)}
                  alt={i === 0 ? "Photo principale" : `Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary-deep px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Principale
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label={`Retirer la photo ${i + 1}`}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#2A1838]/75 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {values.image_urls.length > 1 && (
                  <div className="absolute bottom-1 right-1 flex gap-0.5">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        aria-label="Déplacer avant"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-foreground"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {i < values.image_urls.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        aria-label="Déplacer après"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-foreground"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#CFC6BA] bg-background p-2 text-center text-xs font-semibold text-primary">
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" /> Envoi…
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6" /> Prendre / choisir
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                className="sr-only"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            La 1ʳᵉ photo est la photo principale ; utilisez les flèches pour changer l'ordre. Les
            photos sont compressées automatiquement avant l'envoi.
          </p>
        </Group>

        {/* Informations */}
        <Group title="Informations">
          <Field label="Nom du parfum *">
            <input
              required
              maxLength={120}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ex : Mahab by Nusuk"
              className={INPUT}
            />
            {mode === "create" && (
              <span className="text-[11.5px] font-normal text-muted-foreground">
                Adresse de la page : /parfum/{slugPreview}-…
              </span>
            )}
          </Field>
          <Field label="Catégorie">
            <select
              value={values.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value || null)}
              className={INPUT}
            >
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-2.5">
            <Field label="Prix *">
              <span className="relative block">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  required
                  value={values.price_fcfa || ""}
                  onChange={(e) => set("price_fcfa", Number(e.target.value))}
                  className={`${INPUT} pr-16`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-medium text-muted-foreground">
                  F CFA
                </span>
              </span>
            </Field>
            <Field label="Contenance">
              <input
                maxLength={30}
                value={values.volume}
                onChange={(e) => set("volume", e.target.value)}
                placeholder="ex : 100 ml"
                className={INPUT}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Rapide :</span>
            {QUICK_VOLUMES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("volume", v)}
                className={`rounded-full px-3 py-1.5 text-[12.5px] ${values.volume === v ? "border border-primary bg-accent font-semibold text-primary-deep" : "border border-input"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Field label="Description">
            <textarea
              rows={4}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Quelques lignes : ambiance, notes principales, pour qui, occasion…"
              className={`${INPUT} h-auto min-h-[110px] py-3 leading-relaxed`}
            />
            <span className="self-end text-[11.5px] font-normal text-muted-foreground">
              {values.description.length} caractères
            </span>
          </Field>
        </Group>

        {/* Promotion */}
        <Group title="Promotion">
          <Switch
            label="Mettre ce parfum en promo"
            checked={promoOn}
            onChange={(on) => {
              setPromoOn(on);
              if (!on) setValues((v) => ({ ...v, promo_price_fcfa: null, promo_end_date: null }));
            }}
          />
          {promoOn && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Prix promo">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={values.promo_price_fcfa ?? ""}
                    onChange={(e) =>
                      set("promo_price_fcfa", e.target.value ? Number(e.target.value) : null)
                    }
                    className={INPUT}
                  />
                </Field>
                <Field label="Jusqu'au">
                  <input
                    type="date"
                    value={values.promo_end_date ?? ""}
                    onChange={(e) => set("promo_end_date", e.target.value || null)}
                    className={INPUT}
                  />
                </Field>
              </div>
              <p className="text-xs text-muted-foreground">
                La promo s'arrête toute seule à la date choisie (laisser vide = sans fin).
              </p>
            </>
          )}
        </Group>

        {/* Stock */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <Switch
            label="En stock"
            hint="Désactivez si le flacon est épuisé : il reste visible mais ne peut plus être commandé."
            checked={values.in_stock}
            onChange={(on) => set("in_stock", on)}
            tone="green"
          />
        </div>
      </div>

      {/* Aperçu */}
      <aside className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#CFC6BA] bg-background p-4 lg:sticky lg:top-6">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Aperçu sur le site
        </span>
        <article className="flex w-[170px] flex-col lg:w-full">
          <span className="relative block aspect-square overflow-hidden rounded-xl bg-secondary">
            {values.image_urls[0] ? (
              <img
                src={getOptimizedImageUrl(values.image_urls[0], 400, 400, 75)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center font-serif text-lg text-primary/60">
                Al Kareem
              </span>
            )}
            {!values.in_stock && (
              <span className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-semibold text-background">
                Épuisé
              </span>
            )}
          </span>
          <span className="mt-2 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {[categoryName, values.volume].filter(Boolean).join(" · ") || "Catégorie · contenance"}
          </span>
          <span className="mt-0.5 font-serif text-[17px] leading-tight">
            {values.name || "Nom du parfum"}
          </span>
          <span className="mt-1.5 text-sm font-semibold">
            {previewPrice > 0 ? formatFCFA(previewPrice) : "Prix"}
            {previewPrice !== values.price_fcfa && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">
                {formatFCFA(values.price_fcfa)}
              </span>
            )}
          </span>
        </article>
      </aside>

      {/* Barre d'enregistrement collante */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-20 flex gap-2.5 border-t border-border bg-card px-4 py-3 shadow-[0_-8px_24px_rgba(42,24,56,0.08)] lg:bottom-0 lg:left-[260px]">
        <Link
          to="/admin"
          className="flex h-[52px] items-center rounded-full border border-input px-5 text-[14.5px] font-semibold"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={save.isPending || uploading}
          className="h-[52px] flex-1 rounded-full bg-primary-deep text-[15px] font-semibold text-primary-foreground hover:bg-primary disabled:opacity-60 lg:max-w-xs"
        >
          {save.isPending
            ? "Enregistrement…"
            : mode === "create"
              ? "Publier le parfum"
              : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-4">
      <legend className="px-1.5 text-xs font-semibold uppercase tracking-[0.14em]">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold">
      {label}
      {children}
    </label>
  );
}

function Switch({
  label,
  hint,
  checked,
  onChange,
  tone = "violet",
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tone?: "violet" | "green";
}) {
  const on = tone === "green" ? "bg-whatsapp" : "bg-primary";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span
        className={`relative block h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? on : "bg-[#CFC6BA]"}`}
      >
        <span
          className={`absolute top-[3px] block h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${checked ? "left-[23px]" : "left-[3px]"}`}
        />
      </span>
    </button>
  );
}

const INPUT =
  "h-[50px] w-full rounded-xl border border-input bg-card px-3.5 text-base font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
