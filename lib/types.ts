export type AnswerType = "yes_no" | "open" | "numeric";

export interface Question {
  q_id: number;
  question: string;
  hint?: string | null;
  placeholder?: string | null;
  suffix?: string | null;
  prefix?: string | null;
  category?: string | null;
  answer_type: AnswerType;
}

export interface Template {
  t_id: number;
  question_ids: number[];
  title: string;
  description?: string | null;
  short_title?: string | null;
}

export interface Customer {
  c_id: number;
  name: string;
}

/** Payload sent by the frontend on submit — one entry per question */
export interface AnswerPayload {
  q_id: number;
  value: string | null;
  empty: boolean;
}
