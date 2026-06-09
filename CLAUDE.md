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
- **Root `/`** — smart redirect: logged in → `/admin`, not logged in → `/login`
- **Login page:** `/login` (NOT `/admin/login` — login lives outside admin layout to avoid redirect loop)
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
| `components/admin/questions/SortableQuestion.tsx` | Drag-and-drop question row — accepts `item`, `index`, `onRemove`, optional `onEdit` |
| `components/admin/questions/NewQuestionForm.tsx` | Question creation form — accepts optional `onCreated(q: {id, label, category})` callback; when provided, calls back instead of navigating to `/admin/questions` (used for modal embedding in survey editor) |
| `components/ui/primitives/Button.tsx` | CVA primitive — all variants, `buttonVariants` helper exported for class-only usage |

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
- **Modal confirm pattern:** Use `deleting` / `creating` state (Question | null or boolean) — show inline modal, Escape closes via `useEffect`. See `components/admin/questions/QuestionsClient.tsx` for reference implementation with all three modals (create, edit, delete).
- **Button heights:** All `Button` variants include `border` (transparent or visible) so every size renders identically tall. Never apply ad-hoc `py-*` to a button — use the `size` prop (`sm` / `md` / `lg`). Mixing `border` and `border-transparent` was the root cause of the old 36px/42px/38px drift.
- **Grid two-column rows:** Use `minmax(0,X%) minmax(0,Y%)` (not `auto`) for both columns to avoid collapse. `auto` on the right column can collapse or overflow with long text content. Survey detail uses `"minmax(0,55%) minmax(0,45%)"`.
- **deleteQuestion cascade:** `SurveyQuestion` and `Answer` lack `onDelete: Cascade` from the question side — must manually delete both before `db.question.delete`. `TemplateQuestion` has cascade, so it's handled automatically.
- **Middleware file is `proxy.ts`** (not `middleware.ts`) — same behaviour, just named differently. Protects `/admin/:path*`, redirects unauthenticated to `/login`.
- **`revalidateTag` requires TWO arguments in Next.js 16** — always call as `revalidateTag("surveys", {})`. The second argument is `CacheLifeConfig`; passing `{}` means purge immediately with no override.
- **`getTemplate(id)`** — cached action exists in `actions.ts`. Use it instead of querying `db.template.findUnique` directly.
- **`getCustomer(id)`** — cached with `unstable_cache` per ID, tagged `customers`. Use it in admin pages.

## Component Reuse Principle

Before writing any new HTML/JSX markup, ask: **could this become a component?**

Specifically:
- If you're writing any button → use the button system (see below)
- If you're writing a question + answer row → use `QuestionRow`
- If you're writing a page header with overline + h1 + CTA → use `PageHeader` (`components/layout/`)
- If you're writing a section header with dot + divider → use `SectionHeader` (`components/layout/`)
- If you're writing an empty state card → use `EmptyState` (`components/layout/`)
- If you're writing a submit button with pending state → use `FormSubmitButton`

**Button system (3 layers):**
1. **Primitive** — `components/ui/primitives/Button.tsx` (CVA, variants: `solid`, `ghost`, `danger`, `coral`, `accent`; sizes: `sm`, `md`, `lg`; also exports `buttonVariants` for class-only usage). Supports `href` (renders as `<Link>`), `loading`, `icon`, `fullWidth`.
2. **Semantic wrappers** — `components/ui/buttons/`: `SaveButton` (default `type="submit"`, variant solid), `DeleteButton` (variant danger, Trash2 icon), `CancelButton` (variant ghost). Pass `type="button"` to `SaveButton` when used with `onClick` outside a `<form>`.
3. **Domain** — `FormSubmitButton` in `components/form/` wraps `SaveButton` with loading/pending state for new-entity forms.

All variants have `border` (transparent or visible) — do NOT add ad-hoc padding or height classes to buttons. Use `size` prop instead.

**General rule:** If similar markup will plausibly appear in two or more places, extract a component before writing it the second time. When in doubt, flag it and ask.

## Component Structure (current)

**Convention:** `app/` contains only Next.js route files (`page.tsx`, `layout.tsx`, `route.ts`). All components live in `components/`.

