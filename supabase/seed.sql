-- PersonaPage — demo data
--
-- This seed does NOT create an auth user. Supabase manages `auth.users` and
-- hand-inserting rows there breaks in subtle, version-dependent ways. Instead:
--
--   1. Run `supabase/migrations/0001_init.sql`
--   2. Sign up through the app at /signup
--   3. Set the email below to the one you signed up with
--   4. Run this file
--
-- It fills that account with a complete profile and one link per audience, so
-- you can see every context side by side without typing anything in.

do $$
declare
  demo_email text := 'demo@personapage.local';  -- <- change me
  demo_id    uuid;
  demo_user  text;
begin
  select id into demo_id from auth.users where email = demo_email;

  if demo_id is null then
    raise exception
      'No auth user with email %. Sign up through the app first, then set demo_email in this file.',
      demo_email;
  end if;

  update public.profiles set
    full_name = 'Vishnu Vekaria',
    headline  = 'Computing systems student building AI products',
    bio       = 'I build full-stack products end to end — usually starting from a problem I ran into myself. '
                'Most of my time goes into backend architecture and making AI features that are actually useful '
                'rather than bolted on.',
    contact   = 'linkedin.com/in/yourname',
    skills    = array['TypeScript', 'Next.js', 'React', 'PostgreSQL', 'Supabase', 'Python', 'System Design'],
    tone      = 'neutral',
    projects  = '[
      {
        "title": "PersonaPage",
        "description": "One profile, many audiences. Generates a tailored public page per context so you never send the same generic bio to a recruiter and a co-founder.",
        "tech": ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "OpenAI"]
      },
      {
        "title": "Ledger",
        "description": "Self-hosted expense tracker that parses bank statement PDFs and categorises transactions without sending them to a third party.",
        "tech": ["Python", "FastAPI", "SQLite", "React"]
      }
    ]'::jsonb
  where id = demo_id;

  select username into demo_user from public.profiles where id = demo_id;

  insert into public.links (user_id, context, label, slug, is_active)
  values
    (demo_id, 'job_application', 'Backend roles',      demo_user || '-job-application-demo', true),
    (demo_id, 'networking',      'Meetups',            demo_user || '-networking-demo',      true),
    (demo_id, 'investor',        'Investor intro',     demo_user || '-investor-demo',        true),
    (demo_id, 'conference',      'Conference badge',   demo_user || '-conference-demo',      true),
    (demo_id, 'general',         'Everywhere else',    demo_user || '-general-demo',         true)
  on conflict (slug) do nothing;

  raise notice 'Seeded profile and % links for %', 5, demo_email;
end $$;
