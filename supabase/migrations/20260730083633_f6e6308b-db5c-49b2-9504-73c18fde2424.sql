-- ORDERS: strict insert validation ------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  it jsonb;
  pid uuid;
  qty int;
  unit int;
  line int;
  sum_total int := 0;
  prod record;
  recent int;
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
    unit := COALESCE((it->>'unit_price_fcfa')::int, -1);
    line := COALESCE((it->>'line_total_fcfa')::int, -1);
    IF qty < 1 OR qty > 100 OR unit < 0 OR line <> qty * unit THEN
      RAISE EXCEPTION 'Ligne de commande invalide';
    END IF;

    BEGIN
      pid := (it->>'product_id')::uuid;
    EXCEPTION WHEN others THEN
      pid := NULL;
    END;

    IF pid IS NOT NULL THEN
      SELECT price_fcfa, promo_price_fcfa INTO prod FROM public.products WHERE id = pid;
      IF FOUND AND unit <> prod.price_fcfa
         AND (prod.promo_price_fcfa IS NULL OR unit <> prod.promo_price_fcfa) THEN
        RAISE EXCEPTION 'Prix invalide pour un article';
      END IF;
    END IF;

    sum_total := sum_total + line;
  END LOOP;

  IF NEW.subtotal_fcfa <> sum_total OR NEW.total_fcfa <> sum_total THEN
    RAISE EXCEPTION 'Total de commande incoherent';
  END IF;

  SELECT count(*) INTO recent
  FROM public.orders
  WHERE customer_phone = NEW.customer_phone
    AND created_at > now() - interval '1 hour';
  IF recent >= 5 THEN
    RAISE EXCEPTION 'Trop de commandes envoyees recemment. Merci de reessayer plus tard.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_new_order_trg ON public.orders;
CREATE TRIGGER validate_new_order_trg
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_new_order();

DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order"
ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'envoyee'
  AND char_length(customer_name) BETWEEN 2 AND 100
  AND char_length(customer_phone) BETWEEN 8 AND 20
  AND char_length(zone) BETWEEN 2 AND 60
  AND char_length(address) <= 300
  AND char_length(notes) = 0
  AND subtotal_fcfa >= 0 AND subtotal_fcfa <= 50000000
  AND total_fcfa >= 0 AND total_fcfa <= 50000000
  AND pg_column_size(items) < 20000
);

-- CONTACT MESSAGES: size limits + rate limit --------------------------------
CREATE OR REPLACE FUNCTION public.validate_new_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent int;
BEGIN
  NEW.read := false;
  SELECT count(*) INTO recent
  FROM public.contact_messages
  WHERE contact = NEW.contact
    AND created_at > now() - interval '10 minutes';
  IF recent >= 3 THEN
    RAISE EXCEPTION 'Trop de messages envoyes recemment. Merci de reessayer plus tard.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_new_contact_message_trg ON public.contact_messages;
CREATE TRIGGER validate_new_contact_message_trg
BEFORE INSERT ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.validate_new_contact_message();

DROP POLICY IF EXISTS "Anyone can create a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can create a contact message"
ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  read = false
  AND char_length(name) BETWEEN 2 AND 100
  AND char_length(contact) BETWEEN 4 AND 120
  AND char_length(message) BETWEEN 5 AND 2000
);

CREATE INDEX IF NOT EXISTS orders_phone_created_at_idx ON public.orders (customer_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_contact_created_at_idx ON public.contact_messages (contact, created_at DESC);

REVOKE EXECUTE ON FUNCTION public.validate_new_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_new_contact_message() FROM PUBLIC, anon, authenticated;