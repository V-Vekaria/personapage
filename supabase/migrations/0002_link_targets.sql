-- PersonaPage — per-recipient link targeting
--
-- Turns a link from "a version of me" into "the link I sent to one specific
-- company or person", and lets that link be written against the actual job
-- posting rather than an abstract audience category.
--
-- Idempotent, like 0001. Safe to run against a database already in use.

-- ---------------------------------------------------------------------------
-- link_targets — who this link is for, and what it is aimed at
--
-- Deliberately a separate table rather than columns on `links`.
--
-- `links` is readable by the public: the profile page serves any active link to
-- anonymous visitors. A pasted job description is not public material — it can
-- carry a recruiter's name, an unlisted role, internal salary bands, or text
-- the company never published. Keeping it in a table with no public policy
-- means it cannot be leaked by a careless `select('*')` on the public path.
-- The generated content derived from it is public; the source text is not.
-- ---------------------------------------------------------------------------

create table if not exists public.link_targets (
  link_id     uuid primary key references public.links (id) on delete cascade,
  -- Who this is going to: "Stripe", "Jane at Acme", "Backend role, Monzo".
  recipient   text not null default '',
  -- Where the posting lives, if it is online.
  source_url  text,
  -- The pasted posting. Capped in the application; capped again here so a
  -- direct database write cannot smuggle in a novel.
  description text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.link_targets add column if not exists source_url text;
alter table public.link_targets add column if not exists created_at timestamptz not null default now();
alter table public.link_targets add column if not exists updated_at timestamptz not null default now();

alter table public.link_targets
  drop constraint if exists link_targets_description_length;
alter table public.link_targets
  add constraint link_targets_description_length check (char_length(description) <= 12000);

alter table public.link_targets
  drop constraint if exists link_targets_recipient_length;
alter table public.link_targets
  add constraint link_targets_recipient_length check (char_length(recipient) <= 160);

drop trigger if exists link_targets_touch_updated_at on public.link_targets;
create trigger link_targets_touch_updated_at
  before update on public.link_targets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security — owner only, in every direction.
--
-- Note the absence of a public select policy. That absence is the feature.
-- ---------------------------------------------------------------------------

alter table public.link_targets enable row level security;

drop policy if exists "owners read their link targets" on public.link_targets;
create policy "owners read their link targets"
  on public.link_targets for select
  using (
    exists (
      select 1 from public.links
      where links.id = link_targets.link_id
        and links.user_id = auth.uid()
    )
  );

drop policy if exists "owners insert their link targets" on public.link_targets;
create policy "owners insert their link targets"
  on public.link_targets for insert
  with check (
    exists (
      select 1 from public.links
      where links.id = link_targets.link_id
        and links.user_id = auth.uid()
    )
  );

drop policy if exists "owners update their link targets" on public.link_targets;
create policy "owners update their link targets"
  on public.link_targets for update
  using (
    exists (
      select 1 from public.links
      where links.id = link_targets.link_id
        and links.user_id = auth.uid()
    )
  );

drop policy if exists "owners delete their link targets" on public.link_targets;
create policy "owners delete their link targets"
  on public.link_targets for delete
  using (
    exists (
      select 1 from public.links
      where links.id = link_targets.link_id
        and links.user_id = auth.uid()
    )
  );
