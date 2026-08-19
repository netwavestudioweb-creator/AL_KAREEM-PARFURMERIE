import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatFCFA, whatsappLink } from "@/lib/products";
import { MessageCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/commandes")({
  component: AdminOrdersPage,
});

interface OrderItem {
  product_id: string;
  name: string;
  volume: string | null;
  unit_price_fcfa: number;
  quantity: number;
  line_total_fcfa: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  zone: string;
  address: string;
  items: OrderItem[];
  subtotal_fcfa: number;
  total_fcfa: number;
  status: OrderStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

type OrderStatus = "envoyee" | "confirmee" | "livree" | "annulee" | "non_confirmee";

const STATUSES: { value: OrderStatus; label: string; className: string }[] = [
  { value: "envoyee", label: "Envoyée", className: "bg-amber-100 text-amber-700" },
  { value: "confirmee", label: "Confirmée", className: "bg-blue-100 text-blue-700" },
  { value: "livree", label: "Livrée", className: "bg-emerald-100 text-emerald-700" },
  { value: "non_confirmee", label: "Non confirmée", className: "bg-orange-100 text-orange-700" },
  { value: "annulee", label: "Annulée", className: "bg-gray-200 text-gray-600" },
];

function statusStyle(s: string) {
  return STATUSES.find((x) => x.value === s) ?? STATUSES[0];
}

function isStaleEnvoyee(o: { status: string; created_at: string }) {
  if (o.status !== "envoyee") return false;
  return Date.now() - new Date(o.created_at).getTime() > 24 * 60 * 60 * 1000;
}

async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

function AdminOrdersPage() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter ? orders.filter((o) => o.status === filter) : orders),
    [orders, filter],
  );

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-count-orders-envoyee"] });
      toast.success("Statut mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-count-orders-envoyee"] });
      toast.success("Commande supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="font-serif text-2xl text-gray-900">Commandes</h1>
        <div className="text-xs text-gray-500">{orders.length} au total</div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === "" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          Toutes
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === s.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-500">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-600">
          Aucune commande pour le moment.
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((o) => {
            const open = openId === o.id;
            const st = statusStyle(o.status);
            const date = new Date(o.created_at).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            });
            const waPhone = o.customer_phone.replace(/[^0-9]/g, "");
            return (
              <li
                key={o.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">{o.customer_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {o.zone} · {o.customer_phone} · {date}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-gray-900">{formatFCFA(o.total_fcfa)}</div>
                    <div className="text-[10px] text-gray-500">
                      {o.items.length} article{o.items.length > 1 ? "s" : ""}
                    </div>
                  </div>
                  {open ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {open && (
                  <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                    <ul className="text-sm space-y-1">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between gap-3">
                          <span className="text-gray-800">
                            {it.name}
                            {it.volume ? ` (${it.volume})` : ""} × {it.quantity}
                          </span>
                          <span className="text-gray-600">{formatFCFA(it.line_total_fcfa)}</span>
                        </li>
                      ))}
                    </ul>

                    {o.address && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Adresse : </span>
                        {o.address}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={whatsappLink(
                          `Bonjour ${o.customer_name}, je reviens vers vous concernant votre commande Al Kareem Parfumerie du ${date}.`,
                        ).replace(/wa\.me\/\d+/, `wa.me/${waPhone}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-medium hover:bg-emerald-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Contacter sur WhatsApp
                      </a>
                      {isStaleEnvoyee(o) && (
                        <button
                          onClick={() => setStatus.mutate({ id: o.id, status: "non_confirmee" })}
                          className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 text-xs font-medium hover:bg-orange-100"
                          title="Envoyée depuis plus de 24h — sans confirmation client"
                        >
                          Marquer comme non confirmée
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm("Supprimer définitivement cette commande ?"))
                            del.mutate(o.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-red-200 text-red-600 px-4 py-2 text-xs font-medium hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                      </button>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Statut</div>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                          <button
                            key={s.value}
                            disabled={setStatus.isPending || o.status === s.value}
                            onClick={() => setStatus.mutate({ id: o.id, status: s.value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                              o.status === s.value
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
