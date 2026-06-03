# Backend: Vekstprofil — Brave Customer Onboarding Questionnaire

Hey George! This document covers everything you need to build the backend. The frontend (Andreas) and backend (you) are being built in parallel in the same Next.js repo — your work is the data layer, server actions, auth, and admin routes underneath the UI.

---

## What This App Does

Brave sends a unique link to a client (e.g. `https://vekstprofil.thebrave.no/k/abc123`). The client answers 15 questions about their current sales situation ("nullpunkt") with no login required. Answers are auto-saved per question as the client progresses — they may take days to complete.

Brave admins view results in a protected dashboard and compare rounds over time to demonstrate growth.

**Clients:** no login, access via unguessable token in URL  
**Brave admins:** authenticated via Google OAuth (Auth.js), `@thebrave.no` accounts only

---

## Stack

- **Next.js 16** (App Router) — same repo as frontend, no separate backend service
- **TypeScript**
- **Prisma** — ORM
- **PostgreSQL** — primary database
- **Auth.js (NextAuth v5)** — Google OAuth for admin section
- **nanoid** — token generation for client links

All server-side logic lives in Next.js Server Actions. No separate API server needed.

---

## Data Model

The hierarchy is: **Client → SubmissionRound → Question (copied) → Answer**

### Why "copied" questions?

When a new round is created for a client, the default question template is **copied** into that round. Editing questions for one round never touches other rounds or the template. This gives immutable historical snapshots needed for growth comparison over time.

---

### `Client`

Represents a Brave customer company.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `name` | String | Company name |
| `contactName` | String | Person's name |
| `contactEmail` | String? | Optional |
| `createdAt` | DateTime | Auto |

One client can have many `SubmissionRound`s over time.

---

### `SubmissionRound`

One round = one questionnaire link sent to a client.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `clientId` | String | FK → Client |
| `token` | String (unique) | URL slug — generate with nanoid(10) |
| `status` | String | `"pending"` \| `"submitted"` |
| `createdAt` | DateTime | Auto |
| `submittedAt` | DateTime? | Set when client completes |

> **Status flow:** `"pending"` → admin can still edit questions → client fills in → `"submitted"`.

---

### `Question`

A round-scoped copy of one template question. Copied from `QuestionTemplate` on round creation.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `roundId` | String | FK → SubmissionRound |
| `order` | Int | Display order |
| `category` | String | Eyebrow label, e.g. `"Team"`, `"Pipeline"` |
| `label` | String | The question text |
| `help` | String | Supporting sentence shown below label |
| `placeholder` | String | Input placeholder |
| `type` | String | `"number"` \| `"text"` \| `"boolean"` \| `"select"` \| `"multiselect"` |
| `prefix` | String? | Left affix, e.g. `"kr"` |
| `suffix` | String? | Right affix, e.g. `"%"`, `"selgere"` |
| `options` | Json? | `string[]` — choices for `select` and `multiselect` types |
| `slider` | Json? | `{ min, max, step }` — optional slider config for `number` type |

---

### `Answer`

One row per question per round, upserted as the client progresses.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `roundId` | String | FK → SubmissionRound |
| `questionId` | String | FK → Question |
| `value` | String? | Raw answer (null if skipped) |
| `skipped` | Boolean | `true` if client clicked "Vet ikke / Har ikke tall på det" |
| `updatedAt` | DateTime | Auto-updated on upsert |

Unique constraint on `(roundId, questionId)` — one answer per question per round.

---

### `QuestionTemplate`

The default question catalog. Admins edit this; new rounds copy from it.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `order` | Int | Display order |
| `category` | String | |
| `label` | String | |
| `help` | String | |
| `placeholder` | String | |
| `type` | String | Same type enum as Question |
| `prefix` | String? | |
| `suffix` | String? | |
| `options` | Json? | |
| `slider` | Json? | |
| `active` | Boolean | Soft delete — hide without losing data |

> Seed this table from `lib/questions.ts` on first migration. The shape is identical.

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Client {
  id           String            @id @default(cuid())
  name         String
  contactName  String
  contactEmail String?
  createdAt    DateTime          @default(now())
  rounds       SubmissionRound[]
}

model SubmissionRound {
  id          String     @id @default(cuid())
  clientId    String
  client      Client     @relation(fields: [clientId], references: [id])
  token       String     @unique
  status      String     @default("pending")
  createdAt   DateTime   @default(now())
  submittedAt DateTime?
  questions   Question[]
  answers     Answer[]
}

model Question {
  id          String          @id @default(cuid())
  roundId     String
  round       SubmissionRound @relation(fields: [roundId], references: [id])
  order       Int
  category    String
  label       String
  help        String
  placeholder String
  type        String
  prefix      String?
  suffix      String?
  options     Json?
  slider      Json?
  answers     Answer[]
}

model Answer {
  id         String          @id @default(cuid())
  roundId    String
  round      SubmissionRound @relation(fields: [roundId], references: [id])
  questionId String
  question   Question        @relation(fields: [questionId], references: [id])
  value      String?
  skipped    Boolean         @default(false)
  updatedAt  DateTime        @updatedAt

  @@unique([roundId, questionId])
}

