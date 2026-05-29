// lib/formatAnswer.ts
// Formats a raw answer for display on the Summary screen.
// Returns null for skipped/empty answers (render the "Ikke oppgitt" pill instead).

import type { Question, AnswerMap } from "./types";
import { SKIPPED } from "./types";

export function formatAnswer(q: Question, raw: AnswerMap[string] | undefined): string | null {
  if (raw === SKIPPED || raw === undefined || raw === "") return null;

  let out = String(raw).trim();

  if (q.prefix === "kr") {
    // Parse a loose numeric string ("12 000 000", "12000000kr") into nb-NO currency.
    const num = Number(out.replace(/\s|kr/gi, "").replace(",", "."));
    if (!isNaN(num) && /^[\d\s.,]+(kr)?$/i.test(out)) {
      out = new Intl.NumberFormat("nb-NO").format(num) + " kr";
    }
  } else if (q.suffix === "%") {
    out = out.replace(/%/g, "").trim() + " %";
  } else if (q.suffix) {
    // Append a shortened unit for non-currency suffixes.
    const shortUnit = q.suffix
      .replace(/^leads.*/, "leads")
      .replace(/^timer.*/, "t/uke")
      .replace(/^personer/, "pers.");
    out = `${out} ${shortUnit}`;
  }

  return out;
}
