import { createFileRoute } from "@tanstack/react-router";
import { ProductForm, emptyProduct } from "@/components/admin/product-form";

export const Route = createFileRoute("/admin/produits/nouveau")({
  component: () => <ProductForm mode="create" initial={emptyProduct()} />,
});
