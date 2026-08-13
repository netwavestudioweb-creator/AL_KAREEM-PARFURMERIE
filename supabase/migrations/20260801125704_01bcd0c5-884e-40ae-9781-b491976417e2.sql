CREATE OR REPLACE FUNCTION public.validate_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  it jsonb;
  pid uuid;
  qty int;
  unit int;
  line int;
  sum_total int := 0;
  prod record;
  recent int;
  rebuilt jsonb := '[]'::jsonb;
BEGIN
  NEW.status := 'envoyee';
  NEW.notes := '';

  IF jsonb_typeof(NEW.items) <> 'array'
     OR jsonb_array_length(NEW.items) < 1
     OR jsonb_array_length(NEW.items) > 50 THEN
    RAISE EXCEPTION 'Panier invalide';
  END IF;

  FOR it IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
    qty := COALESCE((it->>'quantity')::int, 0);
    IF qty < 1 OR qty > 100 THEN
      RAISE EXCEPTION 'Quantite invalide';
    END IF;

    BEGIN
      pid := (it->>'product_id')::uuid;
    EXCEPTION WHEN others THEN
      pid := NULL;
    END;

    IF pid IS NULL THEN
      RAISE EXCEPTION 'Article inconnu dans le panier';
    END IF;

    SELECT id, name, volume, price_fcfa, promo_price_fcfa, promo_end_date, in_stock
      INTO prod
    FROM public.products WHERE id = pid;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit introuvable';
    END IF;
    IF NOT prod.in_stock THEN
      RAISE EXCEPTION 'Produit indisponible';
    END IF;

    -- Server-authoritative price: client-sent unit price is ignored entirely.
    IF prod.promo_price_fcfa IS NOT NULL
       AND prod.promo_price_fcfa < prod.price_fcfa
       AND (prod.promo_end_date IS NULL OR prod.promo_end_date >= CURRENT_DATE) THEN
      unit := prod.promo_price_fcfa;
    ELSE
      unit := prod.price_fcfa;
    END IF;

    line := unit * qty;
    sum_total := sum_total + line;

    rebuilt := rebuilt || jsonb_build_object(
      'product_id', prod.id,
      'name', prod.name,
      'volume', prod.volume,
      'quantity', qty,
      'unit_price_fcfa', unit,
      'line_total_fcfa', line
    );
  END LOOP;

  -- Totals are recomputed server-side, never trusted from the client.
  NEW.items := rebuilt;
  NEW.subtotal_fcfa := sum_total;
  NEW.total_fcfa := sum_total;

  SELECT count(*) INTO recent
  FROM public.orders
  WHERE customer_phone = NEW.customer_phone
    AND created_at > now() - interval '1 hour';
  IF recent >= 5 THEN
    RAISE EXCEPTION 'Trop de commandes envoyees recemment. Merci de reessayer plus tard.';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_new_order_trg ON public.orders;
CREATE TRIGGER validate_new_order_trg
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_new_order();

DROP TRIGGER IF EXISTS validate_new_contact_message_trg ON public.contact_messages;
CREATE TRIGGER validate_new_contact_message_trg
BEFORE INSERT ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_new_contact_message();

-- Anonymous visitors may only INSERT orders, never read/update/delete.
REVOKE ALL ON public.orders FROM anon;
GRANT INSERT ON public.orders TO anon;
REVOKE ALL ON public.contact_messages FROM anon;
GRANT INSERT ON public.contact_messages TO anon;

DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order"
ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'envoyee'
  AND notes = ''
  AND char_length(customer_name) BETWEEN 2 AND 100
  AND char_length(customer_phone) BETWEEN 8 AND 20
  AND char_length(zone) BETWEEN 2 AND 60
  AND char_length(address) <= 300
  AND jsonb_typeof(items) = 'array'
  AND jsonb_array_length(items) BETWEEN 1 AND 50
  AND pg_column_size(items) < 20000
  AND subtotal_fcfa >= 0 AND subtotal_fcfa <= 50000000
  AND total_fcfa >= 0 AND total_fcfa <= 50000000
);