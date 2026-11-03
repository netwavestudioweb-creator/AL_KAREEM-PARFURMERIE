import { afterEach, describe, expect, it, vi } from "vitest";

const PRIMARY = "https://primaire.supabase.co";

async function load() {
  vi.resetModules();
  vi.stubEnv("VITE_SUPABASE_URL", PRIMARY);
  vi.stubEnv("VITE_SUPABASE_IMAGE_TRANSFORMS", "");
  return import("./catalog");
}

afterEach(() => vi.unstubAllEnvs());

describe("getOptimizedImageUrl (vignettes précalculées)", () => {
  it("sert la vignette 400 px d'une image signée de la base principale", async () => {
    const { getOptimizedImageUrl } = await load();
    const url = `${PRIMARY}/storage/v1/object/sign/product-images/products/abc.jpg?token=xyz`;
    expect(getOptimizedImageUrl(url, 400, 400)).toBe(
      `${PRIMARY}/storage/v1/object/public/product-images/thumbs/400/products/abc.webp`,
    );
  });

  it("prend la vignette 900 px au-delà de 400 et pour les catégories en 264 la 400", async () => {
    const { getOptimizedImageUrl } = await load();
    const url = `${PRIMARY}/storage/v1/object/public/product-images/categories/c.webp`;
    expect(getOptimizedImageUrl(url, 900, 900)).toContain("/thumbs/900/categories/c.webp");
    expect(getOptimizedImageUrl(url, 264, 264)).toContain("/thumbs/400/categories/c.webp");
  });

  it("laisse intactes les images d'une autre base (secours) et les liens externes", async () => {
    const { getOptimizedImageUrl } = await load();
    const backup =
      "https://secours.supabase.co/storage/v1/object/sign/product-images/p.jpg?token=t";
    expect(getOptimizedImageUrl(backup)).toBe(backup);
    expect(getOptimizedImageUrl("https://exemple.com/p.jpg")).toBe("https://exemple.com/p.jpg");
  });
});
