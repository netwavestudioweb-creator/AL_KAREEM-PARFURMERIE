import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Compteurs affichés dans la navigation admin (rafraîchis toutes les 30 s). */
export function useAdminCounts() {
  const orders = useQuery({
    queryKey: ["admin-count-orders-envoyee"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "envoyee");
      return error ? 0 : (count ?? 0);
    },
    refetchInterval: 30_000,
  });
  const messages = useQuery({
    queryKey: ["admin-count-messages-unread"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      return error ? 0 : (count ?? 0);
    },
    refetchInterval: 30_000,
  });
  return { orders: orders.data ?? 0, messages: messages.data ?? 0 };
}
