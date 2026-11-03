-- Notifications téléphone de l'équipe à chaque nouvelle commande (web push).
--
-- 1. L'admin active les notifications sur son téléphone : son abonnement est enregistré ici.
-- 2. À chaque commande, un déclencheur appelle le site (/api/push/new-order) via pg_net,
--    avec le résumé de la commande et la liste des abonnements ; le site envoie les notifications.
-- Le secret partagé avec le site est rangé dans Vault (nom « push_webhook_secret »), jamais ici :
--   select vault.create_secret('<PUSH_WEBHOOK_SECRET>', 'push_webhook_secret');

create extension if not exists pg_net with schema extensions;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Admins manage push subscriptions" on public.push_subscriptions;
create policy "Admins manage push subscriptions" on public.push_subscriptions
  for all to authenticated
  using (private.has_role(auth.uid(), 'admin'::public.app_role))
  with check (private.has_role(auth.uid(), 'admin'::public.app_role) and user_id = auth.uid());

revoke all on public.push_subscriptions from anon;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

create or replace function private.notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  secret text;
  subs jsonb;
begin
  select coalesce(
    jsonb_agg(jsonb_build_object(
      'endpoint', endpoint,
      'keys', jsonb_build_object('p256dh', p256dh, 'auth', auth)
    )),
    '[]'::jsonb
  ) into subs
  from public.push_subscriptions;

  if subs = '[]'::jsonb then
    return new;
  end if;

  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'push_webhook_secret'
  limit 1;

  if secret is null then
    return new;
  end if;

  -- Envoi asynchrone, après validation de la commande : n'allonge pas l'enregistrement.
  perform net.http_post(
    url := 'https://www.al-kareemparfurmerie.com/api/push/new-order',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', secret),
    body := jsonb_build_object(
      'order', jsonb_build_object(
        'id', new.id,
        'customer_name', new.customer_name,
        'total_fcfa', new.total_fcfa,
        'zone', new.zone,
        'items', coalesce(jsonb_array_length(new.items), 0)
      ),
      'subscriptions', subs
    ),
    timeout_milliseconds := 10000
  );
  return new;
exception when others then
  -- Une notification ne doit jamais empêcher une commande d'être enregistrée.
  return new;
end;
$$;

revoke all on function private.notify_new_order() from public, anon, authenticated;

drop trigger if exists orders_notify_push on public.orders;
create trigger orders_notify_push
  after insert on public.orders
  for each row execute function private.notify_new_order();
