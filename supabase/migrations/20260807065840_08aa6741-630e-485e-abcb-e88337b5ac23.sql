CREATE TABLE public.authenticity_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.authenticity_proofs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authenticity_proofs TO authenticated;
GRANT ALL ON public.authenticity_proofs TO service_role;
ALTER TABLE public.authenticity_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view proofs" ON public.authenticity_proofs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert proofs" ON public.authenticity_proofs FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update proofs" ON public.authenticity_proofs FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete proofs" ON public.authenticity_proofs FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message text NOT NULL,
  rating integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT testimonials_rating_range CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  CONSTRAINT testimonials_name_len CHECK (char_length(name) BETWEEN 1 AND 60),
  CONSTRAINT testimonials_message_len CHECK (char_length(message) BETWEEN 3 AND 600)
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));