-- Avis clients après livraison.
-- Une demande d'avis = une ligne créée par l'admin (lien personnel à usage unique),
-- remplie ensuite par la cliente via submit_review(). Aucune table existante n'est modifiée.

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE SET NULL,
  -- 128 bits aléatoires : le lien ne peut pas être deviné.
  token text NOT NULL UNIQUE
    DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  customer_name text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  rating integer CHECK (rating BETWEEN 1 AND 5),
  product_score text CHECK (product_score IN ('oui', 'moyen', 'non')),
  delivery_score text CHECK (delivery_score IN ('oui', 'moyen', 'non')),
  service_score text CHECK (service_score IN ('oui', 'moyen', 'non')),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 600),
  consent_publish boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'received', 'published', 'internal', 'archived')),
  testimonial_id uuid REFERENCES public.testimonials(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);

CREATE INDEX IF NOT EXISTS reviews_status_idx ON public.reviews (status, submitted_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reviews FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- Seuls les administrateurs lisent et gèrent les avis ; les clientes passent par les fonctions ci-dessous.
CREATE POLICY "Admins can view reviews" ON public.reviews FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can create review requests" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Page /avis/<lien> : affiche seulement le prénom et l'état du lien.
CREATE OR REPLACE FUNCTION public.get_review_request(p_token text)
RETURNS TABLE (first_name text, already_submitted boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT split_part(trim(r.customer_name), ' ', 1), r.status <> 'requested'
  FROM public.reviews r
  WHERE r.token = p_token AND char_length(p_token) = 64
$$;

-- Enregistre la réponse une seule fois ; toutes les valeurs sont revérifiées ici.
CREATE OR REPLACE FUNCTION public.submit_review(
  p_token text,
  p_rating integer,
  p_product text,
  p_delivery text,
  p_service text,
  p_message text,
  p_display_name text,
  p_city text,
  p_consent boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated integer;
BEGIN
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Note invalide';
  END IF;
  IF char_length(trim(coalesce(p_message, ''))) < 3 OR char_length(p_message) > 600 THEN
    RAISE EXCEPTION 'Message invalide';
  END IF;
  IF char_length(trim(coalesce(p_display_name, ''))) < 1 OR char_length(p_display_name) > 40
     OR char_length(coalesce(p_city, '')) > 40 THEN
    RAISE EXCEPTION 'Nom invalide';
  END IF;

  UPDATE public.reviews SET
    rating = p_rating,
    product_score = nullif(p_product, ''),
    delivery_score = nullif(p_delivery, ''),
    service_score = nullif(p_service, ''),
    message = trim(p_message),
    display_name = trim(p_display_name),
    city = trim(coalesce(p_city, '')),
    consent_publish = coalesce(p_consent, false),
    status = 'received',
    submitted_at = now()
  WHERE token = p_token AND status = 'requested';

  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    RAISE EXCEPTION 'Lien invalide ou déjà utilisé';
  END IF;
  RETURN true;
END;
$$;

-- Témoignages issus d'un avis client (mention « Achat vérifié » sur le site).
CREATE OR REPLACE FUNCTION public.verified_testimonial_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT testimonial_id FROM public.reviews
  WHERE status = 'published' AND testimonial_id IS NOT NULL
$$;

REVOKE ALL ON FUNCTION public.get_review_request(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_review(text, integer, text, text, text, text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verified_testimonial_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_review_request(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_review(text, integer, text, text, text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verified_testimonial_ids() TO anon, authenticated;
