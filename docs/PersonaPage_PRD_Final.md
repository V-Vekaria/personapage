# PersonaPage — Complete Reference Document
> Solo MVP · London Tech Week · AI-Powered Identity Platform

---

## Quick Reference Card

| | |
|---|---|
| **Core mechanic** | Context-first smart links from one master profile |
| **Wedge user** | CS students & early-career developers |
| **Stack** | Next.js 15 · TypeScript · Supabase · OpenAI · Vercel |
| **Build time** | ~14 days, solo developer |
| **Demo target** | London Tech Week |
| **Key metric** | Avg. unique links shared per active user per month (target: ≥ 3) |

---

## The One-Line Pitch
> "Stop sending the same portfolio to everyone. PersonaPage gives each person the version of you that actually speaks to them."

---

## Core Product Thesis

**The contrarian belief:** Every other portfolio tool optimises for how YOU present yourself. PersonaPage optimises for how THEY perceive you. The viewer is the variable — not the content.

**The core mechanic:**
```
ONE master profile (private)
    → AI generates N contextual views
    → Each view = one unique public link
    → Analytics per link pull users back
```

**Falsifiability test:** If users never share a second link beyond their first, the thesis is wrong. Pivot to best-single AI portfolio tool.

---

## Recommended Stack (locked)

```
Next.js 15 App Router + TypeScript
TailwindCSS
Supabase (auth + PostgreSQL + RLS)
OpenAI API (gpt-4o with json_object response format)
Vercel (hosting + edge headers for geo analytics)
Resend (view notification emails)
Zod (AI output schema validation)
React Hook Form (profile editor)
```

---

## Folder Structure

```
personapage/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/signup/page.tsx
│   ├── (auth)/layout.tsx
│   ├── (dashboard)/layout.tsx        ← sidebar shell
│   ├── (dashboard)/dashboard/page.tsx
│   ├── (dashboard)/profile/page.tsx
│   ├── (dashboard)/links/page.tsx
│   ├── (dashboard)/links/[id]/page.tsx
│   ├── (dashboard)/settings/page.tsx
│   ├── p/[username]/page.tsx         ← PUBLIC profile (SSR)
│   ├── api/ai/generate/route.ts
│   ├── api/analytics/view/route.ts
│   └── api/links/route.ts
├── components/
│   ├── ui/          (Button, Input, Card, Badge, Spinner, EmptyState)
│   ├── dashboard/   (Sidebar, TopBar, LinkCard, StatsBar)
│   ├── profile/     (ProfileForm, ProjectItem, SkillsInput, ToneSelector)
│   ├── public/      (PublicProfile, ProjectCard, SkillsDisplay, ViewCapture)
│   └── analytics/   (ViewsChart, RecentViews)
├── lib/
│   ├── supabase.ts   ← client + server exports
│   ├── ai.ts         ← ALL OpenAI logic
│   ├── prompts.ts    ← prompt builders
│   ├── analytics.ts  ← view capture logic
│   ├── validations.ts← Zod schemas
│   └── utils.ts
├── hooks/
│   ├── useProfile.ts
│   ├── useCopyLink.ts
│   └── useAnalytics.ts
├── types/index.ts    ← ALL shared types in one file
├── middleware.ts     ← auth guard
└── supabase/migrations/
    ├── 001_schema.sql
    ├── 002_indexes.sql
    └── 003_rls.sql
```

---

## Route Map

```
PUBLIC:
  GET  /                    Landing + redirect
  GET  /login               Login
  GET  /signup              Signup
  GET  /p/[username]        Public shareable profile (SSR)

PROTECTED:
  GET  /dashboard           Link list + overview
  GET  /profile             Master profile editor
  GET  /links               Manage context links
  GET  /links/[id]          Per-link analytics
  GET  /settings            Account (stub for V1)

API:
  POST /api/ai/generate     Trigger AI generation (auth required)
  POST /api/analytics/view  Record view (no auth, service role)
  POST /api/links           Create context link (auth required)
```

> **URL decision:** Use `/p/[username]` not `/[username]` — avoids route collisions with `/dashboard`, `/login`, `/api`.

---

## Database Schema (Supabase/PostgreSQL)

### Tables

| Table | Purpose |
|---|---|
| `users` | App-level data, mirrors auth.users |
| `profiles` | Master profile — single source of truth |
| `projects` | Ordered array of projects per profile |
| `skills` | Flat skill tags with category |
| `links` | Each shareable contextual link |
| `generated_content` | Cached AI output per link (upserted on regen) |
| `page_views` | Analytics — append-only, never updated |

### Key relationships
```
auth.users → 1:1 → public.users
public.users → 1:1 → profiles
profiles → 1:N → projects
profiles → 1:N → skills
public.users → 1:N → links
links → 1:1 → generated_content
links → 1:N → page_views
```

### Critical constraints
- `users.username` — UNIQUE, regex `^[a-z0-9_-]{3,30}$`
- `links(user_id, slug)` — UNIQUE
- `generated_content.link_id` — UNIQUE (one cached view per link)
- `page_views` — append-only, insert via service role key only

### RLS rules
- `users/profiles/projects/skills` — own for write, public SELECT
- `links` — own for write; public SELECT on `is_active = true`
- `generated_content` — own for write; public SELECT
- `page_views` — service role INSERT; own SELECT

---

## AI System

### What stays fixed (never modified by AI)
- Project titles, company names, technology names
- Any metric the user provided ("40% faster", "2,000 users")
- Dates, institutions, URLs

### What changes per context
- Headline framing
- Project ordering and description emphasis
- Skills ordering
- CTA text

