-- =====================================================================
--  Castellum Lingua · Supabase schema
--  À exécuter une fois dans Supabase : Dashboard → SQL Editor → New query → Run.
--  Le script est ré-exécutable (IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS).
--
--  Principes :
--   • chaque table personnelle a Row Level Security activé ;
--   • un utilisateur ne voit et ne modifie QUE ses propres lignes (auth.uid()) ;
--   • les XP, séries et leçons terminées ne s'écrivent que via des fonctions RPC
--     contrôlées (plafonds d'XP, date du jour vérifiée) : un client ne peut pas
--     s'attribuer 1 000 000 d'XP en écrivant directement dans une table ;
--   • aucune donnée dupliquée : le contenu des cours reste dans l'application,
--     la base ne stocke que la progression.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Utilitaires
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- 1. PROFILES  (1 ligne par compte, créée automatiquement à l'inscription)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            text,
  display_name        text,
  avatar_url          text,
  total_xp            integer not null default 0 check (total_xp >= 0),
  current_streak      integer not null default 0 check (current_streak >= 0),
  longest_streak      integer not null default 0 check (longest_streak >= 0),
  last_activity_date  date,
  settings            jsonb   not null default '{}'::jsonb,   -- langue d'interface, objectif, son, langue en cours
  local_migrated_at   timestamptz,                             -- migration unique de la progression locale
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username ~ '^[A-Za-z0-9_.-]{3,30}$'),
  constraint profiles_display_name_len check (display_name is null or char_length(display_name) <= 60),
  constraint profiles_avatar_len check (avatar_url is null or char_length(avatar_url) <= 500)
);
create unique index if not exists profiles_username_unique on public.profiles (lower(username)) where username is not null;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2. USER_LANGUAGES  (une ligne par langue apprise)
-- ---------------------------------------------------------------------
create table if not exists public.user_languages (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  language_id     text not null check (language_id ~ '^[a-z]{2,3}(-[A-Za-z]{2,3})?$'),
  current_level   text not null default 'A1' check (current_level in ('A1','A2','B1','B2','C1','C2')),
  current_unit    integer not null default 0 check (current_unit >= 0),
  current_lesson  integer not null default 0 check (current_lesson >= 0),
  xp              integer not null default 0 check (xp >= 0),
  started_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint user_languages_unique unique (user_id, language_id)
);
drop trigger if exists user_languages_updated_at on public.user_languages;
create trigger user_languages_updated_at before update on public.user_languages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. LESSON_PROGRESS  (une ligne par étape du parcours, par langue et par niveau)
--    unit_id   = identifiant de l'unité dans l'app (ex. "u3", "a2u5", "c1u12") ou "_level"
--    lesson_id = "0" à "3" (le "3" est le boss), "chest", "special", "checkpoint"
-- ---------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  language_id   text not null,
  level         text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  unit_id       text not null check (unit_id ~ '^[A-Za-z0-9_]{1,20}$'),
  lesson_id     text not null check (lesson_id ~ '^[A-Za-z0-9_]{1,20}$'),
  completed     boolean not null default false,
  score         integer check (score between 0 and 100),
  best_score    integer check (best_score between 0 and 100),
  attempts      integer not null default 0 check (attempts >= 0),
  xp_earned     integer not null default 0 check (xp_earned >= 0),
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  constraint lesson_progress_unique unique (user_id, language_id, level, unit_id, lesson_id),
  constraint lesson_progress_language_fk foreign key (user_id, language_id)
    references public.user_languages (user_id, language_id) on delete cascade
);
create index if not exists lesson_progress_user_lang_level on public.lesson_progress (user_id, language_id, level);
drop trigger if exists lesson_progress_updated_at on public.lesson_progress;
create trigger lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. VOCABULARY_PROGRESS  (répétition espacée, un mot par ligne)
--    word_id         = le mot ou la phrase dans la langue apprise
--    source_language = langue de l'élève (fr, nl, en…) : la même langue apprise
--                      depuis deux langues donne deux fiches de révision distinctes
--    prompt/translit = texte affiché pendant la révision (utile pour les contenus
--                      générés par Claude, absents des données de l'app)
-- ---------------------------------------------------------------------
create table if not exists public.vocabulary_progress (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null,
  language_id       text not null,
  source_language   text not null default 'fr' check (source_language ~ '^[a-z]{2,3}(-[A-Za-z]{2,3})?$'),
  word_id           text not null check (char_length(word_id) between 1 and 300),
  prompt            text check (prompt is null or char_length(prompt) <= 300),
  translit          text check (translit is null or char_length(translit) <= 300),
  mastery_level     smallint not null default 0 check (mastery_level between 0 and 6),
  correct_answers   integer not null default 0 check (correct_answers >= 0),
  wrong_answers     integer not null default 0 check (wrong_answers >= 0),
  last_reviewed_at  timestamptz,
  next_review_at    timestamptz,
  constraint vocabulary_progress_unique unique (user_id, language_id, source_language, word_id),
  constraint vocabulary_progress_language_fk foreign key (user_id, language_id)
    references public.user_languages (user_id, language_id) on delete cascade
);
create index if not exists vocabulary_progress_due on public.vocabulary_progress (user_id, language_id, next_review_at);

-- ---------------------------------------------------------------------
-- 5. USER_ACHIEVEMENTS
-- ---------------------------------------------------------------------
create table if not exists public.user_achievements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  achievement_id  text not null check (achievement_id ~ '^[a-z0-9_]{2,40}$'),
  unlocked_at     timestamptz not null default now(),
  constraint user_achievements_unique unique (user_id, achievement_id)
);

