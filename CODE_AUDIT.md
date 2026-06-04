# Code Audit — Simplification & Efficiency Report

Generated: 2026-06-04

---

## HIGH Priority

### 3.1 — Dashboard bypasser cache-laget
**Fil:** `app/admin/page.tsx` linjer 1–34

Dashboardet importerer `db` direkte og kjører 6 ukachede DB-spørringer på hvert besøk (`db.survey.findMany`, `db.customer.findMany`, osv.). Resten av admin-sidene bruker `cachedSurveys()` og `cachedCustomers()` fra `actions.ts` — dashboardet gjør ikke det.

**Fix:** Bruk de eksisterende cachede actionene og beregn `customerCount`, `activeCount`, `submittedCount` i minnet fra de returnerte dataene.

---

### 4.1 — `Summary.tsx` bruker statisk spørsmålsarray i stedet for DB-data
**Fil:** `components/survey/Summary.tsx` linjer 2, 19, 49

Komponenten importerer `QUESTIONS` fra `lib/questions.ts` (statisk array) i stedet for å bruke spørsmålene hentet fra DB. Hvis et spørsmål redigeres i DB, vil kundeoppsummeringen vise gammel tekst mens resten av flyten viser ny tekst. `Survey`-komponenten har allerede `questions` som prop fra `getSurvey()`.

**Fix:** Send `questions: Question[]` som prop til `Summary` fra `Survey.tsx` i stedet for å importere den statiske arrayen.

---

## MEDIUM Priority

### 1.1 — `relativeTime`-funksjonen er kopiert 3 ganger
**Filer:**
- `components/admin/AdminSidebar.tsx` linjer 20–26
- `app/admin/surveys/page.tsx` linjer 14–20
- `components/admin/ActivityFeed.tsx` linjer 7–13

Identisk implementasjon i alle tre. `formatDate` i `app/admin/page.tsx` linjer 128–135 er en nær variant.

**Fix:** Flytt til `lib/utils.ts` som en enkelt eksportert `relativeTime(date)` helper.

---

### 1.3 — Spørsmålsrad-markup duplisert
**Filer:** `components/survey/Summary.tsx` + `app/admin/surveys/[id]/page.tsx`

Begge sidene renderer en grid-rad med: kategori-eyebrow (small caps, text-accent), spørsmålslabel (text-cloud, font-medium), og høyrejustert formatert svar. Klasse-navn og visningslogikk er nesten identiske over 30+ linjer i begge filer.

**Fix:** Lag en delt `QuestionRow`-komponent i `components/ui/`.

---

### 2.1 — `ActivityFeed.tsx` er dødkode med live import
**Filer:** `components/admin/ActivityFeed.tsx`, `components/admin/AdminSidebar.tsx` linje 2 og 66

Fullt implementert polling-komponent med `useEffect` og `setInterval`. Importert i `AdminSidebar.tsx` men bruken er kommentert ut. Den levende importen holder filen i bundles graph.

**Fix:** Slett filen eller flytt den til `_disabled/` til featuren er klar. Fjern importen fra `AdminSidebar.tsx`.

---

### 2.3 — Død `total`-variabel med ødelagt ternary
**Fil:** `app/admin/surveys/page.tsx` linje 108

```ts
const total = s._count.answers + (s.status === "submitted" ? 0 : 0)
```

Begge grener av ternary legger til `0`, så `total === s._count.answers`. Variabelen brukes aldri.

**Fix:** Slett variabelen.

---

### 3.2 — `getCustomer` og customer-detalj er ukachet og inkonsistent
**Filer:** `app/actions.ts` linjer 219–229, `app/admin/customers/[id]/page.tsx` linje 14

`getCustomer(id)` treffer DB direkte hver gang. Customer-detalj-siden bypasser i tillegg `getCustomer` og kaller `db.customer.findUnique` direkte — to ukachede DB-kall per sidevisning.

**Fix:** Wrappe `getCustomer` i `unstable_cache` med per-ID-nøkkel, og la detalj-siden bruke den.

---

### 3.3 — Template edit-side bypasser cache
**Fil:** `app/admin/templates/[id]/edit/page.tsx` linjer 12–21