### Context configs
| Context | Focus |
|---|---|
| `recruiter` | Technical credibility, shipped products, measurable outcomes |
| `founder` | Product thinking, builder mentality, ownership |
| `client` | Delivery track record, reliability, scope management |
| `general` | Balanced overview |

### Hallucination prevention
1. **Schema enforcement** — Always JSON, always Zod-validated
2. **Fact anchoring** — Prompt explicitly lists ground-truth fields
3. **Title validation** — Code removes any project the AI invented

### Retry logic
- Max 3 attempts with 1s/2s/3s backoff
- Never save partial output — only upsert on full schema pass
- Vercel function timeout: 30 seconds

### Caching
- `generated_content` table IS the cache
- Public page reads from DB — never calls OpenAI
- Regeneration is explicit (user clicks "Regenerate")

---

## API Design

### POST /api/ai/generate
```
Request:  { link_id: string }
Auth:     Required
Response: { content: GeneratedContent }
Errors:   MISSING_LINK_ID | NOT_OWNER | GENERATION_FAILED | AI_UNAVAILABLE
```

### POST /api/analytics/view
```
Request:  { link_id, referrer, device }
Auth:     None (service role server-side)
Response: Always 200 { ok: true }
Server adds: country + city from Vercel headers
```

### GET /api/analytics/[linkId]
```
Auth:     Required
Response: {
  total_views, views_last_7_days,
  views_by_day[],   // last 30 days
  recent_views[],   // last 20
  top_referrers[]   // top 5 domains
}
```

---

## State Management

**Rule: as little client state as possible.**

```
Server state (Server Components):    user data, link list, analytics, profile
Client state (useState):             form inputs, edit toggle, copy feedback, loading
Forms:                               React Hook Form (not custom state)
Mutations:                           Server Actions for form submissions
                                     API routes for AI generation + analytics
```

No Zustand. No Redux. No React Query. This is sufficient for MVP.

---

## SSR vs CSR Rules

```
Server Components (default):
  All layouts, all page roots, dashboard, profile page,
  analytics page, public profile page

Client Components (add 'use client' only for):
  Profile editor form (onChange)
  Copy link button (clipboard API)
  Analytics chart (recharts needs browser)
  ViewCapture (fires analytics on mount)
  Toast notifications
```

---

## 14-Day Build Order

| Days | Focus | Exit criteria |
|---|---|---|
| Day 1 | Setup + deploy | Vercel + Supabase connected, env vars working |
| 2–3 | Auth + user creation | Full auth flow works end-to-end |
| 4–5 | Profile editor | Save profile, reload, data persists |
| 6–7 | AI generation | All 4 context types generate + pass Zod |
| 8–9 | Public page | Share link with someone, they can see it |
| 10–11 | Dashboard + analytics | View counts visible, email notification fires |
| 12–13 | Polish | Empty states, mobile, error boundaries |
| Day 14 | Demo prep | Signup → share link in under 5 minutes |

**Day 7 gate:** If AI output sounds generic, fix the prompt before proceeding. This is the only gate that matters.

---

## Feature Tiers

### Build now (V1)
- ✓ Master profile builder (headline, projects, skills, experience, tone)
- ✓ 4 context types: recruiter, founder, client, general
- ✓ AI generation with Zod validation + retry
- ✓ Unique shareable link per context
- ✓ Basic analytics (views, location, device, referrer)
- ✓ View notification email (Resend)
- ✓ Inline editing of generated fields

### Build after 10 users (V2)
- → Custom context creator
- → GitHub project import
- → Link expiry / password protection
- → Custom slugs
- → Analytics: session depth, referrer breakdown

### Never build (MVP)
- ✗ Mobile app (responsive web is enough)
- ✗ Team accounts
- ✗ Resume PDF export
- ✗ Social feed or profile discovery
- ✗ Real-time auto-detection of viewer
- ✗ Payments (until 50 users ask)

---

## Technical Risks

### Critical
| Risk | Mitigation |
|---|---|
| AI output sounds generic | Test prompt with 5 real profiles before building UI |
| Service role key in client code | SUPABASE_SERVICE_ROLE_KEY must never be in NEXT_PUBLIC_ |
| No content on first public view | Always handle null generated_content with fallback state |

### Common Next.js mistakes to avoid
- `useEffect` for data fetching — fetch in Server Components
- `'use client'` on layouts — extract only the interactive child
- Calling OpenAI on every public page load — use generated_content cache
- Building skeletons before features work — features first, polish second

### Acceptable technical debt
String error codes, inline queries, console.error logging, CSS charts, plain text emails, single types file

### Dangerous technical debt
Unvalidated service role key placement, missing null checks on generated_content, no slug collision handling in UI

---

## Validation Metrics

**Single most important:** Avg. unique links shared per active user per month
- ≥ 3: thesis confirmed
- = 1: thesis wrong → pivot to single best-profile tool
- = 0 after 2 weeks: onboarding broken → fix immediately

| Week | Metric | Target |
|---|---|---|
| W1–2 | Onboarding completion | > 60% reach "link created" |
| W3–5 | Links shared per user | ≥ 1 within first week |
| W4–6 | Return visits (7 days) | > 40% |
| W5–8 | Email open rate | > 50% |
| W8+ | Links/user/month | ≥ 3 |

---

## The Five Architecture Principles

1. **Build AI prompt quality before UI.** Generic output kills trust permanently.
2. **The public page is your most important page.** It is what London Tech Week sees.
3. **Keep Supabase queries in page files.** No unnecessary abstraction layer.
4. **Name things for what they do.** `generateProfileContent()` beats `AIService.generate()`.
5. **The demo is the product.** Time the signup → share flow. If it takes more than 5 minutes, you have a UX problem.

---

*PersonaPage Complete Reference · London Tech Week MVP · Solo Builder Edition*
