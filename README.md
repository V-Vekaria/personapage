# PersonaPage

**One profile. A different version of it for every room you walk into.**

You don't pitch your side project to a recruiter the way you pitch it to a
co-founder. PersonaPage keeps one master profile and generates a tailored public
page per audience — so the link you hand someone is written for the conversation
you're actually having.

**Live → [personapage-app.vercel.app](https://personapage-app.vercel.app)**

![PersonaPage landing page](.github/assets/landing.png)

---

## How it works

1. **Fill in one profile.** Name, headline, bio, skills, projects, tone. This is
   the only place you maintain anything.
2. **Create a link per audience.** Job application, networking, investor,
   conference, or general.
3. **Generate.** Each context has its own prompt configuration — a different
   audience, a different thing to lead with, a different call to action — so the
   output is genuinely different, not just reworded. Then edit it by hand if you
   want; what you save is exactly what visitors see.
4. **Share it.** Every view is counted per link, so you can see which version of
   you people actually open.

The generator is grounded: it is told never to invent metrics, companies, or
technologies, and any skill the model returns that you didn't claim is stripped
out server-side before it is saved.

---

## Running it

You need Node 22+ and a Supabase project. An OpenAI key is **optional** —
without one, generation falls back to a deterministic template writer and every
feature still works.

```bash
git clone https://github.com/V-Vekaria/personapage.git
cd personapage
npm install
cp .env.example .env.local     # then fill in your Supabase keys
```

Create the schema — run `supabase/migrations/0001_init.sql` against your project,
either with `supabase db push` or by pasting it into the Supabase SQL editor. It
is idempotent, so re-running it on a database that already has data is safe.

```bash
npm run dev                    # http://localhost:3000
```

Sign up at `/signup`, and you have a working profile. To skip the typing, point
`supabase/seed.sql` at the email you signed up with and run it — that fills in a
complete profile and one link per audience.

### Environment variables

| Variable | Required | What it does |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Browser-safe key; every query it makes is gated by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only. Renders public pages for signed-out visitors and records views |
| `OPENAI_API_KEY` | no | Without it, the offline template writer is used |
| `OPENAI_MODEL` | no | Defaults to `gpt-4.1` |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin for social cards; inferred on Vercel |

### Scripts

```bash
npm run dev         # development server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest
```

---

## Architecture

```
app/
  (auth)/           login + signup, server actions, zod-validated
  (dashboard)/      dashboard, profile, links, analytics — all auth-gated
  api/
    ai/generate     generates and saves tailored content for one link
    analytics/view  records a page view after verifying the link exists
  p/[username]/     the public profile page + its dynamic OG image
components/
  analytics/        chart and stat components
  dashboard/        sidebar and mobile navigation
  public/           view capture
  ui/               shared status banner, copy button
lib/
  ai/               prompt builder, per-context config, offline fallback
  supabase/         browser, server and service-role clients
  analytics.ts      pure aggregation over raw view rows
  validation.ts     zod schemas shared by routes and server actions
supabase/
  migrations/       the schema, with RLS policies
  seed.sql          demo data
tests/              vitest unit tests
types/database.ts   shapes mirroring the schema
```

**Next.js 15 App Router, TypeScript (strict), Tailwind v4, Supabase/Postgres,
OpenAI, deployed on Vercel.**

### A few decisions worth explaining

**Row level security does the access control, not the app code.** Profiles and
active links are publicly readable; everything writable is scoped to
`auth.uid()`. The service-role client is used in exactly two places — rendering a
public page for an anonymous visitor, and recording a view — and both are reads
or writes of data that is public by design.

**Views are written server-side, after the link is verified.** The endpoint takes
a UUID, confirms the link exists, and only then inserts. Anonymous clients have
no insert policy on `link_views` at all, so nobody can inflate someone's counter
by POSTing at the API.

**Analytics stores no IP address and no user agent.** A country code from the
edge and a desktop/mobile bucket is the entire payload. A profile page shouldn't
become a tracker.

**Generation is rate limited per user.** Twenty an hour. It's a fixed window held
in memory, which on serverless counts per instance — enough to stop someone
holding down the button and running up a bill, and documented as not being more
than that.

**The offline fallback is a real feature, not a stub.** It reorders skills per
audience, changes sentence order and call to action per context, and is
deterministic — which also makes the whole generation path testable without
mocking an API.

**Tailored links are `noindex`.** A link written for one investor conversation
has no business in a search index. The default profile page is indexable.

---

## Tests

86 unit tests over the parts where being wrong is silent: analytics bucketing
and week-over-week maths, slug generation, contact-link parsing, the offline
generator, the prompt builder, validation schemas, and the rate limiter.

```bash
npm test
```

CI runs typecheck, lint, tests and a production build on every push and pull
request.

---

## Status and roadmap

Working today: auth, profile editor, per-audience link generation with manual
editing, public profile pages with social cards, and per-link analytics.

Next up:

- Custom domains for public profiles
- Profile themes beyond the current one
- Click tracking on outbound contact links, not just page views
- A PDF export of a tailored profile
- Moving the rate limiter into Postgres so it holds across instances

---

## License

MIT — see [LICENSE](LICENSE).