Kaller `db.template.findUnique` direkte. Ingen `getTemplate(id)`-action eksisterer, og siden er inkonsistent med mønsteret i resten av admin.

**Fix:** Lag en `getTemplate(id)` cachet action i `actions.ts`.

---

### 3.4 — Reorder-actions sender N sekvensielle DB-oppdateringer
**Fil:** `app/actions.ts` linjer 322–328 (survey) og 388–393 (template)

Reordering kjører én `updateMany` per spørsmål inni en transaction. For 15 spørsmål er det 15 roundtrips. Prisma batcher ikke `updateMany` automatisk.

**Fix:** Bruk et enkelt `$executeRaw` med `UPDATE ... SET order = CASE WHEN ...`, eller slett og re-insert alle rader med `deleteMany` + `createMany`.

---

### 4.2 — `CopyLinkButton` hardkoder produksjonsdomain
**Fil:** `components/admin/CopyLinkButton.tsx` linje 8

```ts
const url = `https://vekstprofil.thebrave.no/k/${token}`
```

Genererer alltid prod-URL, også i development og staging.

**Fix:** `const url = \`${process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin}/k/${token}\``

---

### 5.3 — `formatAnswer` matcher hardkodet suffix-strenger
**Fil:** `lib/formatAnswer.ts` linjer 33–38

Funksjonen pattern-matcher på `q.suffix` for å produsere visningsetiketter (`"møter/mnd"`, `"dager"`, osv.). Hvis en suffix endres i DB, bryter formateringen stille.

**Fix:** Render `${value} ${q.suffix}` direkte, eller flytt eventuell forkortelseslogikk inn i spørsmålsdefinisjonen.

---

### 6.1 — 4 admin-sider importerer `db` direkte og bypasser `requireAuth()`
**Filer:**
- `app/admin/page.tsx`
- `app/admin/customers/[id]/page.tsx`
- `app/admin/surveys/new/page.tsx`
- `app/admin/templates/[id]/edit/page.tsx`

Disse sidene stoler på layout-redirect for autentisering, men har ingen `requireAuth()`-sjekk ved data-tilgang. Hvis en side flyttes ut av admin-layoutet, eksponeres data uten auth.

**Fix:** All admin-datatilgang bør gå gjennom `actions.ts` der `requireAuth()` er samlokalisert med spørringen.

---

### 6.2 — `revalidateTag` kalles med feil andre argument
**Fil:** `app/actions.ts` — ~12 steder

```ts
revalidateTag("surveys", {}) // feil
```

`revalidateTag` tar kun ett argument (`tag: string`). Det andre `{}`-argumentet er stille ignorert, men er feil og ser ut som en copy-paste fra `revalidatePath` (som faktisk aksepterer et andre argument).

**Fix:** Fjern alle `{}` fra `revalidateTag`-kallene.

---

## LOW Priority

| # | Problem | Fil(er) |
|---|---------|---------|
| 1.2 | `NotAnsweredPill` duplisert | `surveys/[id]/page.tsx` + `Summary.tsx` |
| 1.4 | Inline knappeklasse-strenger gjentas i ~8 admin-skjemaer | Diverse admin-sider |
| 2.2 | Død `DevNav`-import i root layout | `app/layout.tsx` linje 4 |
| 2.4 | `SKIP_LABEL` eksportert men aldri importert | `lib/questions.ts` linje 156 |
| 4.3 | Redundant `!collapsed`-sjekk i `SidebarToggle` (forelderen sjekker allerede) | `components/admin/SidebarToggle.tsx` linjer 6–7 |
| 4.4 | `goNext`/`goSkip` — identisk navigasjonslogikk duplisert | `components/survey/Survey.tsx` linjer 51–70 |
| 5.1 | Unødvendig `$transaction` i `addQuestionToSurvey` (en read + én write) | `app/actions.ts` linjer 289–297 |
| 5.2 | `mapQuestion` eksisterer kun for å fikse et type-mismatch som kunne elimineres på schema-nivå | `app/actions.ts` linjer 12–29 |
