-- PersonaPage — outbound click tracking
--
-- A view says someone opened the page. A click says they acted on it. The
-- second is the conversion event and until now it was invisible, so "14 views"
-- could mean fourteen people reached out or none of them.
--
-- Idempotent, like 0001 and 0002.

-- ---------------------------------------------------------------------------
-- link_clicks — one row per outbound click on a public profile
--
-- Deliberately the same privacy stance as link_views: no IP address, no user
-- agent. A coarse country from the edge and a desktop/mobile bucket is the
-- whole payload. Tracking who clicked would make this a different product.
-- ---------------------------------------------------------------------------

create table if not exists public.link_clicks (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid not null references public.links (id) on delete cascade,
  -- What was clicked. Only 'contact' exists today; the column is here so the
  -- next clickable thing does not need a migration.
  target     text not null default 'contact',
  referrer   text,
  country    text,
  device     text,
  created_at timestamptz not null default now()
);

alter table public.link_clicks add column if not exists target   text not null default 'contact';
alter table public.link_clicks add column if not exists referrer text;
alter table public.link_clicks add column if not exists country  text;
alter table public.link_clicks add column if not exists device   text;

alter table public.link_clicks
  drop constraint if exists link_clicks_device_check;
alter table public.link_clicks
  add constraint link_clicks_device_check check (device is null or device in ('mobile', 'desktop'));

alter table public.link_clicks
  drop constraint if exists link_clicks_target_check;
alter table public.link_clicks
  add constraint link_clicks_target_check check (char_length(target) between 1 and 40);

create index if not exists link_clicks_link_id_idx    on public.link_clicks (link_id);
create index if not exists link_clicks_created_at_idx on public.link_clicks (created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Same shape as link_views: owners read their own, and nobody gets an insert
-- policy. Clicks are written by the server with the service role after it has
-- confirmed the link exists, which is what stops anyone inflating a counter.
-- ---------------------------------------------------------------------------

alter table public.link_clicks enable row level security;

drop policy if exists "owners read clicks on their links" on public.link_clicks;
create policy "owners read clicks on their links"
  on public.link_clicks for select
  using (
    exists (
      select 1 from public.links
      where links.id = link_clicks.link_id
        and links.user_id = auth.uid()
    )
  );
