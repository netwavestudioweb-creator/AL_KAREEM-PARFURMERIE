import { supabase } from "@/integrations/supabase/client";

export interface AuthenticityProof {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number | null;
  sort_order: number;
}

export async function fetchProofs(): Promise<AuthenticityProof[]> {
  const { data, error } = await supabase
    .from("authenticity_proofs")
    .select("id,image_url,caption,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  const list = (data ?? []) as AuthenticityProof[];
  return Promise.all(
    list.map(async (p) => {
      let url = p.image_url;
      if (url && url.includes("/storage/v1/object/public/product-images/")) {
        try {
          const path = url.split("/storage/v1/object/public/product-images/")[1];
          const { data: signData } = await supabase.storage
            .from("product-images")
            .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
          if (signData?.signedUrl) url = signData.signedUrl;
        } catch {
          /* ignore */
        }
      }
      return { ...p, image_url: url };
    }),
  );
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id,name,message,rating,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}
