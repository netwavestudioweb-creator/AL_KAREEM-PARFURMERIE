import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesPage,
});

interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  message: string;
  read: boolean;
  created_at: string;
}

async function fetchMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ContactMessage[];
}

function AdminMessagesPage() {
  const qc = useQueryClient();
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: fetchMessages,
  });

  const markRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from("contact_messages").update({ read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Message supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl text-gray-900">Messages de contact</h1>
        <div className="text-xs text-gray-500">{messages.length} au total</div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-500">Chargement…</div>
      ) : messages.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-600">
          Aucun message pour le moment.
        </div>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => {
            const date = new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
            const isEmail = m.contact.includes("@");
            return (
              <li key={m.id} className={`bg-white rounded-2xl border p-4 space-y-2 ${m.read ? "border-gray-200" : "border-primary/40 bg-primary/5"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                      {m.name}
                      {!m.read && <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">Nouveau</span>}
                    </div>
                    <a href={isEmail ? `mailto:${m.contact}` : `tel:${m.contact}`} className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mt-0.5">
                      {isEmail ? <Mail className="h-3 w-3" /> : <Phone className="h-3 w-3" />} {m.contact}
                    </a>
                    <div className="text-[11px] text-gray-500 mt-0.5">{date}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => markRead.mutate({ id: m.id, read: !m.read })}
                      title={m.read ? "Marquer non lu" : "Marquer lu"}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm("Supprimer ce message ?")) del.mutate(m.id); }}
                      title="Supprimer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{m.message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
