# Backend: Brave Customer Onboarding Questionnaire

Welcome to the project. This document covers everything you need to build the backend for the Brave onboarding questionnaire. The frontend is being built separately — your job is to wire up the data layer and URL routing underneath it.

---

## What This App Does

Brave sends a unique link to a customer (e.g. `https://gettoknow.thebrave.no/k/abc123`). The customer clicks through ~10 questions about their sales and marketing situation, and submits. Brave uses the captured data internally to track and demonstrate growth over time.

**No customer login. No signup.** Access is entirely via the unguessable token in the URL.

---

## Your Responsibilities

### 1. Database (Prisma + PostgreSQL)

A starter schema is ready at `../design_handoff_onboarding/starter/schema.prisma.txt`. Copy it to `prisma/schema.prisma` and adapt as needed.

Two models:

**`Submission`** — one row per questionnaire link Brave generates.
- `token` — the unguessable slug in the URL (use `nanoid()`)
- `customerName`, `companyName` — optional labels for Brave's internal view
- `status` — `"pending"` (link sent, not yet answered) or `"submitted"`
- `submittedAt` — timestamp when the customer finished

**`Answer`** — one row per question per submission.
- `questionId` — matches the `id` field in `lib/questions.ts` (e.g. `"revenue"`, `"leads"`)
- `value` — the raw string the customer typed
- `skipped` — `true` if the customer clicked "Vet ikke / Har ikke tall på det"

Questions themselves are **not** in the database — they live in `lib/questions.ts` as a static array. Keep it that way for now.

### 2. Route: `/k/[token]`

`app/k/[token]/page.tsx` — a Server Component that:
1. Reads `params.token`
2. Looks up the `Submission` in the database
3. If not found or already `"submitted"` → render an appropriate message
4. If `"pending"` → render the `<Questionnaire>` client component, passing the `token` as a prop

### 3. Server Action: `submitBaseline`

`app/actions.ts` — a `'use server'` function the frontend calls on submit:

```ts
export async function submitBaseline(
  token: string,
  answers: Record<string, string>  // questionId → value, or "__SKIPPED__" sentinel
): Promise<{ ok: boolean }>
```

What it should do:
1. Find the `Submission` by `token` — return `{ ok: false }` if not found or already submitted
2. For each entry in `answers`: create or upsert an `Answer` row, setting `skipped: true` if the value is the string `"__SKIPPED__"`
3. Set `submission.status = "submitted"` and `submission.submittedAt = new Date()`
4. Return `{ ok: true }`

The frontend handles the success/error state — you just return `{ ok: boolean }`.

### 4. Link Generation (internal Brave tooling)

Brave needs a way to generate new questionnaire links. This can be as simple as a script or a protected admin route for now. The flow:

```ts
import { nanoid } from "nanoid"

// Create a new submission row with a fresh token
const token = nanoid(12)  // e.g. "V1StGXR8_Z5j"
await prisma.submission.create({
  data: { token, customerName: "Acme AS", companyName: "Acme", status: "pending" }
})
// The link becomes: /k/V1StGXR8_Z5j
```

---

## The Frontend/Backend Interface

The only place frontend and backend meet is this one function signature:

```ts
// app/actions.ts
'use server'
export async function submitBaseline(
  token: string,
  answers: Record<string, string>
): Promise<{ ok: boolean }>
```

The frontend will call this on submit. While building, it's mocked with a `console.log`. Swap in the real implementation when the DB is ready — the frontend doesn't change.

---

## Suggested Setup Order

1. `npm install prisma @prisma/client nanoid`
2. Copy `../design_handoff_onboarding/starter/schema.prisma.txt` → `prisma/schema.prisma`
3. Set up `DATABASE_URL` in `.env.local`
4. `npx prisma migrate dev --name init`
5. Create `app/k/[token]/page.tsx` — token validation + render
6. Create `app/actions.ts` — `submitBaseline`
7. Create a simple seed/script to generate test links

---

## Key Files to Know

| Path | What it is |
|---|---|
| `lib/types.ts` | Shared TypeScript types — `Question`, `AnswerMap`, `SKIPPED` sentinel |
| `lib/questions.ts` | The 10 questions as a static array — `questionId` values here match your DB |
| `lib/formatAnswer.ts` | Answer formatting for display (frontend only, FYI) |
| `app/globals.css` | Brave design tokens — ignore unless you touch UI |
| `../design_handoff_onboarding/starter/schema.prisma.txt` | Starter Prisma schema |

---

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://..."
```

---

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL (you set this up)
- `nanoid` for token generation (you install this)
