# Brave — Customer Onboarding Questionnaire

A standalone Next.js app that lets Brave send personalised questionnaire links to clients. Clients answer ~10 questions about their current sales and marketing situation ("nullpunkt" / baseline). Brave uses the results internally to track and demonstrate growth over time.

---

## What It Does

**For clients:**
- Receive a unique link (no login required)
- Click through ~10 questions about revenue, leads, close rate, tools, etc.
- Skip any question they don't have data for
- Review and submit their answers

**For Brave admins (Google OAuth, @thebrave.no only):**
- Generate unique questionnaire links per client
- View all submissions and their status (pending / submitted)
- Read submitted answers with visual summaries and charts
- Export any submission as CSV
- Manage the question catalog (reorder, activate/deactivate)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion (questionnaire transitions) |
| ORM | Prisma 6 |
| Database | PostgreSQL |
| Auth | Auth.js v5 (Google OAuth) |
| Charts | Recharts |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in values
cp .env.local.example .env.local

# 3. Create tables in the database
npx prisma migrate dev --name init

# 4. Seed questions + a test submission
npx prisma db seed

# 5. Start dev server
npm run dev
```

Open `http://localhost:3000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for Auth.js — generate with `npx auth secret` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID from console.cloud.google.com |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |

Local dev PostgreSQL (macOS via Homebrew):
```bash
brew install postgresql@17
brew services start postgresql@17
createdb brave_onboarding
```

Google OAuth callback URL to register:
- Dev: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://onboarding.thebrave.no/api/auth/callback/google`

---

## Project Structure

```
prisma/
  schema.prisma         — database schema (Submission, Answer, Question + Auth.js models)
  seed.ts               — seeds the question catalog and a test submission

lib/
  types.ts              — shared TypeScript types (Question, AnswerMap, SKIPPED)
  questions.ts          — static question catalog (10 questions, Norwegian)
  formatAnswer.ts       — formats raw answers for display (currency, %, units)
  db.ts                 — Prisma client singleton (safe for Next.js hot reload)

auth.ts                 — Auth.js v5 config: Google OAuth, @thebrave.no restriction
proxy.ts                — Next.js 16 proxy (replaces middleware): protects /admin/*

app/
  actions.ts            — all server actions (submitBaseline, createSubmission, etc.)
  api/
    auth/[...nextauth]/ — Auth.js route handler (GET + POST)
    export/[token]/     — CSV download endpoint (admin only, auth-checked)
  k/[token]/            — public client route: validates token, renders questionnaire
  admin/
    layout.tsx          — admin shell: navigation, session display, sign-out
    login/page.tsx      — Google sign-in page
    page.tsx            — dashboard: list all submissions with status
    new/                — create a new client link (generates token)
    submissions/[id]/   — view one submission: answer grid + numeric chart
    questions/          — manage question catalog (reorder, toggle active)
```

---

## Database Schema

### `Submission`
One row per questionnaire link Brave generates.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `token` | String (unique) | 16-char base64url slug used in the URL |
| `customerName` | String? | Label for Brave's internal view |
| `companyName` | String? | Label for Brave's internal view |
| `status` | String | `"pending"` or `"submitted"` |
| `createdAt` | DateTime | When Brave generated the link |
| `submittedAt` | DateTime? | When the client submitted |

### `Answer`
One row per question per submission.

| Field | Type | Notes |
|---|---|---|
| `submissionId` | String | FK → Submission (cascade delete) |
| `questionId` | String | Matches `Question.id` |
| `value` | String | Raw string entered by the client; `""` if skipped |
| `skipped` | Boolean | `true` when client clicked "Vet ikke / Har ikke tall på det" |

Unique constraint on `(submissionId, questionId)` — safe to upsert.

### `Question`
The question catalog, editable from the admin UI without a deploy.

| Field | Type | Notes |
|---|---|---|
| `id` | String | Stable slug, never reuse (e.g. `"revenue"`) |
| `category` | String | Eyebrow label (e.g. `"Økonomi"`) |
| `label` | String | The question text |
| `help` | String | Supporting sentence |
| `placeholder` | String | Input placeholder |
| `type` | String | `"number"` or `"text"` |
| `prefix` | String? | Left affix (e.g. `"kr"`) |
| `suffix` | String? | Right affix (e.g. `"%"`, `"leads / mnd"`) |
| `order` | Int | Display order |
| `active` | Boolean | Soft-delete: inactive questions are hidden from clients |

---

## Server Actions (`app/actions.ts`)

All server-side mutations go through these functions. They are called directly from client components — no REST endpoints needed.

### `submitBaseline(token, answers) → { ok: boolean }`
Called by the frontend questionnaire on final submit.

- `answers` is `Record<questionId, rawValue | "__SKIPPED__">`
- Returns `{ ok: false }` if the token doesn't exist
- Uses an atomic `updateMany` inside a transaction to claim the submission — concurrent duplicate submits are safely rejected (the first one wins, the second gets `ok: false`)
- All answers and the status update are written atomically

### `createSubmission(customerName, companyName) → { token: string }`
Admin only. Generates a new 16-character base64url token and creates the submission row.

### `updateQuestion(id, data) → void`
Admin only. Updates any field on a question (used for toggling `active` and changing display properties).

### `reorderQuestions(orderedIds) → void`
Admin only. Updates the `order` field on all questions in a single transaction.

---

## Admin Routes

All `/admin/*` routes are protected by `proxy.ts` — unauthenticated users are redirected to `/admin/login`. Only Google accounts with an `@thebrave.no` email can sign in.

| Route | Description |
|---|---|
| `/admin/login` | Google sign-in page (excluded from auth check) |
| `/admin` | Dashboard: table of all submissions, stats, link to create new |
| `/admin/new` | Form to generate a new client link |
| `/admin/submissions/[id]` | View answers for one submission, numeric bar chart, CSV download |
| `/admin/questions` | Toggle questions active/inactive, reorder with ↑↓ buttons |

---

## Client Route (`/k/[token]`)

A **Server Component** that:
1. Looks up the `Submission` by token
2. If not found → renders "Link ikke funnet"
3. If already submitted → renders "Allerede besvart"
4. If pending → fetches active questions from DB (falls back to the static catalog if DB is empty) and passes them to the `<Questionnaire>` component

**Integration point for Andreas:** replace the placeholder in `app/k/[token]/page.tsx` with:
```tsx
<Questionnaire token={token} questions={questions} />
```
The component receives `token: string` and `questions: Question[]`. On submit it calls `submitBaseline(token, answers)` from `app/actions.ts`.

---

## CSV Export (`/api/export/[token]`)

Auth-protected GET endpoint. Returns a UTF-8 CSV with one row per question:

```
Kunde, Bedrift, Spørsmål ID, Spørsmål, Svar, Hoppet over, Innsendt
```

Returns `401` if not signed in, `404` if the token doesn't exist.

---

## Useful Commands

```bash
npm run dev                          # start dev server on :3000
npx prisma studio                    # open visual DB browser
npx prisma migrate dev --name <name> # apply schema changes
npx prisma db seed                   # re-seed questions + test submission
npx tsc --noEmit                     # type-check without compiling
```

Test submission available at:
```
http://localhost:3000/k/test-onboarding-demo
```
