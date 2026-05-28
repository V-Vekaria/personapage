# PersonaPage

AI-powered professional identity platform for networking, creators, careers, and personal branding.

**Live demo → [personapage-app.vercel.app](https://personapage-app.vercel.app)**

## Overview

PersonaPage helps users create a dynamic AI-generated professional identity page from a single master profile.

Instead of maintaining fragmented bios, resumes, links, and personal branding across multiple platforms, users can generate and share a clean public identity page optimized for networking, opportunities, and online presence.

This project is currently being developed as an MVP focused on fast iteration, clean architecture, and AI-assisted workflows.

---

## Core MVP Features

* Authentication
* User dashboard
* Profile editor
* Link management
* AI-generated identity/profile summaries
* Public shareable profile pages
* Basic analytics (views and clicks)

---

## Tech Stack

### Frontend

* Next.js 15 (App Router)
* TypeScript
* TailwindCSS

### Backend / Database

* Supabase
* PostgreSQL

### AI

* OpenAI APIs

### Deployment

* Vercel

---

## Project Structure

```bash
app/           # Next.js App Router pages and API routes
components/    # Reusable UI components
lib/           # Utilities, AI logic, database clients
types/         # Shared TypeScript types
docs/          # Product documentation and PRD
```

---

## Local Development

### Clone Repository

```bash
git clone <repo-url>
cd personapage
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## Current Status

PersonaPage is currently in MVP development for demo and validation purposes.

Initial focus:

* AI identity generation
* Public profile experience
* Fast product iteration
* Networking/demo usability

---

## Roadmap

### MVP

* User onboarding
* AI profile generation
* Public profile pages
* Basic analytics

### Future Versions

* Advanced analytics
* Multiple profile modes
* AI personalization engine
* Identity optimization system
* Creator/founder templates

---

## Notes

This project is intentionally optimized for:

* solo-founder development
* rapid iteration
* clean maintainable architecture
* AI-assisted engineering workflows

The goal is to validate the product direction quickly before expanding system complexity.
