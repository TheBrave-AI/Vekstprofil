# Handoff: Brave Customer Onboarding Questionnaire

## Overview
A single-page, step-by-step questionnaire that maps a new customer's current sales &
marketing situation — their **"nullpunkt" (baseline)**. Brave sends a unique link to a
customer; the customer answers ~10 questions (one per screen), can skip any with a
"Vet ikke / Har ikke tall på det" button, reviews a summary, and submits. Brave uses
the captured baseline internally to demonstrate growth over time.

**Audience:** Brave's customers (external, link-based, no login). The growth
comparison/dashboard view is an **internal Brave tool and is OUT OF SCOPE here** — this
package covers only the customer-facing intake flow.

## About the Design Files
The file in `reference/Brave Onboarding.html` is a **design reference built in HTML +
inline React/Babel** — a working prototype showing the intended look, copy, and
behavior. **It is not production code to copy.** The task is to **recreate it natively
in your Next.js + TypeScript + Tailwind codebase** using clean, reusable components.
Open the HTML in a browser to feel the transitions and interactions; use this README as
the source of truth for values.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, copy, and animation
timing are all final and exact. Recreate pixel-faithfully. Everything you need is in the
`Design Tokens`, `Screens`, and `Interactions` sections plus the starter files below.

---

## Recommended Stack Decisions (per your answers)

- **Questions: hardcode as a typed config now.** They won't vary much, and decoupling
  the question catalog from the answer store keeps the form trivial to render and
  version. See `starter/questions.ts` — drop it in as-is. If you later want them
  editable without a deploy, move that array into a DB table with the *same shape*; the
  UI won't change.
- **Answers → database (Prisma + SQL), not built yet.** Keep the form pure: it collects
  a `Record<questionId, string | "__SKIPPED__">` and calls a single `onSubmit(payload)`.
  Wire that to a Server Action / route handler when the DB exists. A starter Prisma
  schema sketch is in `starter/schema.prisma.txt` (commented, for later).
- **No customer auth.** Access is via an unguessable link. Recommended: a `Submission`
  row keyed by a random token (e.g. `nanoid`) created when Brave generates the link;
  the page route is `/k/[token]`. The customer never authenticates.

---

## Suggested File Structure (App Router)

```
app/
  k/[token]/page.tsx          // server component: validate token, render <Questionnaire>
  actions.ts                  // 'use server' submitBaseline(token, answers)
components/
  questionnaire/
    Questionnaire.tsx         // client orchestrator: stage state, transitions, submit
    Intro.tsx
    QuestionCard.tsx
    Summary.tsx
    SubmittedScreen.tsx
    ProgressBar.tsx
    BrandBar.tsx
  ui/
    PrimaryButton.tsx
    GhostButton.tsx
    Arrow.tsx                 // tiny inline svg
lib/
  questions.ts                // typed question catalog (starter provided)
  formatAnswer.ts             // currency/percent/suffix formatting (starter provided)
  types.ts                    // Question, AnswerMap, etc.
```

Keep `Questionnaire.tsx` as the only stateful client component. Everything else is
presentational and takes props — that satisfies the "reusable & clean" goal and makes
each piece trivially testable.

---

## Screens / Views

There are **4 logical stages** rendered in one viewport-centered card. Stage is a single
state value: `-1` = Intro, `0..9` = questions, `10` = Summary, plus a terminal
`submitted` boolean for the thank-you screen.

