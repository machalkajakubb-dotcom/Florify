-- ================================================================
-- FLORIFY – Kompletní Supabase schéma (v2 – přidány záhony)
-- Spusťte v Supabase → SQL Editor → New Query → Run
-- ================================================================

-- 1. Profily uživatelů
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  city text not null default 'Praha',
  language text not null default 'cs',
  created_at timestamptz default now()
);

-- 2. Rostliny uživatele
create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plant_id text not null,
  name text not null,
  emoji text not null default '🌱',
  added_at timestamptz default now()
);

-- 3. Chat zprávy
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- 4. Záhony *** NOVÁ TABULKA ***
create table if not exists public.garden_beds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  note text not null default '',
  year integer not null default extract(year from now())::integer,
  cols integer not null default 5,
  rows integer not null default 3,
  cells jsonb not null default '[]',
  created_at timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.plants        enable row level security;
alter table public.chat_messages enable row level security;
alter table public.garden_beds   enable row level security;

-- Profiles
create policy if not exists "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy if not exists "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy if not exists "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Plants
create policy if not exists "plants_select" on public.plants for select using (auth.uid() = user_id);
create policy if not exists "plants_insert" on public.plants for insert with check (auth.uid() = user_id);
create policy if not exists "plants_delete" on public.plants for delete using (auth.uid() = user_id);

-- Chat
create policy if not exists "chat_select" on public.chat_messages for select using (auth.uid() = user_id);
create policy if not exists "chat_insert" on public.chat_messages for insert with check (auth.uid() = user_id);

-- Garden beds
create policy if not exists "beds_select" on public.garden_beds for select using (auth.uid() = user_id);
create policy if not exists "beds_insert" on public.garden_beds for insert with check (auth.uid() = user_id);
create policy if not exists "beds_update" on public.garden_beds for update using (auth.uid() = user_id);
create policy if not exists "beds_delete" on public.garden_beds for delete using (auth.uid() = user_id);

-- ── Trigger: auto-vytvořit profil po registraci ─────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
