-- PersonaPage — how long a link was actually read
--
-- A view says the page opened. A click says they acted. Neither says whether
-- anyone read it: a page opened and abandoned in two seconds and a page read
-- carefully for three minutes are the same row today. That gap is the whole
-- difference between "fourteen people saw it" and "fourteen people considered
-- it", and it is the metric DocSend built a business on.
--
-- Stored on link_views rather than in its own table, because a read time
-- belongs to a specific open. One column, nullable, because most rows will
-- never get one — the beacon is best effort and browsers drop it.
--
-- Idempotent, like 0001 through 0004.

alter table public.link_views add column if not exists dwell_ms integer;

comment on column public.link_views.dwell_ms is
  'Milliseconds the page was visible during this view, client-reported and capped at 30 minutes. Null when the browser never reported one.';

-- The cap is load bearing, not cosmetic. The value is reported by the visitor's
-- browser, so without a ceiling a single crafted request could claim a view
-- lasted a year and poison every average built on the column. Thirty minutes is
-- far longer than anyone spends on a one-screen profile, so a real read is
-- never clipped by it.
alter table public.link_views
  drop constraint if exists link_views_dwell_ms_check;
alter table public.link_views
  add constraint link_views_dwell_ms_check
  check (dwell_ms is null or (dwell_ms >= 0 and dwell_ms <= 1800000));

-- Reading dwell always means "the views for these links that have one", so the
-- partial index carries only the rows that can match.
create index if not exists link_views_dwell_idx
  on public.link_views (link_id)
  where dwell_ms is not null;

-- No new policies. link_views already grants select to the owner and insert to
-- nobody; dwell is written by the server with the service role after it has
-- confirmed the view row belongs to a real link, exactly like the view and the
-- click before it.
