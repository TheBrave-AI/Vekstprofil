"use client";
import { QUESTIONS } from "@/lib/questions";
import { SKIPPED } from "@/lib/types";
import type { AnswerMap } from "@/lib/types";
import { formatAnswer } from "@/lib/formatAnswer";
import BrandBar from "../ui/BrandBar";
import PrimaryButton from "../ui/PrimaryButton";
import GhostButton from "../ui/GhostButton";

interface Props {
  answers: AnswerMap;
  onSubmit: () => void;
  // Called when the user clicks a row — jumps back to that question
  onGoToQuestion: (index: number) => void;
}

export default function Summary({ answers, onSubmit, onGoToQuestion }: Props) {
  // Count questions that are actually answered (not skipped and not empty)
  const filledCount = QUESTIONS.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== SKIPPED && a !== "";
  }).length;

  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
      <BrandBar />

      {/* Eyebrow — same pattern as Intro and QuestionCard */}
      <div className="flex items-center gap-3 mt-8 mb-5">
        <span className="w-[22px] h-[2px] bg-marker shrink-0" />
        <span className="text-accent text-[12.5px] font-bold uppercase tracking-[0.14em]">
          Ferdig
        </span>
      </div>

      <h1
        className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em]"
        style={{ fontSize: "clamp(28px, 4.6vw, 42px)" }}
      >
        Dette er nullpunktet deres.
      </h1>

      <p className="text-muted text-[15px] mt-3">
        {filledCount} av {QUESTIONS.length} besvart
      </p>

      {/* Answer list */}
      <div className="mt-8">
        {QUESTIONS.map((q, i) => {
          const raw = answers[q.id];
          // formatAnswer returns null if the answer is empty or SKIPPED
          const formatted = formatAnswer(q, raw);
          const isUnanswered = formatted === null;

          return (
            // The entire row is clickable — sends the user back to that question for editing
            <button
              key={q.id}
              type="button"
              onClick={() => onGoToQuestion(i)}
              className="w-full grid gap-5 py-[18px] border-b border-line text-left transition-colors hover:bg-black/[0.03] rounded-sm"
              style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}
            >
              {/* Left: category + question text */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-muted text-[11px] font-bold uppercase tracking-[0.12em]">
                  {q.category}
                </span>
                <span className="text-cloud text-[16px] font-medium leading-snug">
                  {q.label}
                </span>
              </div>

              {/* Right: formatted answer or "Ikke oppgitt" pill */}
              <div className="flex items-center justify-end pl-4 shrink-0">
                {isUnanswered ? (
                  // Coral pill for unanswered questions
                  <span
                    className="text-coral text-[13px] font-medium px-3 py-[5px] rounded-full whitespace-nowrap"
                    style={{ background: "rgba(191,77,39,0.10)" }}
                  >
                    Ikke oppgitt
                  </span>
                ) : (
                  <span className="font-display font-medium text-brand text-[21px] tabular-nums text-right max-w-[180px] leading-tight">
                    {formatted}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-[14px] flex-wrap mt-8">
        <PrimaryButton label="Send inn kartlegging" onClick={onSubmit} />
        {/* "Gå gjennom på nytt" sends the user to question 1 (index 0) */}
        <GhostButton label="Gå gjennom på nytt" onClick={() => onGoToQuestion(0)} />
      </div>
    </div>
  );
}