-- ---------------------------------------------------------------------
-- 6. DAILY_ACTIVITY  (une ligne par jour d'activité)
-- ---------------------------------------------------------------------
create table if not exists public.daily_activity (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  activity_date      date not null,
  xp_earned          integer not null default 0 check (xp_earned >= 0),
  lessons_completed  integer not null default 0 check (lessons_completed >= 0),
  seconds_learned    integer not null default 0 check (seconds_learned >= 0),
  minutes_learned    integer generated always as (seconds_learned / 60) stored,
  constraint daily_activity_unique unique (user_id, activity_date)
);

-- ---------------------------------------------------------------------
-- 7. SAVED_WORDS  (« Mes mots » : les mots mis en favori)
-- ---------------------------------------------------------------------
create table if not exists public.saved_words (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  language_id  text not null check (language_id ~ '^[a-z]{2,3}(-[A-Za-z]{2,3})?$'),
  word         text not null check (char_length(word) between 1 and 300),
  translation  text check (translation is null or char_length(translation) <= 300),
  translit     text check (translit is null or char_length(translit) <= 300),
  created_at   timestamptz not null default now(),
  constraint saved_words_unique unique (user_id, language_id, word)
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.user_languages      enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.vocabulary_progress enable row level security;
alter table public.user_achievements   enable row level security;
alter table public.daily_activity      enable row level security;
alter table public.saved_words         enable row level security;

-- Les visiteurs non connectés (anon) n'ont accès à rien.
revoke all on public.profiles, public.user_languages, public.lesson_progress, public.vocabulary_progress,
              public.user_achievements, public.daily_activity, public.saved_words from anon;

-- Les utilisateurs connectés : lecture de leurs lignes, écriture limitée.
revoke all on public.profiles, public.user_languages, public.lesson_progress, public.vocabulary_progress,
              public.user_achievements, public.daily_activity, public.saved_words from authenticated;
grant select on public.profiles, public.user_languages, public.lesson_progress, public.vocabulary_progress,
                public.user_achievements, public.daily_activity, public.saved_words to authenticated;
-- profil : seuls les champs « cosmétiques » sont modifiables directement (pas les XP ni la série)
grant update (username, display_name, avatar_url, settings) on public.profiles to authenticated;
-- langues : on peut ajouter une langue et changer de niveau, pas modifier ses XP
grant insert (user_id, language_id, current_level, current_unit, current_lesson) on public.user_languages to authenticated;
grant update (current_level, current_unit, current_lesson) on public.user_languages to authenticated;
grant delete on public.user_languages to authenticated;
-- vocabulaire et favoris : écriture libre sur ses propres lignes
grant insert, update, delete on public.vocabulary_progress to authenticated;
grant insert, delete on public.saved_words to authenticated;

-- profiles
drop policy if exists "profiles: lire son profil" on public.profiles;
create policy "profiles: lire son profil" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles: modifier son profil" on public.profiles;
create policy "profiles: modifier son profil" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- user_languages
drop policy if exists "user_languages: lire" on public.user_languages;
create policy "user_languages: lire" on public.user_languages
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "user_languages: ajouter" on public.user_languages;
create policy "user_languages: ajouter" on public.user_languages
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "user_languages: modifier" on public.user_languages;
create policy "user_languages: modifier" on public.user_languages
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user_languages: supprimer" on public.user_languages;
create policy "user_languages: supprimer" on public.user_languages
  for delete to authenticated using (auth.uid() = user_id);

-- lesson_progress (écriture uniquement via complete_lesson / import_local_progress)
drop policy if exists "lesson_progress: lire" on public.lesson_progress;
create policy "lesson_progress: lire" on public.lesson_progress
  for select to authenticated using (auth.uid() = user_id);

-- vocabulary_progress
drop policy if exists "vocabulary_progress: lire" on public.vocabulary_progress;
create policy "vocabulary_progress: lire" on public.vocabulary_progress
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "vocabulary_progress: ajouter" on public.vocabulary_progress;
create policy "vocabulary_progress: ajouter" on public.vocabulary_progress
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "vocabulary_progress: modifier" on public.vocabulary_progress;
create policy "vocabulary_progress: modifier" on public.vocabulary_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "vocabulary_progress: supprimer" on public.vocabulary_progress;
create policy "vocabulary_progress: supprimer" on public.vocabulary_progress
  for delete to authenticated using (auth.uid() = user_id);

-- user_achievements (écriture via unlock_achievement)
drop policy if exists "user_achievements: lire" on public.user_achievements;
create policy "user_achievements: lire" on public.user_achievements
  for select to authenticated using (auth.uid() = user_id);

-- daily_activity (écriture via complete_lesson / record_activity)
drop policy if exists "daily_activity: lire" on public.daily_activity;
create policy "daily_activity: lire" on public.daily_activity
  for select to authenticated using (auth.uid() = user_id);

-- saved_words
drop policy if exists "saved_words: lire" on public.saved_words;
create policy "saved_words: lire" on public.saved_words
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "saved_words: ajouter" on public.saved_words;
create policy "saved_words: ajouter" on public.saved_words
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "saved_words: supprimer" on public.saved_words;
create policy "saved_words: supprimer" on public.saved_words
  for delete to authenticated using (auth.uid() = user_id);

-- =====================================================================
-- CRÉATION AUTOMATIQUE DU PROFIL À L'INSCRIPTION
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(new.raw_user_meta_data->>'display_name',
                          new.raw_user_meta_data->>'full_name',
                          new.raw_user_meta_data->>'name',
                          split_part(coalesce(new.email, ''), '@', 1));
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, nullif(left(v_name, 60), ''), left(new.raw_user_meta_data->>'avatar_url', 500))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- FONCTIONS DE PROGRESSION (appelées par l'app via supabase.rpc)
-- Toutes utilisent auth.uid() : impossible d'écrire pour quelqu'un d'autre.
-- =====================================================================

-- Date « du jour » envoyée par l'appareil (fuseau de l'élève), acceptée à ±1 jour.
create or replace function public._safe_today(p_today date)
returns date language sql stable as $$
  select case when p_today between (now() at time zone 'utc')::date - 1 and (now() at time zone 'utc')::date + 1
              then p_today else (now() at time zone 'utc')::date end
$$;

-- Crée la ligne de langue si besoin et la renvoie.
create or replace function public._ensure_language(p_uid uuid, p_language text, p_level text default null)
returns public.user_languages language plpgsql security definer set search_path = public as $$
declare r public.user_languages;
begin
  insert into user_languages (user_id, language_id, current_level)
  values (p_uid, p_language, coalesce(p_level, 'A1'))
  on conflict (user_id, language_id) do nothing;
  select * into r from user_languages where user_id = p_uid and language_id = p_language;
  return r;
end $$;

-- Ajoute des XP, met à jour l'activité du jour et recalcule la série.
create or replace function public._add_activity(p_uid uuid, p_xp int, p_seconds int, p_lessons int, p_today date)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_today date := public._safe_today(p_today);
  v_prof  profiles;
  v_streak int;
begin
  insert into daily_activity (user_id, activity_date, xp_earned, lessons_completed, seconds_learned)
  values (p_uid, v_today, p_xp, p_lessons, p_seconds)
  on conflict (user_id, activity_date) do update
    set xp_earned         = daily_activity.xp_earned + excluded.xp_earned,
        lessons_completed = daily_activity.lessons_completed + excluded.lessons_completed,
        seconds_learned   = daily_activity.seconds_learned + excluded.seconds_learned;

  select * into v_prof from profiles where id = p_uid for update;
  v_streak := v_prof.current_streak;
  if p_xp > 0 then
    if v_prof.last_activity_date is null or v_prof.last_activity_date < v_today - 1 then
      v_streak := 1;
    elsif v_prof.last_activity_date = v_today - 1 then
      v_streak := v_prof.current_streak + 1;
    end if;  -- même jour (ou date plus ancienne renvoyée par un autre appareil) : série inchangée
  end if;
  update profiles set
    total_xp           = total_xp + p_xp,
    current_streak     = v_streak,
    longest_streak     = greatest(longest_streak, v_streak),
    last_activity_date = case when p_xp > 0 then greatest(coalesce(last_activity_date, v_today), v_today) else last_activity_date end
  where id = p_uid;
end $$;

-- Fin d'une étape du parcours (leçon, boss, coffre, défi spécial, checkpoint).
create or replace function public.complete_lesson(
  p_language     text,
  p_level        text,
  p_unit_id      text,
  p_lesson_id    text,
  p_score        int,
  p_xp           int,
  p_seconds      int  default 0,
  p_today        date default null,
  p_next_unit    int  default null,
  p_next_lesson  int  default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_xp  int  := least(greatest(coalesce(p_xp, 0), 0), 100);          -- plafond : 100 XP par étape
  v_sec int  := least(greatest(coalesce(p_seconds, 0), 0), 3600);
  v_score int := least(greatest(coalesce(p_score, 0), 0), 100);
  v_lp lesson_progress;
  v_prof profiles;
  v_lang user_languages;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_level not in ('A1','A2','B1','B2','C1','C2') then raise exception 'invalid_level'; end if;
  perform public._ensure_language(v_uid, p_language, p_level);

  insert into lesson_progress (user_id, language_id, level, unit_id, lesson_id, completed, score, best_score, attempts, xp_earned, completed_at)
  values (v_uid, p_language, p_level, p_unit_id, p_lesson_id, true, v_score, v_score, 1, v_xp, now())
  on conflict (user_id, language_id, level, unit_id, lesson_id) do update
    set completed    = true,
        score        = excluded.score,
        best_score   = greatest(coalesce(lesson_progress.best_score, 0), excluded.score),
        attempts     = lesson_progress.attempts + 1,
        xp_earned    = lesson_progress.xp_earned + excluded.xp_earned,
        completed_at = coalesce(lesson_progress.completed_at, now())
  returning * into v_lp;

  update user_languages set
    xp             = xp + v_xp,
    current_level  = p_level,
    current_unit   = coalesce(p_next_unit, current_unit),
    current_lesson = coalesce(p_next_lesson, current_lesson)
  where user_id = v_uid and language_id = p_language
  returning * into v_lang;

  perform public._add_activity(v_uid, v_xp, v_sec, case when p_lesson_id ~ '^[0-9]+$' then 1 else 0 end, p_today);
  select * into v_prof from profiles where id = v_uid;

  return jsonb_build_object(
    'total_xp', v_prof.total_xp, 'current_streak', v_prof.current_streak, 'longest_streak', v_prof.longest_streak,
    'language_xp', v_lang.xp, 'best_score', v_lp.best_score, 'attempts', v_lp.attempts);
end $$;

-- XP gagnés hors parcours (jeux, révisions, professeur).
create or replace function public.record_activity(p_language text, p_xp int, p_seconds int default 0, p_today date default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_xp  int  := least(greatest(coalesce(p_xp, 0), 0), 60);            -- plafond : 60 XP par partie
  v_prof profiles;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform public._ensure_language(v_uid, p_language, null);
  update user_languages set xp = xp + v_xp where user_id = v_uid and language_id = p_language;
  perform public._add_activity(v_uid, v_xp, least(greatest(coalesce(p_seconds, 0), 0), 3600), 0, p_today);
  select * into v_prof from profiles where id = v_uid;
  return jsonb_build_object('total_xp', v_prof.total_xp, 'current_streak', v_prof.current_streak, 'longest_streak', v_prof.longest_streak);
end $$;

-- Débloque un succès (idempotent).
create or replace function public.unlock_achievement(p_achievement text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_n int;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  insert into user_achievements (user_id, achievement_id) values (v_uid, p_achievement)
  on conflict (user_id, achievement_id) do nothing;
  get diagnostics v_n = row_count;
  return v_n > 0;
end $$;

-- Migration UNIQUE de la progression locale (localStorage) vers le compte.
-- p_payload = { total_xp, languages:[{language_id,level,xp,unit,lesson}], lessons:[{language_id,level,unit_id,lesson_id}],
--               days:[{date,xp,lessons,seconds}], vocab:[…], saved:[…], settings:{…} }
-- Les valeurs sont FUSIONNÉES (on garde le maximum) : rien n'est écrasé côté serveur.
create or replace function public.import_local_progress(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_prof profiles;
  x jsonb;
  v_days int := 0; v_lessons int := 0; v_langs int := 0; v_vocab int := 0; v_saved int := 0;
  v_streak int := 0; v_best int := 0; v_run int := 0; v_prev date; v_last date; d record;
begin
  if v_uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into v_prof from profiles where id = v_uid for update;
  if v_prof.local_migrated_at is not null then
    return jsonb_build_object('status', 'already_migrated');
  end if;

  for x in select * from jsonb_array_elements(coalesce(p_payload->'languages', '[]'::jsonb)) loop
    perform public._ensure_language(v_uid, x->>'language_id', coalesce(x->>'level', 'A1'));
    update user_languages set
      xp = greatest(xp, least(coalesce((x->>'xp')::int, 0), 1000000)),
      current_level  = coalesce(x->>'level', current_level),
      current_unit   = greatest(current_unit, coalesce((x->>'unit')::int, 0)),
      current_lesson = coalesce((x->>'lesson')::int, current_lesson)
    where user_id = v_uid and language_id = x->>'language_id';
    v_langs := v_langs + 1;
  end loop;

  for x in select * from jsonb_array_elements(coalesce(p_payload->'lessons', '[]'::jsonb)) loop
    perform public._ensure_language(v_uid, x->>'language_id', null);
    insert into lesson_progress (user_id, language_id, level, unit_id, lesson_id, completed, attempts, completed_at)
    values (v_uid, x->>'language_id', x->>'level', x->>'unit_id', x->>'lesson_id', true, 1, now())
    on conflict (user_id, language_id, level, unit_id, lesson_id) do update set completed = true;
    v_lessons := v_lessons + 1;
  end loop;

  for x in select * from jsonb_array_elements(coalesce(p_payload->'days', '[]'::jsonb)) loop
    insert into daily_activity (user_id, activity_date, xp_earned, lessons_completed, seconds_learned)
    values (v_uid, (x->>'date')::date, least(coalesce((x->>'xp')::int, 0), 100000),
            least(coalesce((x->>'lessons')::int, 0), 10000), least(coalesce((x->>'seconds')::int, 0), 86400))
    on conflict (user_id, activity_date) do update set
      xp_earned         = greatest(daily_activity.xp_earned, excluded.xp_earned),
      lessons_completed = greatest(daily_activity.lessons_completed, excluded.lessons_completed),
      seconds_learned   = greatest(daily_activity.seconds_learned, excluded.seconds_learned);
    v_days := v_days + 1;
  end loop;

  for x in select * from jsonb_array_elements(coalesce(p_payload->'vocab', '[]'::jsonb)) loop
    perform public._ensure_language(v_uid, x->>'language_id', null);
    insert into vocabulary_progress (user_id, language_id, source_language, word_id, prompt, translit, mastery_level,
                                     correct_answers, wrong_answers, last_reviewed_at, next_review_at)
    values (v_uid, x->>'language_id', coalesce(x->>'source_language', 'fr'), x->>'word_id', x->>'prompt', x->>'translit',
            least(greatest(coalesce((x->>'mastery_level')::int, 0), 0), 6), coalesce((x->>'correct_answers')::int, 0),
            coalesce((x->>'wrong_answers')::int, 0), (x->>'last_reviewed_at')::timestamptz, (x->>'next_review_at')::timestamptz)
    on conflict (user_id, language_id, source_language, word_id) do update set
      mastery_level   = greatest(vocabulary_progress.mastery_level, excluded.mastery_level),
      correct_answers = greatest(vocabulary_progress.correct_answers, excluded.correct_answers),
      wrong_answers   = greatest(vocabulary_progress.wrong_answers, excluded.wrong_answers),
      next_review_at  = greatest(vocabulary_progress.next_review_at, excluded.next_review_at);
    v_vocab := v_vocab + 1;
  end loop;

  for x in select * from jsonb_array_elements(coalesce(p_payload->'saved', '[]'::jsonb)) loop
    insert into saved_words (user_id, language_id, word, translation, translit)
    values (v_uid, x->>'language_id', x->>'word', x->>'translation', x->>'translit')
    on conflict (user_id, language_id, word) do nothing;
    v_saved := v_saved + 1;
  end loop;

  -- série recalculée à partir des jours d'activité
  for d in select activity_date from daily_activity where user_id = v_uid and xp_earned > 0 order by activity_date loop
    if v_prev is not null and d.activity_date = v_prev + 1 then v_run := v_run + 1; else v_run := 1; end if;
    v_best := greatest(v_best, v_run); v_prev := d.activity_date;
  end loop;
  v_last := v_prev;
  v_streak := case when v_last >= (now() at time zone 'utc')::date - 1 then v_run else 0 end;

  update profiles set
    total_xp           = greatest(total_xp, least(coalesce((p_payload->>'total_xp')::int, 0), 1000000),
                                  (select coalesce(sum(xp), 0) from user_languages where user_id = v_uid)),
    current_streak     = greatest(current_streak, v_streak),
    longest_streak     = greatest(longest_streak, v_best, v_streak),
    last_activity_date = greatest(last_activity_date, v_last),
    settings           = case when settings = '{}'::jsonb then coalesce(p_payload->'settings', '{}'::jsonb) else settings end,
    local_migrated_at  = now()
  where id = v_uid;

  return jsonb_build_object('status', 'migrated', 'languages', v_langs, 'lessons', v_lessons,
                            'days', v_days, 'vocab', v_vocab, 'saved', v_saved);
end $$;

-- Les fonctions internes ne sont pas appelables depuis l'app ; les fonctions publiques
-- sont réservées aux utilisateurs connectés.
revoke all on function public._safe_today(date) from public, anon, authenticated;
revoke all on function public._ensure_language(uuid, text, text) from public, anon, authenticated;
revoke all on function public._add_activity(uuid, int, int, int, date) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.complete_lesson(text, text, text, text, int, int, int, date, int, int) from public, anon;
revoke all on function public.record_activity(text, int, int, date) from public, anon;
revoke all on function public.unlock_achievement(text) from public, anon;
revoke all on function public.import_local_progress(jsonb) from public, anon;
grant execute on function public.complete_lesson(text, text, text, text, int, int, int, date, int, int) to authenticated;
grant execute on function public.record_activity(text, int, int, date) to authenticated;
grant execute on function public.unlock_achievement(text) to authenticated;
grant execute on function public.import_local_progress(jsonb) to authenticated;
