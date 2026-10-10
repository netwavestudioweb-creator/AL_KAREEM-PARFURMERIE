import type { supabase as SupabaseClient } from "./client";

/**
 * Charge le client Supabase à la demande. Les pages publiques reçoivent leurs
 * données dans le HTML (SSR) : inutile de faire télécharger ~57 Ko de
 * bibliothèque avant l'affichage. Le module n'est chargé qu'au premier besoin
 * (navigation côté navigateur, panier, admin).
 */
export function getSupabase(): Promise<typeof SupabaseClient> {
  return import("./client").then((m) => m.supabase);
}
