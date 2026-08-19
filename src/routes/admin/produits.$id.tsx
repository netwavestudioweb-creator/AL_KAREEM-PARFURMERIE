import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm, emptyProduct, type ProductFormValues } from "@/components/admin/product-form";
import type { DbProduct } from "@/lib/catalog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/produits/$id")({
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async (): Promise<ProductFormValues | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const p = data as DbProduct;
      return {
        name: p.name,
        category_id: p.category_id,
        price_fcfa: p.price_fcfa,
        promo_price_fcfa: p.promo_price_fcfa,
        promo_end_date: p.promo_end_date,
        description: p.description,
        volume: p.volume ?? "",
        in_stock: p.in_stock,
        image_urls: p.image_urls,
      };
    },
  });

  if (isLoading) return <div className="py-16 text-center text-gray-500">Chargement…</div>;
  if (error)
    return (
      <div className="py-16 text-center text-red-600">Erreur : {(error as Error).message}</div>
    );
  if (!data) return <div className="py-16 text-center text-gray-500">Produit introuvable.</div>;

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ? Cette action est définitive."))
      return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("Produit supprimé");
    navigate({ to: "/admin" });
  };

  return (
    <ProductForm
      mode="edit"
      productId={id}
      initial={data ?? emptyProduct()}
      onDelete={handleDelete}
    />
  );
}