model QuestionTemplate {
  id          String   @id @default(cuid())
  order       Int
  category    String
  label       String
  help        String
  placeholder String
  type        String
  prefix      String?
  suffix      String?
  options     Json?
  slider      Json?
  active      Boolean  @default(true)
}
```

---

## Server Actions

All actions live in `app/actions.ts`. These are the integration points the frontend calls.

### Client-facing (called from `/k/[token]`)

#### `getSubmission(token)`
```ts
'use server'
export async function getSubmission(token: string): Promise<{
  status: 'not_found' | 'submitted' | 'ok'
  round?: {
    id: string
    questions: Question[]      // ordered by `order`
    answers: Record<string, { value: string | null; skipped: boolean }>
  }
}>
```
Called by the server component on page load. Returns questions + any existing answers so the client can resume where they left off.

---

#### `saveAnswer(token, questionId, value)`
```ts
'use server'
export async function saveAnswer(
  token: string,
  questionId: string,
  value: string | typeof SKIPPED   // SKIPPED = "__SKIPPED__" from lib/types.ts
): Promise<{ ok: boolean }>
```
Called every time the client clicks **Neste** or **Hopp over** on a question. Upserts the Answer row.

- If `value === "__SKIPPED__"` → set `skipped: true`, `value: null`
- If round is already `"submitted"` → return `{ ok: false }` (no overwrites)
- Return `{ ok: true }` on success

---

#### `submitRound(token)`
```ts
'use server'
export async function submitRound(
  token: string
): Promise<{ ok: boolean }>
```
Called when the client reaches the final confirmation screen. Sets `status = "submitted"` and `submittedAt = new Date()`.

---

### Admin-facing (called from `/admin/*` — session required)

#### `createClient(data)`
```ts
export async function createClient(data: {
  name: string
  contactName: string
  contactEmail?: string
}): Promise<Client>
```

---

#### `createRound(clientId)`
```ts
export async function createRound(clientId: string): Promise<{ token: string }>
```
1. Generate token with `nanoid(10)`
2. Fetch all active `QuestionTemplate` rows (ordered by `order`)
3. Create `SubmissionRound` + copy each template row as a `Question` linked to the new round
4. Return `{ token }`

---

#### `listClients()`
Returns all clients with their rounds (id, status, createdAt, submittedAt).

---

#### `getRound(roundId)`
Returns full round with all questions and answers. Used in the admin detail view.

---

#### `updateQuestion(questionId, data)`
```ts
export async function updateQuestion(
  questionId: string,
  data: Partial<Pick<Question, 'label' | 'help' | 'placeholder' | 'order'>>
): Promise<void>
```
Lets admin customize a question for a specific round before sending the link. Only edits the round-scoped copy, not the template.

---

#### `updateTemplateQuestion(id, data)` / `listTemplateQuestions()`
CRUD for the default template. Changes here only affect **future** rounds.

---

## Client Route: `/k/[token]`

`app/k/[token]/page.tsx` — Server Component:

```ts
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>   // NOTE: params is a Promise in Next.js 16
}) {
  const { token } = await params
  const result = await getSubmission(token)

  if (result.status === 'not_found') return <LinkNotFound />
  if (result.status === 'submitted')  return <AlreadySubmitted />

  return <Skjema token={token} questions={result.round.questions} existingAnswers={result.round.answers} />
}
```

---

## Authentication (Auth.js + Google OAuth)

Protect all `/admin/*` routes. Only `@thebrave.no` accounts may sign in.

```bash
npm install next-auth@beta @auth/prisma-adapter
```

Setup steps:
1. Create a Google OAuth app — callback URL: `https://vekstprofil.thebrave.no/api/auth/callback/google`
2. Add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` to `.env.local`
3. Create `auth.ts` at project root — add `signIn` callback to restrict to `@thebrave.no` emails
4. Add `app/api/auth/[...nextauth]/route.ts`
5. Protect `/admin` layout with session check (redirect to `/api/auth/signin` if no session)

Auth.js v5 docs: https://authjs.dev/getting-started/installation

---

## Admin Routes `/admin/*`

| Route | Purpose |
|---|---|
| `/admin` | Dashboard: all clients + round statuses |
| `/admin/clients/new` | Create a new client |
| `/admin/clients/[id]` | Client detail: all rounds, compare over time |
| `/admin/rounds/[id]` | View a single round's answers |
| `/admin/rounds/[id]/edit` | Edit questions before sending the link |
| `/admin/template` | Edit the default question template |

---

## Setup Order

```bash
# 1. Install dependencies
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter nanoid

# 2. Set up Prisma
npx prisma init
# → paste the schema above into prisma/schema.prisma

# 3. Add environment variables to .env.local
DATABASE_URL="postgresql://..."
AUTH_SECRET=""           # generate: npx auth secret
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# 4. Run first migration
npx prisma migrate dev --name init

# 5. Seed template questions + a test client + test round
npx prisma db seed
# → seed from lib/questions.ts (shape is identical to QuestionTemplate)

# 6. Implement getSubmission, saveAnswer, submitRound
# 7. Implement /k/[token] page
# 8. Implement Auth.js
# 9. Build admin routes + admin server actions
```

---

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/vekstprofil"
AUTH_SECRET=""           # generate with: npx auth secret
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

---

## Key Files

| Path | What it is |
|---|---|
| `lib/types.ts` | Shared types — `Question`, `AnswerMap`, `SKIPPED`, `QuestionType` |
| `lib/questions.ts` | Static question list — seed `QuestionTemplate` from this |
| `design_handoff_onboarding/README.md` | Full UI spec — useful context for what data the frontend needs |
| `CLAUDE.md` | Project-wide notes, architecture decisions, Next.js 16 gotchas |

---

## Important Next.js 16 Gotcha

`params` in page components is a **Promise** — always await it:

```ts
// ✅ correct
const { token } = await params

// ❌ wrong — throws in Next.js 16
const { token } = params
```
