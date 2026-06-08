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
- Customer management — create customers, view all customers and their history
- Create surveys — either from a Template or by hand-picking questions
- Manage Templates — named form compositions
- Manage the question catalog — add, edit questions
- View responses per customer/survey
- Compare surveys over time to demonstrate growth

### Data Model

Seven tables. `TemplateQuestion` and `SurveyQuestion` are junction tables that resolve many-to-many relationships.

**Key principle: Questions are not copied.** A Survey references Questions directly via `SurveyQuestion`. Questions are mutable — fixing a typo updates all Surveys using that question (intentional).

Key entities:
- `Customer` — the client company
- `Template` — a named, reusable form composition
- `TemplateQuestion` — junction: which questions belong to a template (with order)
- `Question` — the question catalog; only `label` and `type` are required
- `Survey` — one form sent to one customer; status: `draft | active | submitted`
- `SurveyQuestion` — junction: which questions belong to a survey (with order)
- `Answer` — auto-saved per question per survey; unique on `(surveyId, questionId)`

## Architecture

- **Client route:** `/k/[token]` — public questionnaire, token-gated
- **Admin routes:** `/admin/*` — protected by Auth.js (Google OAuth, @thebrave.no accounts only)
- **Root `/`** — smart redirect: logged in → `/admin`, not logged in → `/admin/login`
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
- **@dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) — drag-and-drop for question reordering in survey/template editors

## Key Files

| File | Purpose |
|---|---|
| `app/globals.css` | All design tokens (`@theme`) + base styles. Edit here, not in a config file. |
| `app/layout.tsx` | Root layout — fonts (Fraunces via next/font, Satoshi via link tag), grain overlay, DevNav |
| `lib/types.ts` | Shared types: `Question`, `AnswerMap`, `SKIPPED` sentinel |
| `lib/questions.ts` | Question catalog — static array, also seeded to DB via `prisma/seed.ts` |
| `lib/formatAnswer.ts` | Formats raw answers for the summary screen |
| `app/actions.ts` | All server actions — customer-facing (`getSurvey`, `saveAnswer`, `submitSurvey`) and admin |
| `auth.ts` | Auth.js config — Google OAuth, restricted to @thebrave.no |
| `prisma/schema.prisma` | Full DB schema |
| `prisma/seed.ts` | Seeds 15 questions, default template, test survey (dev/staging only) |
| `design_handoff_onboarding/README.md` | Full UI spec — screens, interactions, copy, tokens. Source of truth for UI. |
| `design_handoff_onboarding/reference/Brave Onboarding.html` | Working HTML prototype — open in browser to see intended UX |
| `BACKEND.md` | Backend setup guide for George |
| `components/ui/SortableQuestion.tsx` | Reusable drag-and-drop question row — accepts `item`, `index`, optional `action` slot |
| `components/admin/NewQuestionForm.tsx` | Question creation form — accepts optional `onCreated(q: {id, label, category})` callback; when provided, calls back instead of navigating to `/admin/questions` (used for modal embedding in survey editor) |

## Design System

All Brave design tokens live in `app/globals.css` under `@theme`. Key values:

- **Fonts:** Satoshi (body), Fraunces (display/headings)
- **Primary bg:** `--color-ink: #f5efe3` (warm cream — NOT white)
- **Brand:** `--color-brand: #142a4b` (dark navy)
- **Accent:** `--color-accent: #0c8ba0` (teal)
- **Card radius:** `--radius-card: 1.25rem`

Always refer to `design_handoff_onboarding/README.md` for exact spacing, copy, and interaction specs before building a component. Build directly from spec — no need for brainstorming/mockup phase when spec is available.

**Admin list page pattern:** Use `app/admin/surveys/page.tsx` as the reference layout for list pages. Key elements: overline label (`text-[11px] font-bold uppercase tracking-[0.12em] text-muted`) above `font-display text-[28px] leading-none text-cloud` h1, section headers with colored dot + divider line, row-based card list (`rounded-card bg-midnight shadow-card overflow-hidden`) with `px-5 py-3.5` rows and `border-b border-line` separators. No stat/number cards on list pages.

## Important Notes

