# Backend: Vekstprofil — Brave Customer Onboarding Questionnaire

Hey George! This document covers everything you need to build the backend. The frontend (Andreas) and backend (you) are being built in parallel in the same Next.js repo — your work is the data layer, server actions, auth, and admin routes underneath the UI.

---

## What This App Does

Brave sends a unique link to a client (e.g. `https://vekstprofil.thebrave.no/k/abc123`). The client answers 15 questions about their current sales situation with no login required. Answers are auto-saved per question as the client progresses — they may take days to complete.

Brave admins view results in a protected dashboard and compare surveys over time to demonstrate growth.

**Clients:** no login, access via unguessable token in URL
**Brave admins:** authenticated via Google OAuth (Auth.js), `@thebrave.no` accounts only

---

## Stack

- **Next.js 16** (App Router) — same repo as frontend, no separate backend service
- **TypeScript**
- **Prisma** — ORM
- **PostgreSQL** — primary database
- **Auth.js (NextAuth v5)** — Google OAuth for admin section
- **nanoid** — token generation for survey links

All server-side logic lives in Next.js Server Actions. No separate API server needed.

---

## Data Model

### Overview

```
Customer  ──< Survey >── Template
                │
          SurveyQuestion
                │
            Question
                │
             Answer
```

Seven tables total. `TemplateQuestion` and `SurveyQuestion` are junction tables that resolve many-to-many relationships — a Template has many Questions, and a Question can appear in many Templates (and many Surveys).

**Key principle: Questions are not copied.** A Survey references Questions directly via `SurveyQuestion`. Questions are mutable — fixing a typo or small wording issue updates all Surveys that use the question. This is intentional. For substantively different questions, create a new Question instead.

---

### `Customer`

A Brave client company. One customer can have many Surveys over time.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `companyName` | String | |
| `contactName` | String | |
| `contactEmail` | String? | |
| `createdAt` | DateTime | Auto |

---

### `Template`

A named, reusable form composition (e.g. "Ny-kunde Skjema", "Evaluerings-skjema"). Admins build templates by picking from existing Questions and/or writing new ones. Using a template when creating a Survey is optional — you can also hand-pick questions directly.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `name` | String | e.g. "Ny-kunde Skjema" |
| `description` | String? | |
| `active` | Boolean | `false` = archived, hidden from selection |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto-updated |

---

### `Question`

The question catalog. All questions live here — both those belonging to Templates and those added directly to Surveys. Seeded from `lib/questions.ts` on first migration.

When building a new Template or Survey, the UI surfaces all existing Questions as suggestions.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `label` | String | **Required** — the question text |
| `type` | String | **Required** — `"number"` \| `"text"` \| `"boolean"` \| `"select"` \| `"multiselect"` |
| `category` | String? | Eyebrow label, e.g. `"Team"`, `"Pipeline"` — optional |
| `help` | String? | Supporting sentence shown below label — optional |
| `placeholder` | String? | Input placeholder — optional |
| `prefix` | String? | Left affix, e.g. `"kr"` — optional |
| `suffix` | String? | Right affix, e.g. `"%"`, `"selgere"` — optional |
| `options` | Json? | `string[]` — choices for `select` and `multiselect` |
| `slider` | Json? | `{ min, max, step }` — optional slider for `number` type |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto-updated on edit |

> **Multiselect answers** are stored as JSON-encoded strings: `'["Inbound","Partnere"]'`. Parse on read.

---

### `TemplateQuestion` (junction)

Resolves the many-to-many between Template and Question. Holds the display order for questions within a specific template.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `templateId` | String | FK → Template |
| `questionId` | String | FK → Question |
| `order` | Int | Display order within this template |

---

### `Survey`

One survey = one link sent to one customer. Can be created from a Template (all its questions are added as SurveyQuestions) or built manually by hand-picking questions.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `customerId` | String | FK → Customer |
| `templateId` | String? | FK → Template — nullable, for reference only ("created from X") |
| `token` | String (unique) | URL slug — generate with `nanoid(10)` at creation |
| `status` | String | `"draft"` \| `"active"` \| `"submitted"` |
| `createdAt` | DateTime | Auto |
| `sentAt` | DateTime? | When the link was activated and sent to customer |
| `submittedAt` | DateTime? | When customer completed the form |

