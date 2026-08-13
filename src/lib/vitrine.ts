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
  return (data ?? []) as AuthenticityProof[];
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
