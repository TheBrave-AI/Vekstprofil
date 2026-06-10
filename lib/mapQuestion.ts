import type { Question } from "./types";

export function mapQuestion(q: {
  id: string; label: string; type: string; category: string | null;
  help: string | null; placeholder: string | null; prefix: string | null;
  suffix: string | null; options: unknown; slider: unknown;
}): Question {
  return {
    id:          q.id,
    label:       q.label,
    type:        q.type as Question["type"],
    category:    q.category    ?? "",
    help:        q.help        ?? "",
    placeholder: q.placeholder ?? "",
    prefix:      q.prefix      ?? undefined,
    suffix:      q.suffix      ?? undefined,
    options:     q.options ? (q.options as string[]) : undefined,
    slider:      q.slider  ? (q.slider  as Question["slider"]) : undefined,
  };
}
