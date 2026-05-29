// lib/types.ts
// Shared types for the Brave onboarding questionnaire.

/** Sentinel stored when a customer skips a question or leaves it empty. */
export const SKIPPED = "__SKIPPED__" as const;

export type QuestionType = "number" | "text";

export interface Question {
  /** Stable key — also used as the DB column / answer map key. Never reuse or rename. */
  id: string;
  /** Short uppercase grouping label shown as an eyebrow, e.g. "Økonomi". */
  category: string;
  /** The question, rendered in Fraunces. */
  label: string;
  /** Supporting sentence under the question. */
  help: string;
  /** Placeholder text in the input. */
  placeholder: string;
  /** "number" → single-line numeric-ish input; "text" → textarea. */
  type: QuestionType;
  /** Optional left affix inside the field, e.g. "kr". */
  prefix?: string;
  /** Optional right affix inside the field, e.g. "%", "leads / mnd". */
  suffix?: string;
}

/** Map of question id → raw string answer, or the SKIPPED sentinel. */
export type AnswerMap = Record<string, string | typeof SKIPPED>;
