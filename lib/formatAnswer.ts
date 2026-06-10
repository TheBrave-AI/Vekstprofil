import type { Question, AnswerMap } from "./types";
import { SKIPPED } from "./types";

export function formatAnswer(q: Question, raw: AnswerMap[string] | undefined): string | null {
  if (raw === SKIPPED || raw === undefined || raw === "") return null;

  const out = String(raw).trim();

  if (q.type === "boolean") {
    if (out === "Nei") return "(Nei)";
    if (out.startsWith("Ja\n")) return `(Ja)\n\n${out.slice(3).trim()}`;
    return "(Ja)";
  }

  if (q.type === "multiselect") {
    return out.split("\n").map((v) => v.trim()).filter(Boolean).join(", ");
  }

  if (q.type === "select" || q.type === "text") {
    return out;
  }

  // number
  if (q.prefix === "kr") {
    const num = Number(out.replace(/\s|kr/gi, "").replace(",", "."));
    if (!isNaN(num) && num > 0) return new Intl.NumberFormat("nb-NO").format(num) + " kr";
    return out;
  }

  if (q.suffix === "%") {
    return out.replace(/%/g, "").trim() + " %";
  }

  if (q.suffix) {
    const shortUnit = q.suffix
      .replace(/^møter.*/, "møter/mnd")
      .replace(/^dager/, "dager")
      .replace(/^selgere/, "selgere")
      .replace(/^år/, "år");
    return `${out} ${shortUnit}`;
  }

  return out;
}
