# Backend: Brave Customer Onboarding Questionnaire

Hey George! This document covers everything you need to build the backend. The frontend (Andreas) and backend (you) are being built in parallel in the same Next.js repo — your work is the data layer, routing, auth, and admin functionality underneath the UI.

---

## What This App Does

Brave sends a unique link to a client (e.g. `https://onboarding.thebrave.no/k/abc123`). The client answers ~10 questions about their sales situation and submits. Brave views the results in a protected admin dashboard. The captured data is the client's "baseline" — Brave revisits it later to demonstrate growth.

**Clients:** no login, access via unguessable token in URL
**Brave admins:** authenticated via Google OAuth (Auth.js)

---

## Stack

- **Next.js 16** (App Router) — same repo as frontend, no separate backend service needed
- **TypeScript**
- **Prisma** — ORM for database access
- **PostgreSQL** — primary database
- **Auth.js (NextAuth v5)** — Google OAuth for admin section
- **nanoid** — token generation for client links

This is all Node.js. No Django, no separate API server — Next.js Server Actions handle everything server-side.

---

## Your Responsibilities

### 1. Database (Prisma + PostgreSQL)

A starter schema is at `design_handoff_onboarding/starter/schema.prisma.txt`. Copy it to `prisma/schema.prisma` and extend it.

You'll need these models:

**`Submission`** — one row per questionnaire link Brave generates
- `token` — unguessable URL slug (nanoid)
- `customerName`, `companyName` — labels for Brave's admin view
- `status` — `"pending"` | `"submitted"`
- `submittedAt` — timestamp on completion

**`Answer`** — one row per question per submission
- `questionId` — matches `id` in `lib/questions.ts` (e.g. `"revenue"`, `"leads"`)
- `value` — raw string the client typed
- `skipped` — `true` if client clicked "Vet ikke / Har ikke tall på det"

**`Question`** — the question catalog (so admins can add/edit/delete questions without a deploy)
- `id` — stable slug, never reuse
- `category` — eyebrow label (e.g. `"Økonomi"`)
- `label` — the question text
- `help` — supporting sentence
- `placeholder`
- `type` — `"number"` | `"text"`
- `prefix` — optional left affix (e.g. `"kr"`)
- `suffix` — optional right affix (e.g. `"%"`, `"leads / mnd"`)
- `order` — display order
- `active` — soft delete / hide without losing historical data

> **Note:** Questions are currently hardcoded in `lib/questions.ts` for the frontend MVP. Once the DB is ready, the frontend will fetch them server-side instead. The shape is identical — same fields.

**`User`** (Auth.js managed — add if using Prisma adapter)

### 2. Authentication (Auth.js + Google OAuth)

Protect all `/admin/*` routes so only Brave team members can access them.

```bash
npm install next-auth@beta @auth/prisma-adapter
```

Setup steps:
1. Create a Google OAuth app in Google Cloud Console — callback URL: `https://your-domain/api/auth/callback/google`
2. Add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` to `.env.local`
3. Create `auth.ts` at the project root
4. Add `app/api/auth/[...nextauth]/route.ts`
5. Protect `/admin` routes via middleware or layout-level session check
6. Optionally restrict to `@thebrave.no` emails in the Auth.js `signIn` callback

Auth.js v5 docs: https://authjs.dev/getting-started/installation

### 3. Client Route: `/k/[token]`

`app/k/[token]/page.tsx` — a Server Component:

```ts
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params  // NOTE: params is a Promise in Next.js 16
  // 1. Look up Submission by token
  // 2. If not found → show "Link ikke funnet"
  // 3. If status === "submitted" → show "Allerede besvart"
  // 4. If status === "pending" → render <Questionnaire token={token} questions={questions} />
}
```

### 4. Server Action: `submitBaseline`

`app/actions.ts`:

```ts
'use server'
export async function submitBaseline(
  token: string,
  answers: Record<string, string>  // questionId → value, or "__SKIPPED__" sentinel
): Promise<{ ok: boolean }>
```

Steps:
1. Find `Submission` by token — return `{ ok: false }` if missing or already submitted
2. For each answer: upsert an `Answer` row — set `skipped: true` if value is `"__SKIPPED__"`
3. Set `submission.status = "submitted"`, `submission.submittedAt = new Date()`
4. Return `{ ok: true }`

> The frontend calls this on submit and handles the UI response. It's mocked with `console.log` until you implement it — no coordination needed to unblock either of you.

### 5. Admin Routes `/admin/*`

Protected pages for Brave internal use:

- `/admin` — dashboard: list of all submissions with status
- `/admin/new` — generate a new client link (takes customerName, companyName)
- `/admin/submissions/[id]` — view a single submission with charts/visual summary
- `/admin/questions` — manage the question catalog (add, edit, reorder, deactivate)

Visual charts for numeric answers (revenue, leads, close rate, etc.) can use **Recharts** — a React charting library that works well with Next.js.

### 6. CSV Export (interim, before charts)

Simple route handler that returns a CSV of all answers for a submission:

```ts
// app/api/export/[token]/route.ts
export async function GET(req, { params }) { ... }
```

---

## Setup Order

```bash
# 1. Install dependencies
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter nanoid recharts

# 2. Set up Prisma
npx prisma init
# → copy design_handoff_onboarding/starter/schema.prisma.txt into prisma/schema.prisma and extend it

# 3. Add environment variables to .env.local
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."           # run: npx auth secret
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# 4. Run first migration
npx prisma migrate dev --name init

# 5. Seed some test data (questions + a test submission)
npx prisma db seed

# 6. Implement /k/[token] route
# 7. Implement submitBaseline server action
# 8. Implement Auth.js
# 9. Build admin routes
```

---

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/brave_onboarding"
AUTH_SECRET=""           # generate with: npx auth secret
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

---

## Key Files

| Path | What it is |
|---|---|
| `lib/types.ts` | Shared types — `Question`, `AnswerMap`, `SKIPPED` |
| `lib/questions.ts` | Current static question list — your DB Question model uses the same shape |
| `design_handoff_onboarding/starter/schema.prisma.txt` | Starter Prisma schema |
| `design_handoff_onboarding/README.md` | Full UI spec — useful context for what data the frontend needs |
| `CLAUDE.md` | Project-wide notes including architecture and important Next.js 16 gotchas |

---

## Important Next.js 16 Gotcha

`params` in page components is a **Promise** — you must await it:

```ts
// ✅ correct
const { token } = await params

// ❌ wrong — will throw in Next.js 16
const { token } = params
```
