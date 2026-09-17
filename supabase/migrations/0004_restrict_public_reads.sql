-- PersonaPage — remove anonymous read access
--
-- 0001 gave `profiles` and `links` blanket public select policies, on the
-- reasoning that the public profile page serves active links to anonymous
-- visitors. That reasoning was wrong: every anonymous read path in this app
-- goes through the service-role client, which bypasses RLS entirely. The
-- browser (anon-key) client is not used anywhere at all.
--
-- So those policies granted access the application never needed, while the
-- anon key is inlined in the deployed JavaScript bundle by design. Anyone
-- could read it out and query PostgREST directly:
--
--   GET /rest/v1/links?is_active=eq.true&select=user_id,label,slug
--
-- which returned every active link for every user. Two things leaked:
--
--   * `links.label` defaults to the recipient when the user leaves it blank,
--     so it holds exactly the private targeting text ("Stripe — Backend
--     Engineer") that 0002 split into link_targets to protect. The dashboard
--     tells the user "Only you see this" about that field.
--   * Every slug was enumerable. lib/slug.ts calls the random suffix
--     "unguessable-ish", which is the whole basis for a tailored link being
--     private to one conversation. A listable slug is not unguessable.
--
-- This migration replaces both policies with owner-only equivalents. After it,
-- the anon role can read nothing. Idempotent, like the others.
--
-- NOTE: this makes SUPABASE_SERVICE_ROLE_KEY load-bearing for public profile
-- pages. It already was — they have always used the admin client — but with
-- these policies gone there is no longer a fallback path that happens to work.

-- profiles ------------------------------------------------------------------

drop policy if exists "profiles are publicly readable" on public.profiles;

drop policy if exists "users read their own profile" on public.profiles;
create policy "users read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- links ---------------------------------------------------------------------

drop policy if exists "active links are publicly readable" on public.links;

drop policy if exists "users read their own links" on public.links;
create policy "users read their own links"
  on public.links for select
  using (auth.uid() = user_id);
