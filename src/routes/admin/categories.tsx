import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, fetchProducts, slugify } from "@/lib/catalog";
import { uploadCategoryImage } from "@/lib/image-upload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, ImagePlus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

/** Sélecteur d'image tactile : aperçu, remplacement, suppression. */
function ImagePicker({
  value,
  onChange,
  label = "Image de la catégorie",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden grid place-items-center">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onChange(await uploadCategoryImage(file));
            toast.success("Image ajoutée");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload impossible");
          } finally {
            setBusy(false);
          }
        }}
      />
      <div className="flex min-w-0 flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {value ? "Remplacer" : label}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" /> Retirer
          </button>
        )}
      </div>
    </div>
  );
}

function CategoriesPage() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);

  const productCount = (catId: string) =>
    products.filter((p) => {
      const c = categories.find((c) => c.id === catId);
      return c && p.categorySlug === c.slug;
    }).length;

  const add = useMutation({
    mutationFn: async ({ name, image }: { name: string; image: string | null }) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Le nom est requis.");
      const { error } = await supabase.from("categories").insert({
        name: trimmed,
        slug: slugify(trimmed) || crypto.randomUUID().slice(0, 8),
        sort_order: (categories.at(-1)?.sort_order ?? 0) + 1,
        image_url: image,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setNewName("");
      setNewImage(null);
      await qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie ajoutée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rename = useMutation({
    mutationFn: async ({ id, name, image }: { id: string; name: string; image: string | null }) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Le nom est requis.");
      const { error } = await supabase
        .from("categories")
        .update({ name: trimmed, image_url: image })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setEditingId(null);
      await qc.invalidateQueries({ queryKey: ["categories"] });
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Catégorie mise à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["categories"] });
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Catégorie supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-gray-900">Catégories</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate({ name: newName, image: newImage });
        }}
        className="bg-white rounded-2xl border border-gray-200 p-3 space-y-3"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouvelle catégorie…"
          className="w-full h-12 rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-gray-900"
        />
        <ImagePicker value={newImage} onChange={setNewImage} />
        <button
          type="submit"
          disabled={add.isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 text-white px-4 py-3 text-sm font-medium disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((c) => {
          const count = productCount(c.id);
          const editing = editingId === c.id;
          return (
            <li key={c.id} className="bg-white rounded-2xl border border-gray-200 p-3">
              {editing ? (
                <div className="space-y-3">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-12 rounded-lg border border-gray-300 px-3 text-base outline-none focus:border-gray-900"
                  />
                  <ImagePicker value={editImage} onChange={setEditImage} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rename.mutate({ id: c.id, name: editName, image: editImage })}
                      className="flex-1 h-12 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium"
                    >
                      <Check className="h-4 w-4" /> Enregistrer
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="h-12 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm"
                    >
                      <X className="h-4 w-4" /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 overflow-hidden grid place-items-center">
                    {c.image_url ? (
                      <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      {count} produit{count > 1 ? "s" : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                      setEditImage(c.image_url);
                    }}
                    className="h-11 w-11 shrink-0 grid place-items-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      const msg =
                        count > 0
                          ? `Cette catégorie contient ${count} produit(s). Ils resteront visibles mais ne seront plus classés. Confirmer la suppression ?`
                          : "Supprimer cette catégorie ?";
                      if (window.confirm(msg)) del.mutate(c.id);
                    }}
                    className="h-11 w-11 shrink-0 grid place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