```
components/
  survey/                          — customer-facing questionnaire flow
    Survey.tsx                     — stateful orchestrator ('use client'), direction + focusTrigger state, Framer Motion variants
    Intro.tsx                      — intro card
    QuestionCard.tsx               — all 5 input types: text, number, boolean, select, multiselect
    Summary.tsx                    — review all answers, click row to jump back
    Submitted.tsx                  — confirmation screen

  admin/
    shell/                         — admin layout infrastructure (always loaded together)
      AdminShell.tsx               — 'use client', collapsed state, AnimatePresence sidebar, provides AdminShellContext
      AdminShellContext.tsx        — createContext({ collapsed, onOpen }); useSidebar() hook
      AdminSidebar.tsx             — sticky sidebar card: active/submitted survey lists + status dots; onCollapse prop
      AdminTopNav.tsx              — 'use client', usePathname active state; Kunder has customer count badge
      SidebarToggle.tsx            — 'use client', consumes useSidebar(); renders › arrow only when collapsed
    customers/
      DeleteCustomerButton.tsx
      NewCustomerForm.tsx
    surveys/
      DeleteSurveyButton.tsx
      EditSurveyClient.tsx         — 'use client' wrapper for survey edit page; owns editing modal state
      NewSurveyForm.tsx
    templates/
      EditTemplateClient.tsx       — 'use client' wrapper for template edit page; owns editing modal state
      NewTemplateForm.tsx
    questions/
      AddQuestionsPanel.tsx        — slide-in panel for adding questions to surveys/templates
      EditQuestionForm.tsx         — edit question form (used in modal in QuestionsClient + edit clients)
      NewQuestionForm.tsx          — accepts optional onCreated() callback for modal embedding
      QuestionsClient.tsx          — 'use client', owns create/edit/delete modal states for questions page
      SortableQuestion.tsx         — drag-and-drop row: item, index, onRemove, optional onEdit (shows pencil)
    shared/
      ActivityFeed.tsx             — (unused, commented out)
      ConfirmDeleteButton.tsx      — confirm-before-delete pattern with inline confirmation step
      CopyLinkButton.tsx           — copies survey link to clipboard

  layout/                          — structural page-level components used across admin
    EmptyState.tsx                 — empty state card
    PageHeader.tsx                 — overline + h1 + CTA button used on list pages
    SectionHeader.tsx              — colored dot + divider + count used on list pages

  ui/
    primitives/                    — atomic, unstyled-ish building blocks
      Button.tsx                   — CVA primitive; exports buttonVariants for class-only usage
      Arrow.tsx
      Eyebrow.tsx                  — teal strek + uppercase label
      NotAnsweredPill.tsx          — "ikke besvart" pill; used in both survey Summary and admin detail
      Progressbar.tsx              — animated progress bar (survey flow)
      QuestionRow.tsx              — question + answer row with category eyebrow and `right` slot
      StatusBadge.tsx              — survey status pill (draft/active/submitted)
    brand/                         — Brave identity components
      BrandBar.tsx
      BraveLogo.tsx                — SVG logo; className sets size + color via currentColor
    buttons/                       — semantic wrappers around Button primitive
      SaveButton.tsx               — variant solid; default type="submit"; pass type="button" with onClick outside form
      DeleteButton.tsx             — variant danger; Trash2 icon
      CancelButton.tsx             — variant ghost

  form/
    FormField.tsx                  — label + input wrapper for admin forms
    FormSubmitButton.tsx           — wraps SaveButton with loading/pending state for new-entity forms

  dev/
    DevNav.tsx                     — fixed bottom-right nav (dev only), links to all routes + seed data
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
- Layout: topbar (h-14, BraveLogo as /admin link, AdminTopNav with active route highlighting + customer count badge) + collapsible sidebar + main content
- Sidebar: sticky card w-[222px], lists active + submitted surveys with section counts; rows have border separators; animated collapse/expand (Framer Motion)
- Sidebar toggle: absolute top-left in `AdminShell` main area — do not add to individual pages
- Main content centered: `mx-auto max-w-5xl` wrapper in `AdminShell`
- Dashboard (`/admin`): survey lists only — no stat cards (counts live in nav/sidebar)
- Customer list at `/admin/customers`
- Survey detail (`/admin/surveys/[id]`): two-column grid `"minmax(0,55%) minmax(0,45%)"` — all answer types right-aligned in display font; `NotAnsweredPill` in right column; `max-w-3xl` card
- Question catalog (`/admin/questions`): create/edit/delete all in modals — no separate pages. `QuestionsClient` owns all three modal states (`creating`, `editing`, `deleting`). `deleteQuestion` action added to `actions.ts`. Question labels are clickable to open edit modal.
- Active sidebar shows answered/total progress (x/y) per active survey (`SurveyItem.answeredCount` / `.totalQuestions`)
- Survey edit (`/admin/surveys/[id]/edit`): drag-and-drop reorder + add/remove questions, manual save via `setSurveyQuestions`. Activating redirects to survey detail.
- Template edit (`/admin/templates/[id]/edit`): template name shown as h1 with pencil icon — clicking pencil toggles an inline info card (Navn, Beskrivelse, Aktiv toggle). Questions list first, then "Legg til spørsmål" panel below.

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
2. `/admin/customers/[id]` — customer detail + survey history ✅ (done)
3. `/admin/customers/new` — create customer form ✅ (done)
4. `/admin/surveys` — survey list overview ✅ (done)
5. `/admin/surveys/[id]` — view survey + answers ✅ (done)
6. `/admin/surveys/[id]/edit` — edit survey questions ✅ (done)
7. `/admin/surveys/new` — create survey (pick customer + template) ✅ (done)
8. `/admin/templates` — list templates ✅ (done)
9. `/admin/templates/new` — create template ✅ (done)
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

11. ✅ ~~**Button system — ad-hoc `bg-brand` buttons overalt, ingen felles høyde**~~
    ~~`AdminButton`, `PrimaryButton`, `GhostButton` + inline `<button className="bg-brand ...">` gjenskapt overalt.~~
    ~~→ CVA-primitiv `components/ui/primitives/Button.tsx` + semantiske wrappers `SaveButton` / `DeleteButton` / `CancelButton` i `components/ui/buttons/`. Alle varianter har `border` (transparent eller synlig) for uniform høyde.~~

12. ✅ ~~**Komponentmappe-restrukturering**~~
    ~~Flat `components/admin/` + flat `components/ui/` uten tydeleg grupering.~~
    ~~→ `admin/{customers,surveys,templates,questions,shared,shell}`, `ui/{primitives,brand,buttons}`, `layout/` for PageHeader/SectionHeader/EmptyState.~~

## Dev Workflow

- **Test survey:** `/k/test-onboarding-demo` (seeded, active) — use Prisma Studio to reset status if accidentally submitted: `DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-) npx prisma studio`
- **DevNav:** fixed bottom-right on all pages in dev — links to all routes
- **Debug nav:** fixed bottom-left on survey pages in dev — jump between stages
- **Jira project:** braveaiteam.atlassian.net
- **Storybook:** `npm run storybook` — use when building new reusable components. Write a `ComponentName.stories.tsx` alongside the component file. Stories live in `components/` (colocated). Pages and views that depend on server actions are not suited for Storybook — test those by running the app normally.