- **Tailwind v4:** No `tailwind.config.ts`. Tokens go in `globals.css` `@theme` block. Font `@import`s must NOT be in CSS — use `<link>` tags in `layout.tsx`.
- **Next.js 16 has breaking changes** from earlier versions. Always check `node_modules/next/dist/docs/` before using routing APIs, params, or server actions.
- **`params` is a Promise** in Next.js 16 page components — always `await params` before accessing properties.
- **Questions are DB-backed** — `lib/questions.ts` is the static source used for seeding and the Summary component. `Survey.tsx` receives questions as props from `getSurvey()`.
- **Pair programming style** — Andreas does frontend, George does backend.
- **Auto-save, not submit-on-finish** — `saveAnswer(token, questionId, value)` called fire-and-forget on each Next/Skip. `submitSurvey(token)` called on final confirm.
- **Code language is English** — all identifiers, function names, comments in English. UI copy stays Norwegian.
- **Caching architecture (George):** All major DB queries use `unstable_cache` in `actions.ts`. Never query DB directly in new admin pages — use the exported action. Tags: `questions`, `templates`, `customers`, `surveys`.
- **Cache invalidation:** After mutations, call both `revalidateTag` AND `revalidatePath` for affected pages — `revalidateTag` alone doesn't bust the client-side router cache.
- **Dates from `unstable_cache`:** Come out as strings, not `Date` objects. Always wrap with `new Date(...)` before calling `.toISOString()` or other date methods.
- **DndContext hydration mismatch:** Always pass a stable `id` prop to `DndContext` (e.g. `id="survey-questions"`) — otherwise dnd-kit generates mismatched `aria-describedby` IDs between SSR and client.
- **shadow-card z-index:** `shadow-card` is 40px deep — elements directly below a card get visually covered. Fix: `relative z-0` on the card, `relative z-10` on the element below.
- **Centering form pages:** Content containers with `max-w-*` need `mx-auto` to be centered within `AdminShell`'s `max-w-5xl` wrapper.
- **Modal backdrop:** Never add `overflow-y-auto` to `fixed inset-0 flex items-center justify-center` — it breaks backdrop coverage. Use the plain version; the form fits the viewport.
- **Modal confirm pattern:** Use `deleting` / `creating` state (Question | null or boolean) — show inline modal, Escape closes via `useEffect`. See `QuestionsClient.tsx` for reference implementation with all three modals (create, edit, delete).
- **Grid two-column rows:** Use `minmax(0,X%) minmax(0,Y%)` (not `auto`) for both columns to avoid collapse. `auto` on the right column can collapse or overflow with long text content. Survey detail uses `"minmax(0,55%) minmax(0,45%)"`.
- **deleteQuestion cascade:** `SurveyQuestion` and `Answer` lack `onDelete: Cascade` from the question side — must manually delete both before `db.question.delete`. `TemplateQuestion` has cascade, so it's handled automatically.

## Component Structure (current)

**Convention:** `app/` contains only Next.js route files (`page.tsx`, `layout.tsx`, `route.ts`). All components live in `components/`.

```
components/
  survey/
    Survey.tsx        — stateful orchestrator ('use client'), direction + focusTrigger state, Framer Motion variants
    Intro.tsx         — intro card
    QuestionCard.tsx  — all 5 input types: text, number, boolean, select, multiselect
    Summary.tsx       — review all answers, click row to jump back
    Submitted.tsx     — confirmation screen
    Progressbar.tsx   — animated progress bar (visible on question stages only)
  admin/
    shell/                  — admin layout infrastructure (always loaded together)
      AdminShell.tsx        — 'use client', collapsed state, AnimatePresence sidebar, provides AdminShellContext
      AdminShellContext.tsx — createContext({ collapsed, onOpen }); useSidebar() hook
      AdminSidebar.tsx      — sticky sidebar card: active/submitted survey lists + status dots; onCollapse prop
      AdminTopNav.tsx       — 'use client', usePathname active state, nav: Dashboard/Kunder/Surveys/Maler/Spørsmål
      SidebarToggle.tsx     — 'use client', consumes useSidebar(); renders › arrow only when collapsed
    ActivityFeed.tsx        — (unused, commented out)
    AddQuestionsPanel.tsx   — slide-in panel for adding questions to surveys/templates
    CopyLinkButton.tsx      — copies survey link to clipboard
    DeleteCustomerButton.tsx
    EditQuestionForm.tsx    — edit question form (used in modal in QuestionsClient)
    EditSurveyClient.tsx    — 'use client' wrapper for survey edit page
    EditTemplateClient.tsx  — 'use client' wrapper for template edit page
    EmptyState.tsx          — empty state card
    NewCustomerForm.tsx
    NewQuestionForm.tsx     — accepts optional onCreated() callback for modal embedding
    NewSurveyForm.tsx
    NewTemplateForm.tsx
    PageHeader.tsx          — overline + h1 + CTA button used on list pages
    QuestionsClient.tsx     — 'use client', owns create/edit/delete modal states for questions page
    SectionHeader.tsx       — colored dot + divider + count used on list pages
  ui/
    PrimaryButton.tsx
    GhostButton.tsx
    BrandBar.tsx
    Arrow.tsx
    SortableQuestion.tsx  — drag-and-drop question row used in survey/template edit pages
  form/
    FormField.tsx         — label + input wrapper for admin forms
    FormSubmitButton.tsx  — submit button with pending state
  dev/
    DevNav.tsx        — fixed bottom-right nav (dev only), links to all routes + seed data
```

