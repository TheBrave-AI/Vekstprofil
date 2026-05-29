// lib/questions.ts
// Static question catalog (Norwegian). Hardcoded by design — see README.
// If you later make these editable, move this array into a DB table with the
// SAME shape; the UI consumes `Question[]` either way.

import type { Question } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "revenue",
    category: "Økonomi",
    label: "Hva er bedriftens nåværende årsomsetning?",
    help: "Et omtrentlig tall holder. Dette blir nullpunktet vi måler vekst mot.",
    placeholder: "f.eks. 12 000 000 kr",
    prefix: "kr",
    type: "number",
  },
  {
    id: "leads",
    category: "Pipeline",
    label: "Hvor mange leads genererer dere i en typisk måned?",
    help: "Tell alle reelle henvendelser — innkommende og oppsøkende.",
    placeholder: "f.eks. 45",
    suffix: "leads / mnd",
    type: "number",
  },
  {
    id: "closeRate",
    category: "Pipeline",
    label: "Hva er deres nåværende close rate?",
    help: "Andelen kvalifiserte leads som ender som signerte kunder.",
    placeholder: "f.eks. 22",
    suffix: "%",
    type: "number",
  },
  {
    id: "dealSize",
    category: "Økonomi",
    label: "Hva er gjennomsnittlig avtalestørrelse?",
    help: "Snittverdien på en signert kontrakt eller et salg.",
    placeholder: "f.eks. 85 000 kr",
    prefix: "kr",
    type: "number",
  },
  {
    id: "marketingSpend",
    category: "Økonomi",
    label: "Hvor mye bruker dere på markedsføring i dag?",
    help: "Samlet månedlig budsjett — annonser, byrå, verktøy og innhold.",
    placeholder: "f.eks. 60 000 kr / mnd",
    prefix: "kr",
    type: "number",
  },
  {
    id: "teamSize",
    category: "Team",
    label: "Hvor mange jobber i salgsteamet?",
    help: "Inkluder alle som aktivt selger, også deltid.",
    placeholder: "f.eks. 4",
    suffix: "personer",
    type: "number",
  },
  {
    id: "bottleneck",
    category: "Strategi",
    label: "Hva er den største flaskehalsen for vekst akkurat nå?",
    help: "Beskriv med egne ord — det er ofte her vi finner de raske gevinstene.",
    placeholder: "Skriv fritt — f.eks. «For få kvalifiserte møter»",
    type: "text",
  },
  {
    id: "tools",
    category: "Verktøy",
    label: "Hvilke CRM- og salgsverktøy bruker dere i dag?",
    help: "List opp det dere bruker, eller skriv hvis dere ikke bruker noe ennå.",
    placeholder: "f.eks. HubSpot, Pipedrive, regneark …",
    type: "text",
  },
  {
    id: "prospecting",
    category: "Team",
    label: "Hvor mye tid bruker teamet på prospektering per uke?",
    help: "Samlet antall timer på å finne og kontakte nye potensielle kunder.",
    placeholder: "f.eks. 10",
    suffix: "timer / uke",
    type: "number",
  },
  {
    id: "channel",
    category: "Strategi",
    label: "Hva er deres viktigste salgskanal i dag?",
    help: "Der mesteparten av nye kunder faktisk kommer fra.",
    placeholder: "f.eks. Anbefalinger, LinkedIn, kald e-post …",
    type: "text",
  },
];

export const SKIP_LABEL = "Vet ikke / Har ikke tall på det";
