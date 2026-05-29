# Brave — Customer Onboarding Questionnaire

A standalone web app that lets Brave send personalised questionnaire links to clients. Clients answer questions about their current sales and marketing situation ("nullpunkt" / baseline). Brave uses the results internally to track and demonstrate growth over time.

---

## What It Does

**For clients:**
- Receive a unique link (no login required)
- Click through ~10 questions about revenue, leads, close rate, tools, etc.
- Skip any question they don't have data for
- Review and submit their answers

**For Brave admins:**
- Generate unique questionnaire links per client
- Manage the question catalog (add, remove, reorder questions)
- View submitted responses with visual summaries (charts for numeric data)
- Export responses as CSV until the visual dashboard is built

---

## Architecture

Single Next.js app with:

- **Client-facing route:** `/k/[token]` — the questionnaire, publicly accessible via link
- **Admin routes:** `/admin/*` — internal Brave use only, protected
- **Database:** PostgreSQL via Prisma — stores submissions, answers, and the question catalog
- **No auth for clients** — access is via an unguessable token in the URL

---

## Deployment

Hosted separately on Vercel. When stable, can be moved to a subdomain like `onboarding.thebrave.no` or integrated into the main Brave repository.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Deployment | Vercel |

---

## Project Structure

```
app/
  k/[token]/page.tsx      — client questionnaire route
  admin/                  — internal admin pages (future)
  actions.ts              — server actions (submit, generate links)
  globals.css             — design tokens + base styles
  layout.tsx              — root layout with fonts + grain overlay
components/
  questionnaire/          — questionnaire UI components
  ui/                     — shared UI primitives (buttons, etc.)
lib/
  types.ts                — shared TypeScript types
  questions.ts            — question catalog (static for now → DB later)
  formatAnswer.ts         — answer formatting for summary view
design_handoff_onboarding/
  README.md               — full UI spec (screens, interactions, tokens)
  reference/              — working HTML prototype
  starter/                — starter files used during setup
prisma/
  schema.prisma           — database schema
```

---

## Getting Started

```bash
npm install
npm run dev
```

For backend setup (database, environment variables) see `BACKEND.md`.
