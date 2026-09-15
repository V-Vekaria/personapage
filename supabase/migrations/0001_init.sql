-- PersonaPage — core schema
--
-- Safe to run against an existing project: every statement is idempotent.
-- Nothing here drops a table or a column, so running it on a database that
-- already holds real rows only fills in what is missing.
--
-- Apply with: supabase db push
-- Or paste into the Supabase SQL editor and run.

-- ---------------------------------------------------------------------------
-- profiles — one row per user, the single source the AI generates from
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null unique,
  full_name   text,
  contact     text,
  headline    text,
  bio         text,
  skills      text[]  not null default '{}',
  projects    jsonb   not null default '[]'::jsonb,
  tone        text    not null default 'neutral',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Additive backfill for projects created before these columns existed.
alter table public.profiles add column if not exists full_name  text;
alter table public.profiles add column if not exists contact    text;
alter table public.profiles add column if not exists headline   text;
alter table public.profiles add column if not exists bio        text;
alter table public.profiles add column if not exists skills     text[] not null default '{}';
alter table public.profiles add column if not exists projects   jsonb  not null default '[]'::jsonb;
alter table public.profiles add column if not exists tone       text   not null default 'neutral';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Usernames are compared case-insensitively when resolving /p/[username],
-- so the uniqueness guarantee has to be case-insensitive too.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

alter table public.profiles
  drop constraint if exists profiles_tone_check;
alter table public.profiles
  add constraint profiles_tone_check check (tone in ('casual', 'neutral', 'formal'));

-- ---------------------------------------------------------------------------
-- links — one shareable, audience-tailored version of a profile
-- ---------------------------------------------------------------------------

create table if not exists public.links (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  context           text not null default 'general',
  label             text not null default '',
  slug              text not null unique,
  generated_content jsonb,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.links add column if not exists generated_content jsonb;
alter table public.links add column if not exists is_active  boolean not null default true;
alter table public.links add column if not exists label      text not null default '';
alter table public.links add column if not exists created_at timestamptz not null default now();
alter table public.links add column if not exists updated_at timestamptz not null default now();

alter table public.links
  drop constraint if exists links_context_check;
alter table public.links
  add constraint links_context_check check (
    context in ('job_application', 'networking', 'investor', 'conference', 'general')
  );

create index if not exists links_user_id_idx on public.links (user_id);
create index if not exists links_slug_idx    on public.links (slug);

-- ---------------------------------------------------------------------------
-- link_views — one row per public profile view
--
-- Deliberately stores no IP address and no user agent: a coarse country code
-- and a desktop/mobile bucket are enough to answer "is this link working?"
-- without turning a profile page into a tracker.
-- ---------------------------------------------------------------------------

create table if not exists public.link_views (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid not null references public.links (id) on delete cascade,
  referrer   text,
  country    text,
  device     text,
  created_at timestamptz not null default now()
);

-- The app has always sent `device`; older databases never had the column.
alter table public.link_views add column if not exists device  text;
alter table public.link_views add column if not exists country text;

alter table public.link_views
  drop constraint if exists link_views_device_check;
alter table public.link_views
  add constraint link_views_device_check check (device is null or device in ('mobile', 'desktop'));

create index if not exists link_views_link_id_idx    on public.link_views (link_id);
create index if not exists link_views_created_at_idx on public.link_views (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists links_touch_updated_at on public.links;
create trigger links_touch_updated_at
  before update on public.links
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Profiles and active links are readable by anyone: that is the whole point of
-- a public profile page. Writes are always scoped to the owning user.
-- ---------------------------------------------------------------------------

alter table public.profiles   enable row level security;
alter table public.links      enable row level security;
alter table public.link_views enable row level security;

-- profiles ------------------------------------------------------------------

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "users insert their own profile" on public.profiles;
create policy "users insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- links ---------------------------------------------------------------------

drop policy if exists "active links are publicly readable" on public.links;
create policy "active links are publicly readable"
  on public.links for select
  using (is_active or auth.uid() = user_id);

drop policy if exists "users insert their own links" on public.links;
create policy "users insert their own links"
  on public.links for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update their own links" on public.links;
create policy "users update their own links"
  on public.links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users delete their own links" on public.links;
create policy "users delete their own links"
  on public.links for delete
  using (auth.uid() = user_id);

-- link_views ----------------------------------------------------------------
--
-- Views are written by the server (service role) after it has confirmed the
-- link exists, so anonymous clients get no insert policy here — that is what
-- stops anyone from inflating someone else's view count by hand.

drop policy if exists "owners read views of their links" on public.link_views;
create policy "owners read views of their links"
  on public.link_views for select
  using (
    exists (
      select 1 from public.links
      where links.id = link_views.link_id
        and links.user_id = auth.uid()
    )
  );
