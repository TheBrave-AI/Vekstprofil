@AGENTS.md

# Brave — Customer Onboarding Questionnaire

## Project Overview

A standalone Next.js app for Brave (Norwegian B2B sales/marketing agency). Brave admins send unique questionnaire links to clients. Clients answer ~10 questions about their sales baseline ("nullpunkt") with no login required. Brave views results in an internal admin dashboard.

## Architecture

- **Client route:** `/k/[token]` — public questionnaire, token-gated
- **Admin routes:** `/admin/*` — protected by Auth.js (Google OAuth, @thebrave.no accounts only)
- **Database:** PostgreSQL via Prisma
- **No auth for clients** — unguessable token in URL is the only gate

## Stack

- Next.js 16 (App Router) — read `node_modules/next/dist/docs/` before touching routing or server components
- React 19
- TypeScript
- Tailwind CSS v4 — tokens defined via `@theme` in `globals.css`, NOT a `tailwind.config.ts`
- Framer Motion — used for slide transitions in the questionnaire
- Auth.js (NextAuth v5) — Google OAuth for admin section
- Prisma + PostgreSQL

## Key Files

| File | Purpose |
|---|---|
| `app/globals.css` | All design tokens (`@theme`) + base styles. Edit here, not in a config file. |
| `app/layout.tsx` | Root layout — fonts (Fraunces via next/font, Satoshi via link tag), grain overlay |
| `lib/types.ts` | Shared types: `Question`, `AnswerMap`, `SKIPPED` sentinel |
| `lib/questions.ts` | Question catalog — static array for now, will move to DB |
| `lib/formatAnswer.ts` | Formats raw answers for the summary screen |
| `design_handoff_onboarding/README.md` | Full UI spec — screens, interactions, copy, tokens. Source of truth for UI. |
| `design_handoff_onboarding/reference/Brave Onboarding.html` | Working HTML prototype — open in browser to see intended UX |
| `BACKEND.md` | Backend setup guide for George (colleague) |

## Design System

All Brave design tokens live in `app/globals.css` under `@theme`. Key values:

- **Fonts:** Satoshi (body), Fraunces (display/headings)
- **Primary bg:** `--color-ink: #f5efe3` (warm cream — NOT white)
- **Brand:** `--color-brand: #142a4b` (dark navy)
- **Accent:** `--color-accent: #0c8ba0` (teal)
- **Card radius:** `--radius-card: 1.25rem`

Always refer to `design_handoff_onboarding/README.md` for exact spacing, copy, and interaction specs before building a component.

## Important Notes

- **Tailwind v4:** No `tailwind.config.ts`. Tokens go in `globals.css` `@theme` block. Font `@import`s must NOT be in CSS — use `<link>` tags in `layout.tsx` (PostCSS inlines Tailwind first, pushing @imports to invalid positions).
- **Next.js 16 has breaking changes** from earlier versions. Always check `node_modules/next/dist/docs/` before using routing APIs, params, or server actions.
- **`params` is a Promise** in Next.js 16 page components — always `await params` before accessing properties.
- **Questions are currently static** in `lib/questions.ts`. They will move to the DB to support admin editing — keep this in mind when building the admin UI.
- **Pair programming style** — Andreas does frontend, George does backend. Frontend calls `submitBaseline(token, answers)` as the only integration point.

## Component Structure (planned)

```
components/
  questionnaire/
    Questionnaire.tsx   — stateful orchestrator ('use client')
    Intro.tsx
    QuestionCard.tsx
    Summary.tsx
    SubmittedScreen.tsx
    ProgressBar.tsx
    BrandBar.tsx
  ui/
    PrimaryButton.tsx
    GhostButton.tsx
```

Only `Questionnaire.tsx` holds state. Everything else is presentational.
