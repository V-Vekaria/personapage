# PersonaPage — Product Requirements Document

**Version:** 1.0  
**Status:** Phase 1 Complete — Ready for Development  
**Last Updated:** 2025  
**Author:** Solo Builder  
**Working Title:** IdentityOS  

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Product Vision](#2-product-vision)
3. [Problem Statement](#3-problem-statement)
4. [Core Product Thesis](#4-core-product-thesis)
5. [Ideal Customer Profile](#5-ideal-customer-profile)
6. [User Personas](#6-user-personas)
7. [Product Positioning](#7-product-positioning)
8. [Competitive Landscape](#8-competitive-landscape)
9. [Product Direction Decision](#9-product-direction-decision)
10. [User Flows](#10-user-flows)
11. [Core Features](#11-core-features)
12. [AI System Design](#12-ai-system-design)
13. [Database / Data Model](#13-database--data-model)
14. [Technical Architecture](#14-technical-architecture)
15. [Analytics System](#15-analytics-system)
16. [MVP Scope](#16-mvp-scope)
17. [V2 Opportunities](#17-v2-opportunities)
18. [Non-Goals](#18-non-goals)
19. [Risks & Assumptions](#19-risks--assumptions)
20. [Validation Metrics](#20-validation-metrics)
21. [90-Day Execution Roadmap](#21-90-day-execution-roadmap)

---

## 1. Product Overview

**PersonaPage** is a smart link product for professional identity. Users build one private master profile. The AI generates multiple audience-specific public views from that profile. Each view has a unique shareable link. Analytics show who opened what and when.

The core loop in one sentence: **build once, share the right version, see who's reading.**

| Attribute | Detail |
|---|---|
| Product type | Smart link + AI profile renderer |
| Primary user | CS students and early-career developers |
| Core mechanic | Context-first smart links from one master profile |
| Tech stack | Next.js, Supabase, Claude API (or GPT-4o) |
| Build type | Solo, MVP-first |
| Current phase | Phase 1 complete — entering development |

---

## 2. Product Vision

> *A world where every link you share shows exactly the right version of you to exactly the right person.*

Professionals lose opportunities not because they lack skill — but because they present the same static identity to every audience. A startup recruiter and a FAANG recruiter want to see different things. A potential co-founder and a potential client want completely different stories. PersonaPage makes your professional identity as contextual as a real conversation.

**The contrarian bet:**  
The problem is not that people cannot write about themselves. The problem is that one link was never supposed to work for everyone. Professional identity should be audience-aware by default.

**Why now:**  
LLMs can model audience intent with enough fidelity to reframe narrative without losing authentic voice. This was not reliably true before 2023. It is reliable enough to build on now.

---

## 3. Problem Statement

### The situation

CS students, early-career developers, and technical builders maintain one version of their portfolio or CV and share it universally — to startup founders, FAANG recruiters, potential collaborators, and freelance clients alike.

### The trigger moment

The exact moment you paste your GitHub link or portfolio URL into a cold message, job application, or hackathon bio and think: *"This doesn't quite fit what they're looking for."*

### What people do today

- Maintain 3–4 manually updated versions across Google Docs, Notion, and PDFs
- Send the generic version and hope it lands
- Spend 20–40 minutes rewriting their bio for each outreach before giving up
- Use the same CV for roles that require completely different framings

### Why existing tools fail

| Tool | What it misses |
|---|---|
| LinkedIn | One public profile, no audience adaptation |
| Notion portfolio | Static, manually updated, single view |
| Resume builders | File output — not a live, updatable link |
| Read.cv / Polywork | Better aesthetics, still single-version identity |
| Linktree | Link aggregation, zero identity depth |

**None of them treat the viewer as a variable.**

### The cost

- **Tangible:** Missed interviews, low cold-outreach response rates, weak first impressions
- **Intangible:** The persistent anxiety of knowing your work is good but your presentation does not do it justice

### Frequency

Every job application. Every cold DM. Every hackathon intro. For an active job-seeker or networker: 5–15 times per week.

---

## 4. Core Product Thesis

### The contrarian belief

Every other portfolio tool optimises for how **you** present yourself. PersonaPage optimises for how **they** perceive you. The viewer is the variable — not the content.

### The core mechanic

```
User creates ONE master profile (private, never shared directly)
    ↓
AI generates N audience-specific views from that profile
    ↓
Each view gets a unique public link
    ↓
User shares the right link to the right person
    ↓
Analytics show who opened what — pulling the user back
```

### The compounding mechanic

- More projects added → richer source material for every context version
- More links shared → more analytics data on what resonates per audience type
- More views → notification emails → more reasons to return and update
- The product becomes more useful the more actively someone uses it

### The 90-day falsifiability test

> If users create an account but never share a **second** contextual link beyond their first, the thesis is wrong. It would mean people do not need multiple versions — they need one better version. That outcome pivots the product toward a smarter single-profile AI builder, not an adaptive identity platform.

Watch this metric from day one.

---

## 5. Ideal Customer Profile

**Primary segment:**  
CS students in their final 1–2 years, or recent graduates (0–2 years experience), actively job hunting, freelancing, or building side projects — who care about being taken seriously as builders rather than just students.

### Demographics

| Attribute | Value |
|---|---|
| Age range | 20–26 |
| Career stage | Student → junior / early career |
| Technical comfort | Comfortable with developer tools; wants zero-config UX |
| Context | University, hackathons, tech Twitter/X, Discord builder communities |

### Behavioural signals

- Has a GitHub profile but no clean portfolio page
- Has applied to 10+ roles with the same CV
- Actively attends hackathons or builder meetups
- Follows build-in-public culture on Twitter/X
- Has previously tried Notion, Linktree, or Read.cv

### Psychographic profile

| Dimension | Detail |
|---|---|
| Cares about | Being perceived as a real builder, not just a student |
| Afraid of | Being overlooked because their presentation is weak |
| Believes | Their actual work is better than their current CV shows |
| Self-aware about | Knowing they need different stories for different audiences, but lacking the time to maintain them manually |

### Where to reach them

- University CS Discord servers and Slack groups
- Hackathon platforms: MLH, Devpost participant lists
- Twitter/X: `#buildinpublic`, `#100DaysOfCode`
- Reddit: `r/cscareerquestions`, `r/webdev`
- Dev.to and Hashnode comment sections
- LinkedIn: CS students with "open to work" status

### Adoption triggers vs. barriers

| Type | Detail |
|---|---|
| **Will switch when** | Gets ghosted after a strong technical interview and realises their portfolio link led with the wrong story for that audience |
| **Will not adopt if** | AI-generated content does not sound like them, or onboarding takes more than 10 minutes |
| **Churn trigger** | Creating and maintaining multiple versions becomes more manual work than just writing it themselves |

---

## 6. User Personas

### Persona 1 — Aryan: The Overlooked Builder

> *"His GitHub has 40 repos. His CV makes him look like every other student."*

**Role:** Final-year CS student, building side projects, applying to startups and mid-size tech companies

| Field | Detail |
|---|---|
| Primary goal | Land a SWE internship or junior role at a startup |
| Secondary goal | Be taken seriously at hackathons and builder events |
| Frustration 1 | Startup recruiters want to see product impact; FAANG wants structured technical CV — the same link fails both |
| Frustration 2 | No way to know whether anyone actually opened his portfolio link |
| Current workflow | Updates the same Google Doc CV, exports PDF, uploads to every application, sends GitHub link in every cold DM |
| Sign-up trigger | Gets rejected after a strong technical round and realises his profile led with university coursework, not his best shipped project |
| Success | Gets a reply from cold outreach within 48 hours — his AI-focused project link sent to an AI startup recruiter actually landed |
| Churn risk | AI-generated versions sound generic and do not reflect his actual voice |

---

### Persona 2 — Priya: The Multi-Hat Founder

> *"She's three different people professionally — and has one LinkedIn that captures none of them."*

**Role:** Recent CS grad, freelancing as a developer while building a side startup, actively looking for a technical co-founder

| Field | Detail |
|---|---|
| Primary goal | Find a technical co-founder who matches her vision |
| Secondary goal | Land 2–3 freelance clients to fund her runway |
| Frustration 1 | Founder networking requires a completely different story than client pitching — same link fails both |
| Frustration 2 | Manually maintaining multiple versions of her profile is exhausting with unclear ROI |
| Current workflow | Has a LinkedIn (corporate-feeling), a Notion page (projects only), and writes a custom intro paragraph for every outreach manually |
| Sign-up trigger | Heading to a tech meetup where she needs to share her profile with a potential client AND a potential co-founder in the same evening |
| Success | Creates two smart links before the event, one per audience, and follows up knowing exactly which version each person saw |
| Churn risk | Managing multiple versions becomes more work than writing manually |

---

## 7. Product Positioning

### The problem with "adaptive identity platform"

It requires a paragraph to explain. You have five seconds. If someone nods politely after you explain it, it failed.

### Recommended positioning

**Hero headline:**
> Stop sending the same portfolio to everyone.  
> PersonaPage gives each person the version of you that actually speaks to them.

**Tagline:**
> Smart links for your professional identity.

**10-second verbal pitch:**
> "You know how you have one portfolio page that you send to everyone — recruiters, startup founders, potential collaborators — and it never quite fits any of them? PersonaPage lets you create different links from one profile. Each link shows a different version of you, tuned for whoever you're sending it to. You share the recruiter link to recruiters. You share the founder link to founders. Same you. Right version. Every time."

### How to describe it on your own CV / in interviews

> "I identified a structural problem in professional self-presentation: people use one static portfolio for every audience. I built PersonaPage — an AI product that generates audience-specific profile views from a single master profile, delivered via context-aware smart links with built-in analytics. I designed the product architecture, defined the AI system logic including hallucination prevention and tone consistency, and built the full stack solo using Next.js, Supabase, and the Claude API."

---

## 8. Competitive Landscape

| Tool | Does well | Structural miss |
|---|---|---|
| LinkedIn | Distribution, credibility, recruiter reach | One profile, zero audience adaptation |
| Read.cv | Clean aesthetic, builder community feel | Static, no AI layer, single-version |
| Notion portfolio | Flexible layout, free tier | No audience awareness, fully manual |
| Polywork | Multi-role identity framing | Manual, no smart links, no analytics |
| Resume builders (Enhancv, Kickresume) | CV formatting and templates | File output — not a live, updatable link |
| Linktree | Simple link aggregation | Zero identity depth, no contextual rendering |
| Gamma / Tome | AI-powered presentations | Not identity-focused, wrong use case |

### The unowned gap

Nobody owns: **live link + adaptive profile + audience context + per-link analytics.**

- Linktree owns links but has no identity depth
- LinkedIn owns professional identity but has no adaptation
- Resume builders output files, not links
- No tool treats the viewer as a variable

### Honest competitive threat

LinkedIn could ship "audience modes" tomorrow. Notion could add AI persona layers next quarter. The moat in Year 1 is not technology — it is UX focus, speed of iteration, and workflow lock-in for this specific user pain. Once a user's smart links are embedded in emails, DMs, and job applications across the internet, switching costs are real.

---

## 9. Product Direction Decision

### Decision: PersonaPage is a smart link product, not a profile platform

The profile is the backend. The link is the product.

```
MASTER PROFILE  (private, never shared directly)
  projects · skills · experience · tone · goals
            |
            | AI rendering layer
     ┌──────┼──────┐
     ↓      ↓      ↓
  /recruiter  /founder  /client
  
  Each link = a live, public, audience-specific view
  Each link = its own analytics stream
  Each link = a reason to return to the dashboard
```

### Why this decision matters

| If profile is the product | If link is the product |
|---|---|
| Users update it occasionally | Users share links constantly |
| Value felt once, on setup | Value felt every time a link is opened |
| No return mechanic | Analytics notifications pull users back |
| One-shot AI writing tool | Ongoing identity infrastructure |
| Competes with resume builders | Occupies an unowned category |

### The link as the atomic unit

- Users do not share their profile. They share links.
- Analytics attach to links, not profiles.
- Virality occurs when a link is opened by someone who has never heard of PersonaPage — they see the "Made with PersonaPage" footer.
- The product grows every time a link is shared externally.

---

## 10. User Flows

### 10.1 Onboarding Flow

**Target:** First link live in under 8 minutes

```
1. Sign up
   → Email or GitHub OAuth
   → Username selection (becomes URL namespace)

2. Build master profile  [minimal input required]
   → Headline: who are you right now? (1 sentence)
   → Projects: add 1–5 projects
     - Name, what it does, tech used, your role, outcome/impact
   → Skills: freeform tags
   → Background: education + work (optional, minimal)
   → Tone preference: casual / neutral / formal

3. Pick first audience context
   → Three cards shown:
     [Recruiter / Hiring Manager]
     [Startup Founder / Collaborator]
     [Freelance Client]

4. AI generates first contextual view  [3–5 second wait]
   → Live preview rendered
   → User sees what their profile looks like for that audience

5. First smart link ready
   → yourname.personapage.io/for/recruiters
   → "Copy link" button — prominent, single action

6. Optional: create second context
   → "Add another link for a different audience?"
   → Most users will — the first took less than 2 minutes
```

**Design principle:** Progressive commitment. Minimum viable onboarding requires only a headline and one project. Everything else is added over time. Users who reach "your link is ready" in under 5 minutes are significantly more likely to return and enrich their profile.

---

### 10.2 Core Usage Loop

```
User wants to message someone new
  ↓
Opens PersonaPage dashboard (5 seconds)
  ↓
Copies the correct context link (recruiter / founder / client)
  ↓
Pastes into LinkedIn DM / email / Discord / job application
  ↓
Done — total time: 10–15 seconds

Later that day / next morning:
  ↓
Email notification: "Your /recruiters link was opened 3 times"
  ↓
User opens dashboard to check analytics
  ↓
Sees viewer locations, devices, view duration
  ↓
Updates a project, adds a new one
  ↓
All contextual links automatically reflect the update
```

---

### 10.3 Link Viewer Flow (the other side)

```
Visitor opens yourname.personapage.io/for/recruiters
  ↓
Clean, fast-loading profile page
  ↓
Content tailored to recruiter context:
  - Technical projects front and centre
  - Skills and stack prominently displayed
  - Impact metrics visible
  - "Get in touch" CTA at bottom
  ↓
Subtle footer: "Built with PersonaPage"
  → Links to personapage.io
  → This is the growth loop: viewers become users
```

---

### 10.4 Profile Update Flow

```
User ships a new project
  ↓
Adds project to master profile (single form, one input)
  ↓
Triggers background regeneration of all contextual views
  (or manual regeneration on next dashboard visit)
  ↓
All live links now reflect the new project
  ↓
No manual updates needed per context
```

This "update once, reflects everywhere" mechanic is a core value proposition. A static portfolio requires manual updates across every version. PersonaPage requires one.

---

### 10.5 Sharing Flow

```
User is at a hackathon / networking event
  ↓
Needs to share profile with a startup founder they just met
  ↓
Opens PersonaPage on mobile
  ↓
Sees link list: /recruiters  /founders  /clients
  ↓
Taps /founders to copy
  ↓
Shares via DM, email, or QR code (v2)
  ↓
Receives view notification within minutes
```

---

## 11. Core Features

### 11.1 Master Profile Builder

| Field | Type | Required | Notes |
|---|---|---|---|
| Headline | Text (1–2 sentences) | Yes | User's own words, AI reads but does not rewrite |
| Projects | Array (1–5) | Yes (min 1) | See project schema below |
| Skills | Tag array | Optional | Grouped by category |
| Experience | Array | Optional | Org, role, dates, one-liner |
| Education | Structured | Optional | Degree, institution, year |
| Tone preference | Enum | Optional | casual / neutral / formal |
| Voice notes | Freeform text | Optional | e.g. "hate buzzwords", "prefer short sentences" |

**Project schema (per project):**

| Field | Type | Notes |
|---|---|---|
| title | string | Never changed by AI |
| description_raw | text | User's own words — AI rewrites for context |
| tech_stack | string[] | Tags — never changed by AI |
| role | string | What specifically they did |
| impact | string | Outcome or metric — AI never invents this |
| visibility_weight | int (1–5) | How much to emphasise per audience |

---

### 11.2 Audience Context System

**Default contexts (pre-built, v1):**

| Context | Label | AI priority |
|---|---|---|
| `recruiter` | Recruiter / Hiring Manager | Technical credibility, structured CV framing |
| `founder` | Startup Founder / Collaborator | Product thinking, builder narrative, impact |
| `client` | Freelance Client | Delivery track record, reliability, scope management |

**Custom contexts (v2):** User-defined label + freeform description of the audience. AI uses the description to adjust framing.

---

### 11.3 Smart Link System

- Each context generates one unique public URL: `personapage.io/[username]/[slug]`
- Default slugs: `/recruiters`, `/founders`, `/clients`
- Custom slugs: user-editable in v2
- Links are always live and reflect the latest generated view
- Optional link expiry (built into schema from day 1, exposed in UI in v2)
- Links can be deactivated from the dashboard without deletion

---

### 11.4 Dashboard

Displays:
- All active context links
- View count per link (total + last 7 days)
- "Last opened" timestamp per link
- Copy link button per link
- Create new link CTA
- Edit master profile button
- Per-link analytics drill-down

---

### 11.5 Analytics (per link)

- Total view count
- Views over time (daily bar chart, last 30 days)
- Recent views list: timestamp, approximate location (city/country), device type
- Referrer URL (where the link was clicked from)
- View duration in seconds (approximate)

---

### 11.6 View Notification Email

Sent within 5 minutes of a new link view.

**Content:**
- Which link was opened
- Approximate location + device
- Single CTA: "See analytics"

This is the single most important retention mechanic. Do not deprioritise it.

---

### 11.7 Inline Editing of Generated Fields

Every AI-generated field on a contextual view has:
- An edit icon on hover
- Inline text editing
- Manual override saved per context (does not affect other views)
- Override preserved across regenerations unless user explicitly resets
- Visual indicator: AI-generated vs. manually edited

---

## 12. AI System Design

### 12.1 What the AI reads

The AI reads the entire master profile as structured JSON on each generation call. It does not access previous generations or conversation history.

### 12.2 What stays fixed (AI never modifies)

```
Fixed across all contexts:
  - User's name
  - Project titles
  - Technology names and stack tags
  - GitHub / LinkedIn URLs
  - Any metric the user provided ("40% faster", "2,000 users")
  - Dates, institutions, company names
```

Metrics are facts. The AI is explicitly instructed never to invent, round, or extrapolate from them.

### 12.3 What changes per context

```
Changes per context:
  - Headline framing (same person, different narrative angle)
  - Project ordering (most relevant to audience shown first)
  - Project description emphasis (same project, different angle)
  - Skills ordering (most relevant to audience surfaced first)
  - Section ordering (about / projects / skills priority)
  - CTA text (different ask per audience)
```

**Example — same project, three contexts:**

> **Project:** Personal finance tracker with AI-categorised transactions
>
> **Recruiter view:** "Built a full-stack web app with Next.js, Supabase, and the OpenAI API. Implemented secure auth, real-time data sync, and a RAG pipeline for transaction categorisation."
>
> **Founder view:** "Identified a gap in personal finance UX — existing apps require manual categorisation. Built an AI-native alternative, shipped an MVP in 3 weeks, onboarded 200 users without paid acquisition."
>
> **Client view:** "Delivered a full-stack web application with authentication, real-time database integration, and an AI feature layer. Completed to spec, on time, with full documentation."

Same facts. Different emphasis. Nothing invented.

---

### 12.4 Prompt Architecture

**System prompt structure (per generation call):**

```
[FIXED PART — identical for every call]
You are a professional profile writer. Your job is to reframe 
the user's profile data for a specific audience.

Rules:
- Never invent facts, metrics, or claims not present in the source data
- Never change technology names or project titles
- Preserve the user's authentic voice — avoid corporate HR language
- If you do not have enough data for a field, omit it — never fabricate
- Output structured JSON matching the profile schema exactly
- The following fields are ground truth and must not be altered:
  [metrics, project names, tech stack tags, dates, URLs]

[CONTEXT PART — changes per link type]
Audience: [recruiter | founder | client | custom]
Priority: [technical credibility | product thinking | delivery track record]
Tone: [casual | neutral | formal]  ← derived from user's tone preference
Emphasise: [specific skills or project types to surface first]
De-emphasise: [what this audience does not care about]

[VOICE PART — from user's voice_notes field]
User preferences: "[injected verbatim from voice_notes]"
e.g. "I hate buzzwords like 'passionate' and 'synergy'"
     "Prefer short, direct sentences over complex ones"

[DATA PART]
[Master profile JSON — injected in full]

[OUTPUT INSTRUCTION]
Return a JSON object with this exact schema:
{
  "headline": "string — 1 sentence",
  "about": "string — 2–3 sentences",
  "projects": [
    {
      "title": "string — unchanged from source",
      "description": "string — reframed for audience",
      "tech_stack": ["string"] — unchanged from source,
      "impact": "string — unchanged from source"
    }
  ],
  "skills": ["string"] — reordered, not modified,
  "cta_text": "string — 1 sentence call to action"
}
```

---

### 12.5 Hallucination Prevention

**Three layers:**

**Layer 1 — Schema enforcement**
AI always outputs JSON. JSON is validated against the profile schema on receipt. Any field not derivable from source data is flagged or omitted. Freeform prose output is never allowed — always structured.

**Layer 2 — Fact anchoring**
Every prompt explicitly lists ground-truth fields:
> *"The following facts must appear exactly as provided or be omitted entirely. Never modify, round, or extrapolate: [list of metrics, dates, project names, tech stack]"*

**Layer 3 — User review before publishing**
After generation, user sees a diff view before the link goes live:
- Original text vs. AI-generated text shown side by side (or highlighted inline)
- User confirms or edits any field
- No generated content appears on a live link until the user has seen it at least once

This also builds trust — users understand what the AI changed and why.

---

### 12.6 Tone Consistency

Tone is orthogonal to context. Context changes *what* is emphasised. Tone changes *how* it is expressed.

```
User sets once at profile level:
  formality: casual | neutral | formal

Optionally adds voice notes:
  "I prefer showing over telling"
  "No buzzwords — especially 'passionate', 'leverage', 'synergy'"
  "Short sentences. Active voice."

These inject into every generation prompt, regardless of audience context.
```

---

### 12.7 Regeneration Logic

```
Trigger regeneration when:
  - User updates any field in master profile
  - User explicitly clicks "Regenerate" on a context view
  - User resets manual overrides

Do NOT regenerate automatically on every page view:
  - Generated views are cached in generated_views table
  - Served directly from cache — no LLM call on page load
  - Regeneration is a background or user-triggered action
  
This keeps costs predictable and page loads fast.
```

---

## 13. Database / Data Model

### Schema

```sql
-- Users
users
  id              uuid PRIMARY KEY
  email           text UNIQUE NOT NULL
  username        text UNIQUE NOT NULL  -- URL namespace
  created_at      timestamptz DEFAULT now()
  plan            text DEFAULT 'free'

-- One master profile per user
master_profiles
  id              uuid PRIMARY KEY
  user_id         uuid REFERENCES users(id)
  headline_raw    text
  about_raw       text
  tone_formality  text CHECK (tone_formality IN ('casual','neutral','formal'))
  voice_notes     text
  updated_at      timestamptz

-- Projects (array of records linked to profile)
profile_projects
  id              uuid PRIMARY KEY
  profile_id      uuid REFERENCES master_profiles(id)
  title           text NOT NULL
  description_raw text
  tech_stack      text[]
  role            text
  impact          text
  visibility_weight int DEFAULT 3 CHECK (visibility_weight BETWEEN 1 AND 5)
  display_order   int
  created_at      timestamptz

-- Skills
profile_skills
  id              uuid PRIMARY KEY
  profile_id      uuid REFERENCES master_profiles(id)
  name            text NOT NULL
  category        text  -- 'languages' | 'frameworks' | 'tools' | 'concepts'
  display_order   int

-- Work experience
profile_experience
  id              uuid PRIMARY KEY
  profile_id      uuid REFERENCES master_profiles(id)
  org             text
  role            text
  start_date      date
  end_date        date  -- nullable = current
  description     text

-- Context links (one per audience type per user)
context_links
  id              uuid PRIMARY KEY
  profile_id      uuid REFERENCES master_profiles(id)
  user_id         uuid REFERENCES users(id)
  context_type    text CHECK (context_type IN ('recruiter','founder','client','custom'))
  context_label   text  -- user-facing name e.g. "For YC founders"
  slug            text  -- URL segment e.g. "recruiters"
  is_active       boolean DEFAULT true
  expires_at      timestamptz  -- nullable; for expiring links
  created_at      timestamptz DEFAULT now()
  UNIQUE (user_id, slug)

-- Generated views (cached AI output per context link)
generated_views
  id              uuid PRIMARY KEY
  context_link_id uuid REFERENCES context_links(id)
  headline_generated  text
  about_generated     text
  projects_generated  jsonb
  skills_generated    jsonb
  cta_text            text
  user_overrides      jsonb  -- stores per-field manual edits separately
  generated_at        timestamptz DEFAULT now()
  regenerated_at      timestamptz

-- Analytics (append-only, never updated)
link_views
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  context_link_id uuid REFERENCES context_links(id)
  viewed_at       timestamptz DEFAULT now()
  duration_seconds int
  country         text
  city            text
  device_type     text CHECK (device_type IN ('mobile','desktop','tablet'))
  referrer_url    text
```

### Key indexing

```sql
CREATE INDEX idx_context_links_user    ON context_links (user_id, slug);
CREATE INDEX idx_link_views_link_time  ON link_views (context_link_id, viewed_at DESC);
CREATE INDEX idx_link_views_recent     ON link_views (viewed_at DESC);
```

### Design decisions

| Decision | Reason |
|---|---|
| One master profile per user | Single source of truth; all context views derive from it |
| Generated views are cached | Do not call the LLM on every page view — expensive and slow |
| User overrides stored separately from AI output | Allows regeneration without destroying manual edits |
| Analytics append-only | No complex update logic; fast inserts; easy time-series queries |
| Link expiry in schema from day 1 | Low cost to add; high value feature users will want early |
| No team/org tables | Scope creep risk — excluded deliberately |

---

## 14. Technical Architecture

### Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, SSR for public pages, API routes |
| Database | Supabase (PostgreSQL) | Auth built-in, real-time subscriptions, generous free tier |
| AI | Anthropic Claude API (claude-sonnet) or OpenAI GPT-4o | Structured JSON output, reliable instruction-following |
| Hosting | Vercel | Zero-config Next.js deployment, edge functions available |
| Email | Resend | Simple transactional email API, generous free tier |
| Analytics capture | Custom (Supabase insert on page view) | No third-party dependency for core analytics |

### Route structure

```
app/
  (auth)/
    login/
    signup/
  (dashboard)/
    dashboard/         → link list + analytics overview
    profile/           → master profile editor
    links/[id]/        → per-link analytics
    links/new/         → create new context link
  [username]/
    [slug]/            → public contextual profile page (SSR)
  api/
    generate/          → POST: trigger AI generation for a context
    analytics/view/    → POST: record a link view (called on public page load)
    analytics/[id]/    → GET: fetch analytics for a link
```

### Public page rendering

```
GET /[username]/[slug]

1. Resolve username → user_id
2. Resolve slug → context_link_id
3. Check link is active + not expired
4. Fetch generated_views WHERE context_link_id = X
5. Merge AI-generated fields with user_overrides
6. Render profile page server-side (SSR)
7. Record view in link_views (async, non-blocking)
8. Return HTML

Performance target: < 800ms TTFB
Caching: generated_views cached; no LLM call on page load
```

### AI generation endpoint

```
POST /api/generate
Body: { context_link_id: string }
Auth: required (must be link owner)

1. Fetch master_profile + all sub-entities for user
2. Fetch context_links record to get context_type + label
3. Build prompt (system + context + voice + data)
4. Call Claude API with JSON output schema
5. Validate response against schema
6. Upsert into generated_views
7. Return generated view

Error handling:
  - Schema validation failure → return 422, log raw response
  - API timeout → return 503, do not save partial output
  - Rate limit → queue and retry (simple in v1)
```

### Analytics capture

```
On public page load (client-side, after render):
  POST /api/analytics/view
  Body: {
    context_link_id,
    referrer: document.referrer,
    device_type: derived from user-agent
  }
  
Server-side:
  - IP geolocation via Vercel edge headers (country, city)
  - Insert into link_views
  - Trigger view notification email (async via Resend)

Do NOT block page render on analytics capture.
```

---

## 15. Analytics System

### V1 analytics (build this)

Per link, show:

| Metric | Display |
|---|---|
| Total views | Integer count |
| Views last 7 days | Sparkline or small bar chart |
| Views over 30 days | Bar chart (daily) |
| Recent views | List: timestamp + city/country + device |
| Referrer breakdown | Top 5 referrer domains |
| View duration | Average seconds, displayed as "~2 min avg" |

### The view notification email (most important retention mechanic)

```
Trigger:  new row in link_views
Delay:    send within 5 minutes of view
From:     notifications@personapage.io
Subject:  "Your /recruiters link was just opened"

Body:
  Someone opened your PersonaPage link
  Link:    /for/recruiters
  Time:    just now
  From:    London, UK
  Device:  Desktop

  [See analytics →]

Do not batch notifications in v1.
One email per view. Annoying at scale. Fine for early users.
Batch in v2 when users have high view volumes.
```

### V2 analytics (do not build yet)

- Session depth: which sections were scrolled to
- Heatmap-style engagement per section
- A/B comparison between context versions
- Aggregate: which context type gets most engagement across users
- Weekly summary digest email

---

## 16. MVP Scope

### What V1 is: three screens + one public page + one email

**Screen 1: Onboarding / profile builder**
- Master profile form with 4 collapsible sections
- Save progress at any time
- Minimum viable: headline + one project

**Screen 2: Dashboard**
- List of context links with view counts
- Copy link button per link
- Create new link CTA
- Edit profile button

**Screen 3: Per-link analytics**
- Total views + chart
- Recent views list
- Nothing else

**Public page: `/[username]/[slug]`**
- AI-generated contextual profile
- Fast, no login required to view
- Mobile responsive
- "Made with PersonaPage" footer

**Email: view notification**
- Sent within 5 minutes of a view
- Single CTA back to analytics dashboard

### Build order (strict priority)

```
Week 1:  Auth + Supabase schema + master profile form
Week 2:  AI generation endpoint + contextual view renderer  ← hardest week
Week 3:  Public link pages + URL routing + view capture
Week 4:  Analytics dashboard + view notification email
Week 5:  Polish, mobile responsiveness, error states, deploy
Week 6:  Show 10 people. Watch. Do not touch the code.
```

### The non-negotiable quality bar for launch

The AI-generated profiles must not sound generic. This will kill trust immediately and permanently. Before building any other feature, validate that the prompt system produces output that sounds like a real person, not a CV template. Show the output to five people who know the user. If they say "that doesn't sound like you" — fix the prompt, not the UI.

---

## 17. V2 Opportunities

Build these only after 50 active users, validated thesis, and clear user demand.

| Feature | Value | Trigger to build |
|---|---|---|
| Custom context creator | User defines their own audience type | Users asking for contexts beyond the 3 defaults |
| GitHub project import | Auto-populate projects from README content | Users finding manual project entry tedious |
| Link expiry / password protection | Security and control for sensitive contexts | Users asking for it |
| Custom URL slugs | `/aryan/yc-application` instead of `/aryan/founders` | Power users wanting branded links |
| Auto-regeneration on profile update | Trigger regeneration when master profile changes | Users finding manual regeneration annoying |
| Analytics: session depth | Track which sections got attention | Enough view volume to make data meaningful |
| Analytics: referrer mapping | Show which platforms drove views | Users asking "where are my views coming from" |
| Weekly analytics digest email | Summary of link performance over 7 days | Users who check the dashboard too often |
| QR code per link | Useful at events and meetups | Users sharing links in person |

---

## 18. Non-Goals

These are excluded from PersonaPage's scope, permanently or until stated otherwise.

| Non-goal | Reason |
|---|---|
| Resume / CV PDF export | That is not this product. PersonaPage is a live link. |
| Job board or recruiter-facing discovery | Changes the business model entirely; different product |
| Social network features (feed, following, likes) | Creates a content moderation burden with no clear ROI |
| Profile discovery / public directory | Dilutes the product thesis; becomes a different product |
| LinkedIn replacement | Complementary tool, not a competitor |
| Enterprise or team accounts | Scope creep that adds auth complexity for zero early user value |
| Mobile app | Responsive web is sufficient for MVP and V2 |
| Automatic viewer identity detection | Research problem, not a product problem; save for V3 at earliest |
| Blockchain or decentralised identity | Irrelevant to the problem being solved |
| Integrations (Notion, Google Docs, etc.) | Not useful until users have volume and workflow lock-in |
| A/B testing between profile versions | Valid but requires analytics maturity first |
| Payments or monetisation | Do not add until 50 users would clearly pay |

---

## 19. Risks & Assumptions

### Critical risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Problem is not painful enough** — users tolerate bad portfolios for years | High | Target users in active job-search window only; validate by finding 5 people who have sent the same link to different audiences in the last 30 days |
| **Cool demo syndrome** — users generate versions once, never return | High | Make the link the product, not the profile; view notification email is the return mechanic; design for sharing cadence not one-time use |
| **AI output sounds generic** — users do not feel the output sounds like them | High | Test prompt quality before building UI; show output to 5 people who know the user; build inline editing as a core feature, not an afterthought |
| **Low sharing frequency** — users do not share enough links to see analytics value | Medium | Friction of sharing must be under 15 seconds; dashboard must be the fastest way to copy the right link |
| **LinkedIn ships audience modes** — major competitor moves into the space | Medium | Moat is not technology; it is workflow fit and UX specificity for builders — LinkedIn cannot optimise for this niche without breaking their broader product |

### Assumptions being made

| Assumption | Risk if wrong |
|---|---|
| Users will share contextual links at a frequency that makes analytics meaningful | If wrong: product feels like a vanity dashboard; pivot toward better onboarding and nudges |
| AI can produce output authentic enough that users trust it to represent them | If wrong: product becomes a starting point for manual rewriting; adjust positioning toward AI-assisted rather than AI-generated |
| The "update once, reflects everywhere" mechanic is a real pain reliever | If wrong: users do not update their profile after initial setup; need to add prompts and triggers to re-engage |
| Users in active job search are reachable via Discord, Twitter/X, and hackathons | If wrong: need to find alternate acquisition channels before scaling |
| View notification emails drive return visits | If wrong: add in-app notifications and dashboard engagement hooks |

---

## 20. Validation Metrics

### The single most important metric

> **Average number of unique context links shared per active user per month**

- If above 3: core thesis confirmed — people are using multiple versions
- If equals 1: thesis may be wrong — users want one better version, not many
- If zero after two weeks: onboarding is broken — fix before anything else

### Supporting metrics (week by week)

| Week | Metric | Target |
|---|---|---|
| W1–2 | Onboarding completion rate | > 60% reach "link created" |
| W2–4 | Links created per user | ≥ 2 within first session |
| W3–5 | Links shared (copied) per user | ≥ 1 within first week |
| W4–6 | Return visits within 7 days | > 40% |
| W5–8 | View notification email open rate | > 50% |
| W6–8 | Profile update rate | > 30% of users update at least once |
| W8+ | Links shared per active user per month | ≥ 3 |
| W10+ | "Made with PersonaPage" click-through rate | > 5% of link viewers |

### The pivot trigger

If by end of Month 3:
- Average links shared per user is consistently 1 or below
- Users are not returning after initial generation
- Qualitative feedback shows "I just copied the text and used it elsewhere"

Then: strip the adaptive features, rebuild as the sharpest AI-powered single portfolio tool for CS students. Different product, same user, same underlying AI capability.

---

## 21. 90-Day Execution Roadmap

### Month 1 — Build

| Week | Focus | Deliverable |
|---|---|---|
| W1 | Foundation | Auth (GitHub OAuth + email), Supabase schema, master profile form (all sections) |
| W2 | AI core | Generation endpoint, Claude API integration, JSON schema validation, contextual view renderer |
| W3 | Links + public pages | URL routing `/[username]/[slug]`, public page SSR, view capture endpoint |
| W4 | Dashboard + email | Analytics dashboard, per-link analytics view, view notification email via Resend |

**End of Month 1 target:** Live product on Vercel. Every core flow works. Not polished — functional.

---

### Month 2 — Ship + Learn

| Week | Focus | Deliverable |
|---|---|---|
| W5 | Launch to 10 people | Personal network, university peers, Discord communities — do not cold-launch publicly |
| W6 | Observe | Watch actual usage: what do they share? where does the flow break? what do they ignore? |
| W7 | Fix | Address the top 3 friction points identified in W6. Not new features — fixing broken flow. |
| W8 | Expand | Add GitHub project import (auto-populate), custom context creator, visual profile customisation |

**End of Month 2 target:** 10 real users. At least 5 have shared a link externally. At least 3 have returned within 7 days.

---

### Month 3 — Validate or Pivot

| Week | Focus | Action |
|---|---|---|
| W9–10 | Measure | Actively track the falsifiability metric: average links shared per user |
| W11 | Decide | → ≥ 3 links per user: thesis confirmed — add analytics depth, start thinking about growth loop |
|      |        | → 1 link per user: thesis wrong — pivot to best-single AI portfolio for CS students |
| W12 | Document | Write the case study regardless of outcome. What you built, what you learned, what changed. |

**End of Month 3 target:**  
- Live product with real, external users (not just friends)
- A documented case study: problem → build → learn → decision
- A positioning narrative for interviews: "I built this, validated this, learned this"
- Either a confirmed thesis to double down on, or a clear pivot direction

---

### Career positioning checkpoint (end of Month 3)

By the end of this roadmap, you will have:

- A shipped, live AI product — not a tutorial clone
- A documented product case study covering: problem identification, product design, AI system design, solo full-stack execution, and user validation
- A positioning narrative for internship and job interviews that demonstrates: product thinking, AI engineering, startup instincts, and execution discipline
- An honest answer to "what did you learn that surprised you" — which is the question that separates real builders from CV-padders

---

*End of PersonaPage PRD v1.0*

---

> **Next phase:** Technical architecture deep-dive — Next.js route structure, Supabase schema implementation, Claude API prompt engineering, and public page rendering optimisation.
