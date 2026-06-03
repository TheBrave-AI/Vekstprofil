export const SKIPPED = "__SKIPPED__" as const;

export type QuestionType = "number" | "text" | "boolean" | "select" | "multiselect";

export interface Question {
    id : string;
    category : string;
    label : string;
    help : string;
    placeholder : string;
    type : QuestionType;
    prefix? : string;
    suffix? : string;
    options? : string[];
    slider?: { min: number; max: number; step: number };
}

export type AnswerMap = Record<string, string | typeof SKIPPED>;