**Status flow:**
```
draft ──(admin activates)──▶ active ──(customer submits)──▶ submitted
```

- `draft` — survey is being set up, questions can be edited freely
- `active` — link is live, customer can fill in (whether or not they've started)
- `submitted` — customer has completed the form

> `/k/[token]` behaviour: `draft` → 404, `active` → show form, `submitted` → show confirmation screen

---

### `SurveyQuestion` (junction)

Resolves the many-to-many between Survey and Question. Holds the display order for questions within a specific survey.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `surveyId` | String | FK → Survey |
| `questionId` | String | FK → Question |
| `order` | Int | Display order within this survey |

---

### `Answer`

One row per question per survey, upserted as the customer progresses. The unique constraint on `(surveyId, questionId)` ensures at most one answer per question per survey.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | PK |
| `surveyId` | String | FK → Survey |
| `questionId` | String | FK → Question |
| `value` | String? | Raw answer — null if skipped |
| `skipped` | Boolean | `true` if customer clicked "Vet ikke / Har ikke tall på det" |
| `updatedAt` | DateTime | Auto-updated on each save |

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id           String   @id @default(cuid())
  companyName  String
  contactName  String
  contactEmail String?
  createdAt    DateTime @default(now())
  surveys      Survey[]
}

model Template {
  id          String             @id @default(cuid())
  name        String
  description String?
  active      Boolean            @default(true)
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  questions   TemplateQuestion[]
  surveys     Survey[]
}

model Question {
  id          String             @id @default(cuid())
  label       String
  type        String
  category    String?
  help        String?
  placeholder String?
  prefix      String?
  suffix      String?
  options     Json?
  slider      Json?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  templates   TemplateQuestion[]
  surveys     SurveyQuestion[]
  answers     Answer[]
}

model TemplateQuestion {
  id         String   @id @default(cuid())
  templateId String
  questionId String
  order      Int
  template   Template @relation(fields: [templateId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])
}

model Survey {
  id          String           @id @default(cuid())
  customerId  String
  templateId  String?
  token       String           @unique
  status      String           @default("draft")
  createdAt   DateTime         @default(now())
  sentAt      DateTime?
  submittedAt DateTime?
  customer    Customer         @relation(fields: [customerId], references: [id])
  template    Template?        @relation(fields: [templateId], references: [id])
  questions   SurveyQuestion[]
  answers     Answer[]
}

model SurveyQuestion {
  id         String   @id @default(cuid())
  surveyId   String
  questionId String
  order      Int
  survey     Survey   @relation(fields: [surveyId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])
}

