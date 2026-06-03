@AGENTS.md

# Brave — Vekstprofil (Customer Onboarding Questionnaire)

## Project Overview

A full-stack Next.js app for Brave (Norwegian B2B sales/marketing agency). Brave admins manage clients, send unique questionnaire links, and view responses over time to track growth. Clients answer 15 questions about their sales baseline ("nullpunkt") with no login required.

### Full Scope

**Customer-facing (`/k/[token]`):**
- Token-gated questionnaire, no login
- Answers auto-saved per question as customer progresses (customers may take days to complete)
- Future: delegate a question to a teammate

**Admin section (`/admin/*`):**
- Client management — create clients, view all clients and their history
- Generate questionnaire links — create a new submission round for a client
- Edit questions per round (customized from the default template before sending)
- View responses per client/round
- Compare rounds over time to demonstrate growth
- Edit the default question template

### Data Model (Approach A — Template + Round Copies)

When a new round is created for a client, the default question template is **copied** into that round. Editing questions for one round never affects other rounds or clients. Answers are stored per-question per-round, enabling immutable historical snapshots for growth comparison.

Key entities: `Client`, `SubmissionRound` (has unique token + copied questions), `Question` (round-scoped copy), `Answer` (saved incrementally as customer fills in).

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

## Questions (from brief)

These are the 15 canonical questions. The design mockup was built around 10 — update all "10 spørsmål" / "~4 minutter" copy to match when building the UI.

1. Hvor mange selgere har dere i dag?
2. Hva er gjennomsnittlig fartstid for selgerne i selskapet?
3. Hva er gjennomsnittsalderen på selgerteamet?
4. Beskriv deres ICP (ideelle kundeprofil) — bransje, størrelse, rolle på beslutningstaker.
5. Hvor mange salgsmøter holder hver selger i snitt per måned i dag?
6. Hva er gjennomsnittlig closing rate fra møte til signert deal?
7. Hva er gjennomsnittlig deal size (ACV og månedlig abonnement der relevant)?
8. Hva er gjennomsnittlig sales cycle — tid fra første møte til signert deal?
9. Hvilket CRM bruker dere, og hvor disiplinert føres data der?
10. Hvor mye cold outreach gjør selgerne selv i dag (telefon, mail, LinkedIn)?
11. Hvor mange tilbud sender dere i snitt per måned, og hva er total pipeline value nå?
12. Hvor får dere leads fra i dag? Ranger kanalene etter volum og kvalitet.
13. Har dere en definert salgsprosess eller playbook?
14. Hvordan måler dere konvertering (MQL → SQL → tilbud → signert)? Hvilke tall rapporteres?
15. Hva oppfatter dere selv som den største flaskehalsen i salget akkurat nå?

## Important Notes

- **Tailwind v4:** No `tailwind.config.ts`. Tokens go in `globals.css` `@theme` block. Font `@import`s must NOT be in CSS — use `<link>` tags in `layout.tsx` (PostCSS inlines Tailwind first, pushing @imports to invalid positions).
- **Next.js 16 has breaking changes** from earlier versions. Always check `node_modules/next/dist/docs/` before using routing APIs, params, or server actions.
- **`params` is a Promise** in Next.js 16 page components — always `await params` before accessing properties.
- **Questions are currently static** in `lib/questions.ts`. They will move to the DB to support admin editing — keep this in mind when building the admin UI.
- **Pair programming style** — Andreas does frontend, George does backend. The frontend's integration points are: `saveAnswer(token, questionId, value)` (called on each Next/Skip) and a final `submitRound(token)` to mark the round complete.
- **Auto-save, not submit-on-finish** — answers are persisted per question as the customer moves forward, not in one batch at the end.

## Component Structure (planned)

```
components/
  skjema/
    Skjema.tsx          — stateful orchestrator ('use client')
    Intro.tsx
    SpørsmålKort.tsx
    Oppsummering.tsx
    Innsendt.tsx
    Fremdrift.tsx
    BrandBar.tsx
  ui/
    PrimaryButton.tsx
    GhostButton.tsx
```

Only `Skjema.tsx` holds state. Everything else is presentational.

## External Product Name

The product is called **Vekstprofil** externally. Target URL: `https://vekstprofil.thebrave.no` (separate Vercel deployment, not integrated into thebrave.no). Update `metadata.title` in `app/layout.tsx` to reflect this.

## Current Build Status

### Done ✅
- `lib/types.ts` — `Question`, `AnswerMap`, `SKIPPED`, `QuestionType` (includes `boolean`, `select`, `multiselect`), `slider` config
- `lib/questions.ts` — all 15 questions from the brief
- `lib/formatAnswer.ts` — formats answers for summary screen (handles boolean, multiselect, select, kr, %, suffixes)
- `app/globals.css` — all design tokens, fonts, grain overlay
- `app/layout.tsx` — Fraunces via next/font, Satoshi via Fontshare link tag, grain div
- `components/ui/Arrow.tsx` — inline SVG arrow
- `components/ui/PrimaryButton.tsx` — bg-brand, text-onbrand, hover:bg-brand-deep, includes Arrow
- `components/ui/GhostButton.tsx` — transparent, border-steel, hover:border-muted
- `components/ui/BrandBar.tsx` — "Brave" in Fraunces + 9px coral dot

### Next up (in order) 🔜
1. `components/skjema/Skjema.tsx` — shell with state + dev debug nav
   - State: `stage: 'intro' | number | 'summary' | 'submitted'`, `answers: AnswerMap`, `draft: string`
   - Debug nav (dev only): buttons to jump between stages via `process.env.NODE_ENV === 'development'`
2. `components/skjema/Fremdrift.tsx` — visible on question stages only, fill = `(stage+1)/15`, animated width
3. `components/skjema/Intro.tsx` — eyebrow, headline, body, 3-up meta row, CTA
4. `components/skjema/SpørsmålKort.tsx` — category eyebrow, question, help, input, action row
5. `components/skjema/Oppsummering.tsx` — review all answers, click to jump back
6. `components/skjema/Innsendt.tsx` — confirmation screen
7. `app/k/[token]/page.tsx` — server component, validates token, renders Skjema

### Waiting on George (backend) 🔒
- SCRUM-3: PostgreSQL + Prisma schema
- SCRUM-4: Auth.js OAuth (@thebrave.no only)
- SCRUM-18: Server actions — `saveAnswer`, `submitRound`, `getSubmission`

## Workflow Notes

- **Andreas builds all frontend with mock data** — no need to wait for George
- **Integration happens last** — swap mock data for real server actions when SCRUM-18 is done
- **Jira project:** braveaiteam.atlassian.net — all sprint tasks tracked there with blocker relationships set up