### 1. Intro
- **Purpose:** Set expectations, frame the "baseline" idea, lower pressure ("skip if you
  don't have the number").
- **Layout:** Left-aligned inside the card. Eyebrow → big display headline → body
  paragraph (max-width ~52ch) → a 3-up meta row (separated from body by a 1px top border)
  → primary CTA.
- **Copy:**
  - Eyebrow: `Nullpunkt` (teal, uppercase, 0.14em tracking, with a 22×2px cyan dash before it)
  - Headline (Fraunces 500, clamp 34–56px): `La oss kartlegge der dere står i dag.`
  - Body (Satoshi, 18.5px, color `--mist`): "Vi stiller 10 korte spørsmål om salg og
    marked. Svarene danner et utgangspunkt vi kommer tilbake til senere — slik at vi
    sammen kan se nøyaktig hvor mye dere har vokst. Har dere ikke tallet? Hopp videre."
  - Meta items (Fraunces number 28px brand + Satoshi 13.5px muted label): `10 spørsmål`,
    `~4 minutter`, `0 krav om tall`
  - CTA: `Sett i gang` + arrow

### 2. QuestionCard (×10)
- **Purpose:** Capture one data point.
- **Layout (top→bottom):** category eyebrow → question (Fraunces) → help text → input row
  → action row.
- **Components:**
  - **Category eyebrow:** 22×2px cyan dash + uppercase label, teal `--accent`, 12.5px,
    700, 0.12em tracking, 20px bottom margin.
  - **Question label:** Fraunces 500, `clamp(28px, 4.6vw, 42px)`, line-height 1.1,
    letter-spacing -0.015em, color `--cloud`, `text-wrap: pretty`.
  - **Help text:** Satoshi 16.5px, line-height 1.55, color `--mist`, max-width 46ch,
    16px top margin.
  - **Input row:** flex container, bg `--navy`, 1.5px border `--steel`, radius
    `--radius-xl` (0.75rem), 34px top margin, `overflow:hidden`. On focus: border
    `--accent` + box-shadow `0 0 0 4px rgba(12,139,160,0.14)` (transition 200ms).
    - Optional **prefix/suffix affix** (e.g. `kr`, `%`, `leads / mnd`): Satoshi 17px,
      color `--muted`, padding `0 18px`, vertically centered.
    - **Input:** transparent, no border, padding 20px, Satoshi 19px/500, color `--cloud`.
      Number questions use `inputMode="decimal"`.
    - **Textarea** (free-text questions): same but 18px, line-height 1.5, min-height 92px,
      `resize:none`, padding `18px 20px`.
  - **Action row** (flex, gap 14px, wrap, 28px top margin):
    - `PrimaryButton`: label `Neste` (or `Start` on Q1) + arrow.
    - `GhostButton`: `Vet ikke / Har ikke tall på det`.
    - **Back button** (text-only, pushed right with `margin-left:auto`): `← Tilbake`
      on Q2+, **`← Avslutt` on Q1** (returns to Intro). Color `--muted`, Satoshi 15px/500.

### 3. Summary
- **Purpose:** Let the customer review/edit all answers before submitting.
- **Layout:** eyebrow `Ferdig` → headline `Dette er nullpunktet deres.` → sub line
  showing `{filled} av 10 besvart` → a list of rows → action row.
- **Rows:** CSS grid `minmax(0,1fr) auto`, gap 20px, 18px vertical padding, 1px bottom
  border `--line`. Left = category (uppercase muted) + question label (16px/500 `--cloud`).
  Right = formatted answer (Fraunces 21px/500 `--brand`, tabular-nums, right-aligned) OR,
  if skipped/empty, a coral pill: text `Ikke oppgitt`, color `--coral`, bg
  `rgba(191,77,39,0.10)`, padding `5px 12px`, radius 999px. **Each row is clickable** →
  jumps back to that question (back-direction transition).
- **Actions:** `PrimaryButton` `Send inn kartlegging` (sets submitted), `GhostButton`
  `Gå gjennom på nytt` (jumps to Q1).

### 4. SubmittedScreen (terminal)
- **Purpose:** Confirmation.
- **Layout:** 52px teal circle with a white checkmark → headline `Takk! Kartleggingen er
  sendt.` → body explaining Brave will follow up and measure growth against these numbers
  → `GhostButton` `Start på nytt` (resets everything).

---

## Interactions & Behavior

- **Navigation:** `Neste`/`Start` commits the current draft then advances. Empty draft on
  `Neste` is stored as `__SKIPPED__` (same as the skip button). Skip always stores
  `__SKIPPED__` and advances. Back commits any non-empty draft, then goes back one stage.
- **Slide transition (the signature animation):** On any stage change, the content first
  animates **out** (opacity→0, translateX ∓24px, ~240ms) then the new stage animates
  **in** from the opposite side (translateX ±24px → 0, opacity 0→1). Direction depends on
  forward vs back. Easing: `cubic-bezier(0.22, 1, 0.36, 1)`; out ~240–320ms, in ~320–420ms.
  - **Implementation note / known gotcha:** in the prototype the "enter" needs a paint
    before it can transition from the offset state, or the first slide (Intro) renders
    invisible. The fix used: default to a visible "rest" state, and on a real
    forward/back transition set `entered=false` then flip to `true` inside a **double**
    `requestAnimationFrame`. In React/Next, prefer **Framer Motion** `AnimatePresence`
    with `mode="wait"` and a directional variant — it handles this cleanly and is the
    recommended approach (see `starter/transition-notes.md`).
- **Autofocus:** the input focuses ~360ms after a slide settles (after the transition).
- **Keyboard:** `Enter` advances on single-line inputs; `⌘/Ctrl+Enter` advances on
  textareas (plain Enter inserts a newline there).
- **Progress bar:** only visible on question stages. Fill width = `(stage+1)/total`,
  transition `width 560ms cubic-bezier(0.22,1,0.36,1)`. Meta line above:
  `Spørsmål X av 10` (left) and `NN%` (right, teal, tabular-nums).
- **Answer formatting (summary only):** `kr` questions → `Intl.NumberFormat("nb-NO")` +
  ` kr`; `%` questions → strip `%`, append ` %`; other suffixes append a short unit. See
  `starter/formatAnswer.ts`.
- **Responsive:** card is `max-width: 720px`, centered, shell padding `clamp(20px,4vw,40px)`,
  card padding `clamp(28px,4.4vw,52px)`. Headline/question sizes already use `clamp()`.
  Action row wraps on narrow screens. No separate mobile design needed.

## State Management
- `stage: number` (-1 intro, 0..9 questions, 10 summary)
- `answers: Record<string, string>` where value is the text or the sentinel `"__SKIPPED__"`
- `draft: string` (current input value; loaded from `answers[q.id]` when entering a question)
- `submitted: boolean` (terminal screen)
- transition bookkeeping: direction + an `entered` flag (or let Framer Motion own this)
- **Data fetching:** none on load (questions are static). On submit, call
  `submitBaseline(token, answers)` → persist. Consider optimistic UI + a server redirect
  to a `?done=1` state so a refresh doesn't resubmit.

---

## Design Tokens

Map these into `globals.css` as CSS variables + reference them from `tailwind.config.ts`.
Starter files provided in `starter/`.

### Colors
| Token | Hex | Use |
|---|---|---|
| `--color-ink` | `#f5efe3` | primary background (warm cream) |
| `--color-midnight` | `#efe7d6` | card background |
| `--color-navy` | `#fffdf8` | input fields / near-white |
| `--color-steel` | `#ddd0ba` | borders |
| `--color-line` | `#e6dcc8` | dividers |
| `--color-cloud` | `#16243d` | dark navy text (primary) |
| `--color-mist` | `#5d574b` | secondary text |
| `--color-muted` | `#8a8273` | placeholder / muted / back btn |
| `--color-brand` | `#142a4b` | primary brand, CTA bg, summary answers |
| `--color-brand-deep` | `#0c2345` | CTA hover |
| `--color-onbrand` | `#f6f1e6` | text on dark bg |
| `--color-accent` | `#0c8ba0` | teal — progress bar, eyebrows, focus ring |
| `--color-marker` | `#2bcfe2` | cyan highlight — eyebrow dash, selection |
| `--color-coral` | `#bf4d27` | orange/red — "skipped" pill |

### Typography
- **Body / UI:** `Satoshi` (weights 300,400,500,700,900) —
  `https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap`
- **Display / headings:** `Fraunces` (opsz variable, weights 400–700) — Google Fonts.
  Use `next/font` for both if possible; Satoshi isn't on Google Fonts, so either
  `@import` the Fontshare CSS in `globals.css` or self-host via `next/font/local`.

### Radius
- `--radius-card: 1.25rem` (the main card)
- `--radius-xl: 0.75rem` (inputs, buttons)

### Shadows
- Card: `0 18px 40px -18px rgba(20,35,60,0.30), 0 2px 8px -4px rgba(20,35,60,0.16)`
- Soft: `0 16px 40px -20px rgba(20,35,60,0.28)`

### Texture
- Full-viewport fixed grain overlay: inline SVG `feTurbulence` `fractalNoise`,
  `baseFrequency=0.8`, `numOctaves=3`, **opacity 0.04**, `pointer-events:none`,
  behind content. CSS string is in the reference file's `.grain` rule — copy verbatim.

## Assets
- **No raster/image assets.** The "Brave" logo is **text** (Fraunces 600, color
  `--brand`) with a 9px coral dot after it. Arrow and checkmark are tiny inline SVGs
  (see `ui/Arrow.tsx`). The grain is an inline SVG data-URI. Nothing to export.

## Files
- `reference/Brave Onboarding.html` — the full working prototype (open in a browser).
- `starter/questions.ts` — typed question catalog, ready to use.
- `starter/types.ts` — shared types.
- `starter/formatAnswer.ts` — summary answer formatting.
- `starter/tokens.css` — CSS variables block for `globals.css`.
- `starter/tailwind.tokens.ts` — token mapping for `tailwind.config.ts`.
- `starter/schema.prisma.txt` — Prisma schema sketch for the future DB (commented).
- `starter/transition-notes.md` — Framer Motion approach for the slide animation.