`Survey.tsx` and `AdminShell.tsx` are the stateful components. Everything else is presentational.

### Key implementation notes

**Framer Motion (Survey):**
- Variants use `"110vw"` for x-translation (CSS viewport unit — avoids measuring unmounted element width)
- `overflow-hidden` wrapper around AnimatePresence isolates sliding elements
- `focusTrigger` incremented only when `definition === "center"` (avoids double-fire from exit animation)
- `useReducedMotion` respected — opacity-only fallback variants

**Input storage format:**
- boolean: `"Ja"` / `"Ja\n{description}"` / `"Nei"`
- multiselect: options joined with `"\n"` (not `","` — option text may contain commas)
- `lib/formatAnswer.ts` handles both formats for Summary display

**Admin sidebar toggle:**
- `AdminShellContext` shares `collapsed` + `onOpen` between `AdminShell` and `AdminSidebar`
- `SidebarToggle` lives in `AdminShell` itself (absolute top-left of main content area) — do NOT add it to individual pages
- Main content is centered via `mx-auto max-w-5xl` wrapper in `AdminShell`

## External Product Name

The product is called **Vekstprofil** externally. Target URL: `https://vekstprofil.thebrave.no`.

## Current Build Status

### Done ✅

**Customer survey flow (`/k/[token]`):**
- Full survey flow: Intro → QuestionCard (×15) → Summary → Submitted
- `Survey.tsx` integrated with backend: `getSurvey` on load, `saveAnswer` fire-and-forget per question, `submitSurvey` on final submit
- Existing answers pre-loaded (customers can resume)
- Framer Motion slide transitions — directional slide + fade, `"110vw"` x-translate, `useReducedMotion` fallback
- All 5 input types in `QuestionCard.tsx`: text, number, boolean, select, multiselect
- Autofocus after animation settles (`onAnimationComplete` → `focusTrigger` increment)
- Keyboard shortcuts: `Enter` advances on number inputs, `Cmd/Ctrl+Enter` on textareas
- Progress bar, debug dev nav (bottom-left), DevNav (bottom-right)

**Admin UI:**
- Layout: topbar (h-12, AdminTopNav with active route highlighting) + collapsible sidebar + main content
- Sidebar: sticky card, lists active + submitted surveys, status dot summary, animated collapse/expand (Framer Motion)
- Sidebar toggle: absolute top-left in `AdminShell` main area — do not add to individual pages
- Main content centered: `mx-auto max-w-5xl` wrapper in `AdminShell`
- Dashboard (`/admin`): 4 stat cards, "Trenger oppfølging", "Nylig mottatt", "Siste kunder"
- Customer list at `/admin/customers`
- Survey detail (`/admin/surveys/[id]`): two-column grid `"minmax(0,55%) minmax(0,45%)"` — all answer types right-aligned in display font; `NotAnsweredPill` in right column; `max-w-3xl` card
- Question catalog (`/admin/questions`): create/edit/delete all in modals — no separate pages. `QuestionsClient` owns all three modal states (`creating`, `editing`, `deleting`). `deleteQuestion` action added to `actions.ts`.
- Active sidebar shows answered/total progress (x/y) per active survey (`SurveyItem.answeredCount` / `.totalQuestions`)
- Survey edit (`/admin/surveys/[id]/edit`): drag-and-drop reorder + add/remove questions, manual save via `setSurveyQuestions`
- Template edit (`/admin/templates/[id]/edit`): drag-and-drop reorder + remove questions, manual save via `setTemplateQuestions`

**Backend (George):**
- Full Prisma schema (7 tables)
- Auth.js Google OAuth (@thebrave.no only)
- All server actions: `getSurvey`, `saveAnswer`, `submitSurvey`, all admin CRUD
- CSV export at `/api/export/[token]`
- Seed: 15 questions, default template, test survey at `/k/test-onboarding-demo`

**Security:**
- `maxLength` on all inputs (2000 text, 30 number)
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP
- `type="button"` on all buttons
- Seed test data guarded — only created when `NODE_ENV !== "production"`
- `requireAuth()` guard on all admin server actions in `actions.ts`
- `saveAnswer` validates that `questionId` belongs to the survey before upserting

