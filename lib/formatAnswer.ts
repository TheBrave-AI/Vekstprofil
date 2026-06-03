import type { Question } from "./types";

/** Formats a raw answer value for display. Returns null if empty/skipped. */
export function formatAnswer(q: Question, value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;

  let out = value.trim();

  if (q.prefix === "kr") {
    const num = Number(out.replace(/\s|kr/gi, "").replace(",", "."));
    if (!isNaN(num) && /^[\d\s.,]+(kr)?$/i.test(out)) {
      out = new Intl.NumberFormat("nb-NO").format(num) + " kr";
    }
  } else if (q.suffix === "%") {
    out = out.replace(/%/g, "").trim() + " %";
  } else if (q.suffix) {
    const shortUnit = q.suffix
      .replace(/^leads.*/, "leads")
      .replace(/^timer.*/, "t/uke")
      .replace(/^personer/, "pers.");
    out = `${out} ${shortUnit}`;
  }

  return out;
}
