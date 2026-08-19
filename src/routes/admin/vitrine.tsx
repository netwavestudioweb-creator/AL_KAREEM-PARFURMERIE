import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/image-upload";
import { fetchProofs, fetchTestimonials } from "@/lib/vitrine";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2, Star } from "lucide-react";

export const Route = createFileRoute("/admin/vitrine")({
  component: VitrinePage,
});

function VitrinePage() {
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-gray-900">Vitrine</h1>
      <ProofsSection />
      <TestimonialsSection />
    </div>
  );
}

function ProofsSection() {
  const qc = useQueryClient();
  const { data: proofs = [] } = useQuery({
    queryKey: ["authenticity-proofs"],
    queryFn: fetchProofs,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");

  const add = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadImage(file, "proofs/");
      const { error } = await supabase.from("authenticity_proofs").insert({
        image_url: url,
        caption: caption.trim(),
        sort_order: (proofs.at(-1)?.sort_order ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setCaption("");
      await qc.invalidateQueries({ queryKey: ["authenticity-proofs"] });
      toast.success("Photo ajoutée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("authenticity_proofs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["authenticity-proofs"] });
      toast.success("Photo supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-medium text-gray-900">Preuves d'authenticité</h2>
        <p className="text-sm text-gray-500">
          Photos de parfums avec packaging ou étiquette visible.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-3 space-y-3">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Légende (facultatif)…"
          className="w-full h-12 rounded-lg border border-gray-300 px-3 text-base outline-none focus:border-gray-900"
        />
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
              await add.mutateAsync(file);
            } finally {
              setBusy(false);
            }
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 text-white px-4 py-3 text-sm font-medium disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{" "}
          Ajouter une photo
        </button>
      </div>

      {proofs.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {proofs.map((p) => (
            <li key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <img src={p.image_url} alt="" className="w-full aspect-square object-cover" />
              <div className="p-2 space-y-2">
                <div className="text-xs text-gray-600 min-h-4 break-words">{p.caption}</div>
                <button
                  onClick={() => {
                    if (window.confirm("Supprimer cette photo ?")) del.mutate(p.id);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TestimonialsSection() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>(5);

  const add = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 1) throw new Error("Le prénom est requis.");
      if (message.trim().length < 3) throw new Error("Le témoignage est trop court.");
      const { error } = await supabase.from("testimonials").insert({
        name: name.trim().slice(0, 60),
        message: message.trim().slice(0, 600),
        rating: rating > 0 ? rating : null,
        sort_order: (items.at(-1)?.sort_order ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setName("");
      setMessage("");
      setRating(5);
      await qc.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Témoignage ajouté");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Témoignage supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-medium text-gray-900">Témoignages clients</h2>
        <p className="text-sm text-gray-500">Affichés sur la page d'accueil.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
        className="bg-white rounded-2xl border border-gray-200 p-3 space-y-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prénom"
          maxLength={60}
          className="w-full h-12 rounded-lg border border-gray-300 px-3 text-base outline-none focus:border-gray-900"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Témoignage…"
          rows={3}
          maxLength={600}
          className="w-full rounded-lg border border-gray-300 p-3 text-base outline-none focus:border-gray-900"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Note :</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? 0 : n)}
              className="h-10 w-10 grid place-items-center rounded-lg hover:bg-gray-100"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-5 w-5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            </button>
          ))}
          <span className="text-xs text-gray-500">
            {rating === 0 ? "sans note" : `${rating}/5`}
          </span>
        </div>
        <button
          type="submit"
          disabled={add.isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 text-white px-4 py-3 text-sm font-medium disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t.id} className="bg-white rounded-2xl border border-gray-200 p-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {t.name}
                  {t.rating ? (
                    <span className="ml-2 text-xs text-amber-500">{"★".repeat(t.rating)}</span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-600 break-words">{t.message}</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Supprimer ce témoignage ?")) del.mutate(t.id);
                }}
                className="h-11 w-11 shrink-0 grid place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