model Answer {
  id         String   @id @default(cuid())
  surveyId   String
  questionId String
  value      String?
  skipped    Boolean  @default(false)
  updatedAt  DateTime @updatedAt
  survey     Survey   @relation(fields: [surveyId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])

  @@unique([surveyId, questionId])
}
```

> **Auth.js tables:** When you set up the Prisma adapter for Auth.js, add the required `User`, `Account`, `Session`, and `VerificationToken` models. See https://authjs.dev/getting-started/adapters/prisma for the exact schema — paste it alongside the models above.

---

## Server Actions

All actions live in `app/actions.ts`.

### Customer-facing (called from `/k/[token]`)

#### `getSurvey(token)`
```ts
'use server'
export async function getSurvey(token: string): Promise<{
  status: 'not_found' | 'draft' | 'submitted' | 'ok'
  survey?: {
    id: string
    questions: Array<Question & { order: number }>  // ordered by SurveyQuestion.order
    answers: Record<string, { value: string | null; skipped: boolean }>
  }
}>
```
Called by the server component on page load. Returns questions + any existing answers so the customer can resume where they left off.

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
Called every time the customer clicks **Neste** or **Hopp over**. Upserts the Answer row.

- If `value === "__SKIPPED__"` → set `skipped: true`, `value: null`
- If survey status is not `"active"` → return `{ ok: false }`
- Return `{ ok: true }` on success

---

#### `submitSurvey(token)`
```ts
'use server'
export async function submitSurvey(token: string): Promise<{ ok: boolean }>
```
Called when the customer reaches the final confirmation screen. Sets `status = "submitted"` and `submittedAt = new Date()`.

---

### Admin-facing (called from `/admin/*` — session required)

#### `createCustomer(data)`
Create a new customer.

#### `createSurvey(customerId, templateId?)`
1. Generate token with `nanoid(10)`
2. Create Survey with `status: "draft"`
3. If `templateId` provided: copy all its TemplateQuestion rows as SurveyQuestion rows
4. Return `{ token }`

#### `activateSurvey(surveyId)`
Set `status = "active"` and `sentAt = new Date()`. Call this when the admin sends the link to the customer.

#### `listCustomers()`
Return all customers with their surveys (id, status, createdAt, sentAt, submittedAt).

#### `getSurveyAdmin(surveyId)`
Return full survey with all questions and answers. Used in the admin detail view.

#### `addQuestionToSurvey(surveyId, questionId)` / `removeQuestionFromSurvey(surveyId, questionId)`
Add or remove a question from a draft survey.

#### `createQuestion(data)` / `updateQuestion(id, data)`
Manage the question catalog. Updates to existing questions apply retroactively to all surveys — this is intentional for typo fixes. For substantively different questions, create a new one.

#### `createTemplate(data)` / `updateTemplate(id, data)`
Manage templates.

---

## Client Route: `/k/[token]`

`app/k/[token]/page.tsx` — Server Component:

```ts
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>  // NOTE: params is a Promise in Next.js 16
}) {
  const { token } = await params
  const result = await getSurvey(token)

  if (result.status === 'not_found') return notFound()
  if (result.status === 'draft')     return notFound()
  if (result.status === 'submitted') return <Innsendt />

  return (
    <Skjema
      token={token}
      questions={result.survey.questions}
      existingAnswers={result.survey.answers}
    />
  )
}
```

---

## Authentication (Auth.js + Google OAuth)

```bash
npm install next-auth@beta @auth/prisma-adapter
```

1. Create a Google OAuth app — callback URL: `https://vekstprofil.thebrave.no/api/auth/callback/google`
2. Add env variables (see below)
3. Create `auth.ts` at project root — restrict to `@thebrave.no` emails in the `signIn` callback
4. Add `app/api/auth/[...nextauth]/route.ts`
5. Protect `/admin` layout with session check — redirect to sign-in if no session

Auth.js v5 docs: https://authjs.dev/getting-started/installation

---

## Admin Routes `/admin/*`

| Route | Purpose |
|---|---|
| `/admin` | Dashboard: all customers + survey statuses |
| `/admin/customers/new` | Create a new customer |
| `/admin/customers/[id]` | Customer detail: all surveys, compare over time |
| `/admin/surveys/new` | Create a new survey (pick customer + optional template) |
| `/admin/surveys/[id]` | View a survey's answers |
| `/admin/surveys/[id]/edit` | Edit questions on a draft survey |
| `/admin/templates` | List all templates |
| `/admin/templates/new` | Create a new template |
| `/admin/templates/[id]/edit` | Edit a template |
| `/admin/questions` | Browse and manage the question catalog |

---

## Setup Order

```bash
# 1. Install dependencies
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter nanoid

# 2. Set up Prisma
npx prisma init
# → paste the schema above into prisma/schema.prisma
# → also paste the Auth.js adapter models from https://authjs.dev/getting-started/adapters/prisma

# 3. Add environment variables to .env.local
DATABASE_URL="postgresql://..."
AUTH_SECRET=""       # generate: npx auth secret
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# 4. Run first migration
npx prisma migrate dev --name init

# 5. Seed questions + a default template + a test customer + test survey
npx prisma db seed
# → seed Questions from lib/questions.ts (same shape)
# → create a default Template using all 15 questions

# 6. Implement getSurvey, saveAnswer, submitSurvey
# 7. Implement /k/[token] page
# 8. Implement Auth.js
# 9. Build admin routes + admin server actions
```

---

## Environment Variables

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/vekstprofil"
AUTH_SECRET=""        # generate with: npx auth secret
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

---

## Key Files

| Path | What it is |
|---|---|
| `lib/types.ts` | Shared types — `Question`, `AnswerMap`, `SKIPPED`, `QuestionType` |
| `lib/questions.ts` | Static question list — seed the Question table from this |
| `design_handoff_onboarding/README.md` | Full UI spec — context for what data the frontend needs |
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
