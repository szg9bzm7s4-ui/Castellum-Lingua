-- =====================================================================
-- CASTELLUM LINGUA · CADEAUX ENTRE AMIS (section Château)
-- À exécuter dans Supabase → SQL Editor, APRÈS schema.sql et le SQL
-- « social » (amis, ligue, défis) déjà installé.
-- Le script peut être relancé sans risque.
--
-- Fonctionnement :
--   · castle_send_gift(p_to)   : offre un cadeau (10 pièces) à un ami.
--                                1 cadeau par ami et par jour, 5 cadeaux par jour au maximum.
--   · castle_claim_gifts()     : récupère les cadeaux reçus pas encore ouverts.
--   · castle_gift_status()     : amis à qui j'ai déjà offert un cadeau aujourd'hui + cadeaux en attente.
-- Personne ne peut écrire directement dans la table : tout passe par ces fonctions.
-- =====================================================================

create table if not exists public.castle_gifts (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references auth.users(id) on delete cascade,
  to_user     uuid not null references auth.users(id) on delete cascade,
  gift_day    date not null default ((now() at time zone 'utc')::date),
  coins       integer not null default 10 check (coins between 1 and 50),
  created_at  timestamptz not null default now(),
  claimed_at  timestamptz,
  constraint castle_gifts_not_self check (from_user <> to_user),
  constraint castle_gifts_once_a_day unique (from_user, to_user, gift_day)
);
create index if not exists castle_gifts_inbox on public.castle_gifts (to_user) where claimed_at is null;
create index if not exists castle_gifts_sent_day on public.castle_gifts (from_user, gift_day);

alter table public.castle_gifts enable row level security;
drop policy if exists "castle_gifts: voir ses cadeaux" on public.castle_gifts;
create policy "castle_gifts: voir ses cadeaux" on public.castle_gifts
  for select to authenticated using (auth.uid() = from_user or auth.uid() = to_user);
-- Aucune politique insert / update / delete : seules les fonctions ci-dessous écrivent.
revoke insert, update, delete on public.castle_gifts from anon, authenticated;

-- Vrai si p_other fait partie des amis acceptés de l'utilisateur connecté.
-- On s'appuie sur social_get_dashboard() (installée avec le SQL « social ») pour ne pas
-- dépendre de la structure exacte de la table d'amitiés.
create or replace function public._castle_is_friend(p_other uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  d := to_jsonb(public.social_get_dashboard());
  return exists (
    select 1 from jsonb_array_elements(coalesce(d->'friends','[]'::jsonb)) f
    where (f->>'id') = p_other::text
  );
end $$;
revoke all on function public._castle_is_friend(uuid) from public, anon, authenticated;

create or replace function public.castle_send_gift(p_to uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  today date := (now() at time zone 'utc')::date;
  n_today int;
  new_id uuid;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  if p_to is null or p_to = me then raise exception 'invalid_friend'; end if;
  if not public._castle_is_friend(p_to) then raise exception 'not_friends'; end if;
  select count(*) into n_today from public.castle_gifts where from_user = me and gift_day = today;
  if exists (select 1 from public.castle_gifts where from_user = me and to_user = p_to and gift_day = today) then
    return jsonb_build_object('sent', false, 'reason', 'already_sent', 'left', greatest(0, 5 - n_today));
  end if;
  if n_today >= 5 then
    return jsonb_build_object('sent', false, 'reason', 'daily_limit', 'left', 0);
  end if;
  insert into public.castle_gifts (from_user, to_user, gift_day, coins)
  values (me, p_to, today, 10)
  on conflict (from_user, to_user, gift_day) do nothing
  returning id into new_id;
  return jsonb_build_object('sent', new_id is not null, 'reason', case when new_id is null then 'already_sent' end, 'left', greatest(0, 4 - n_today));
end $$;

create or replace function public.castle_claim_gifts()
returns jsonb language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); res jsonb;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  with opened as (
    update public.castle_gifts set claimed_at = now()
    where to_user = me and claimed_at is null
    returning from_user, coins
  )
  select jsonb_build_object(
    'count', count(*),
    'coins', coalesce(sum(o.coins), 0),
    'from', coalesce(jsonb_agg(distinct coalesce(p.display_name, p.username, 'Ami')) filter (where o.from_user is not null), '[]'::jsonb)
  ) into res
  from opened o left join public.profiles p on p.id = o.from_user;
  return res;
end $$;

create or replace function public.castle_gift_status()
returns jsonb language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); today date := (now() at time zone 'utc')::date;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  return jsonb_build_object(
    'sent_today', coalesce((select jsonb_agg(to_user) from public.castle_gifts where from_user = me and gift_day = today), '[]'::jsonb),
    'pending', (select count(*) from public.castle_gifts where to_user = me and claimed_at is null)
  );
end $$;

revoke all on function public.castle_send_gift(uuid) from public, anon;
revoke all on function public.castle_claim_gifts() from public, anon;
revoke all on function public.castle_gift_status() from public, anon;
grant execute on function public.castle_send_gift(uuid) to authenticated;
grant execute on function public.castle_claim_gifts() to authenticated;
grant execute on function public.castle_gift_status() to authenticated;