### In progress 🔄
- Nothing — ready for next admin pages

### Next up (in order) 🔜

**Admin pages to build:**
1. `/admin/customers` — customer list ✅ (done)
2. `/admin/customers/[id]` — customer detail + survey history
3. `/admin/customers/new` — create customer form ✅ (done)
4. `/admin/surveys` — survey list overview
5. `/admin/surveys/[id]` — view survey + answers ✅ (done)
6. `/admin/surveys/[id]/edit` — edit survey questions ✅ (done)
7. `/admin/surveys/new` — create survey (pick customer + template)
8. `/admin/templates` — list templates
9. `/admin/templates/new` — create template
10. `/admin/templates/[id]/edit` — edit template questions ✅ (done)
11. `/admin/questions` — question catalog ✅ (done)
12. `/admin/questions/new` — create question ✅ (done)
13. ~~`/admin/questions/[id]/edit`~~ — ikke nødvendig, redigering skjer i popup

### Waiting on George 🔒


## Code Reuse Backlog

Identified duplications to clean up, in priority order. Strike through + ✅ when done.

### High priority

1. ✅ ~~**`relativeTime()` — trikopiert funksjon** → `lib/formatTime.ts`~~
   ~~Identisk logikk i `AdminSidebar.tsx`, `surveys/page.tsx`, `ActivityFeed.tsx`. Flytt til lib og importer.~~

2. ✅ ~~**`PageHeader` — identisk toppseksjon på 3 list-sider**~~
   ~~`customers/page.tsx`, `surveys/page.tsx`, `templates/page.tsx` har samme overline + h1 + CTA-knapp.~~
   ~~→ `components/admin/PageHeader.tsx` med `{ title, label?, href, cta }` props.~~

3. ✅ ~~**`Eyebrow` — strek + uppercase-tekst i teal**~~
   ~~`Intro.tsx`, `QuestionCard.tsx`, `Summary.tsx`.~~
   ~~→ `components/ui/Eyebrow.tsx` med `{ label, className? }` props.~~

4. ✅ ~~**`FormField` — allerede laget i NewQuestionForm, ikke delt**~~
   ~~Lokal `Field`-helper i `NewQuestionForm.tsx` dekker behovet i alle admin-skjemaer.~~
   ~~→ `components/form/FormField.tsx`, brukt i NewQuestionForm, NewCustomerForm, NewTemplateForm, EditTemplateClient.~~

### Medium prioritet

5. ✅ ~~**`SectionHeader` — prikk + divider + teller, 3 list-sider**~~
   ~~Customers, surveys, templates bruker samme seksjonshode-mønster.~~
   ~~→ `components/admin/SectionHeader.tsx` med `{ label, count, dotColor? }` props.~~

6. ✅ ~~**`StatusBadge` + `lib/constants.ts` — status-maps redefinert 3+ steder**~~
   ~~`statusStyle`/`statusLabel`-maps gjenskapt i customers/page, surveys/page, customers/[id]/page.~~
   ~~→ `lib/constants.ts` med `SURVEY_STATUS` + `SurveyStatus` type. `components/ui/StatusBadge.tsx`.~~

7. ✅ ~~**`EmptyState` — tomt-kort-mønster på 4 list-sider**~~
   ~~Customers, surveys, templates, questions har identisk tom-tilstand-card.~~
   ~~→ `components/admin/EmptyState.tsx` med `{ title?, children }` props.~~

8. ✅ ~~**`FormSubmitButton` — submit-knapp med pending-state, 4 skjemaer**~~
   ~~Identisk disabled+opacity-knapp i alle new-skjemaer.~~
   ~~→ `components/form/FormSubmitButton.tsx` med `{ label, isPending, disabled?, fullWidth? }` props.~~

### Lav prioritet

9. ✅ ~~**`NotAnsweredPill` — definert på feil sted**~~
   ~~Laget i `surveys/[id]/page.tsx`, men `Summary.tsx` gjenskaper det inline.~~
   ~~→ `components/survey/NotAnsweredPill.tsx` med `{ skipped? }` prop.~~

10. ✅ ~~**`validateNumber()` — lokal util i QuestionCard**~~
    ~~→ `lib/validation.ts`.~~

## Dev Workflow

- **Test survey:** `/k/test-onboarding-demo` (seeded, active) — use Prisma Studio to reset status if accidentally submitted: `DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-) npx prisma studio`
- **DevNav:** fixed bottom-right on all pages in dev — links to all routes
- **Debug nav:** fixed bottom-left on survey pages in dev — jump between stages
- **Jira project:** braveaiteam.atlassian.net
