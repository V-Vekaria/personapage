# PersonaPage

**One profile. A different version of it for every room you walk into.**

You don't pitch your side project to a recruiter the way you pitch it to a
co-founder. PersonaPage keeps one master profile and generates a tailored public
page per audience — so the link you hand someone is written for the conversation
you're actually having.

**Live → [personapage-app.vercel.app](https://personapage-app.vercel.app)** · **[Try it with no account](https://personapage-app.vercel.app/try)**

![PersonaPage landing page](.github/assets/landing.png)

## Try it without signing up

Nobody types their bio into a signup form to find out whether a product is any
good, so `/try` works with no account: three free generations, prefilled so the
first one is a single click.

Generate once, switch audience, generate again — the two sit side by side and
the facts never changed, only what leads.

![The try page, showing the same profile written for two different audiences](.github/assets/try.png)

Nothing is written to the database on that path. The draft goes up in the
request, the content comes back in the response, and that's the whole lifecycle,
so a visitor leaves no rows behind and hands over no personal data before
deciding to sign up. What they typed carries into signup and lands on their
profile, so making an account saves work rather than asking for it twice.

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
    ai/try          anonymous generation — validates, rate limits, persists nothing
    analytics/view  records a page view after verifying the link exists
  p/[username]/     the public profile page + its dynamic OG image
  try/              the no-account demo
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

**The anonymous trial has two limits doing two different jobs.** A signed
httpOnly cookie holds the count the UI shows; it's HMAC-signed so it can't be
casually edited, but a rejected cookie is indistinguishable from a first visit,
so clearing cookies resets the trial. That's accepted, and asserted in a test
rather than left as a surprise. The per-IP rate limit is what actually bounds
cost. Every input field on that endpoint is hard-capped — without caps it would
be a free LLM proxy for anyone willing to paste a few thousand words into a
"bio" field.

**The offline fallback is a real feature, not a stub.** It reorders skills per
audience, changes sentence order and call to action per context, and is
deterministic — which also makes the whole generation path testable without
mocking an API.

**Tailored links are `noindex`.** A link written for one investor conversation
has no business in a search index. The default profile page is indexable.

---

## Tests

113 unit tests over the parts where being wrong is silent: analytics bucketing
and week-over-week maths, slug generation, contact-link parsing, the offline
generator, the prompt builder, validation schemas, the rate limiter, and the
signed trial cookie (including that a forged one is rejected).

```bash
npm test
```

CI runs typecheck, lint, tests and a production build on every push and pull
request.

---

## Status and direction

Working today: a no-account demo, auth, profile editor, per-audience link
generation with manual editing, public profile pages with social cards, and
per-link analytics.

**[PRODUCT.md](PRODUCT.md)** is the honest version of where this goes — who
actually has this problem, what Linktree and Teal and DocSend already do, why
the five audience categories are too coarse, and why the tracking is probably
worth more than the AI writing. It includes a candid read on viability, since
"finish it because it demonstrates something" is a legitimate reason that does
not need dressing up as a startup.

Nearest concrete work:

- Per-recipient links — one per company or person, not per abstract category
- Generate against a pasted job description
- Notify on first open; track outbound contact clicks, not just page views
- Move the rate limiter into Postgres so it holds across instances

---

## License

MIT — see [LICENSE](LICENSE).
