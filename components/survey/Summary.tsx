"use client";
import { SKIPPED } from "@/lib/types";
import type { AnswerMap, Question } from "@/lib/types";
import { formatAnswer } from "@/lib/formatAnswer";
import BrandBar from "../ui/brand/BrandBar";
import Button from "../ui/primitives/Button";
import Arrow from "../ui/primitives/Arrow";
import Eyebrow from "../ui/primitives/Eyebrow";
import NotAnsweredPill from "../ui/primitives/NotAnsweredPill";
import QuestionRow from "../ui/primitives/QuestionRow";

interface Props {
  questions: Question[];
  answers: AnswerMap;
  onSubmit: () => void;
  onGoToQuestion: (index: number) => void;
}

export default function Summary({ questions, answers, onSubmit, onGoToQuestion }: Props) {
  const filledCount = questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== SKIPPED && a !== "";
  }).length;

  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
      <BrandBar />

      <Eyebrow label="Ferdig" />

      <h1
        className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em]"
        style={{ fontSize: "clamp(28px, 4.6vw, 42px)" }}
      >
        Dette er nullpunktet deres.
      </h1>

      <p className="text-muted text-[15px] mt-3">
        {filledCount} av {questions.length} besvart
      </p>

      {/* Answer list */}
      <div className="mt-8">
        {questions.map((q, i) => {
          const raw = answers[q.id];
          // formatAnswer returns null if the answer is empty or SKIPPED
          const formatted = formatAnswer(q, raw);
          const isUnanswered = formatted === null;

          return (
            <QuestionRow
              key={q.id}
              category={q.category}
              label={q.label}
              right={
                isUnanswered ? (
                  <NotAnsweredPill />
                ) : (
                  <span className="font-display font-medium text-brand text-[21px] tabular-nums text-right max-w-[180px] leading-tight">
                    {formatted}
                  </span>
                )
              }
              onClick={() => onGoToQuestion(i)}
            />
          );
        })}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-[14px] flex-wrap mt-8">
        <Button size="lg" onClick={onSubmit} icon={<Arrow />}>Send inn kartlegging</Button>
        {/* "Gå gjennom på nytt" sends the user to question 1 (index 0) */}
        <Button variant="ghost" size="lg" onClick={() => onGoToQuestion(0)}>Gå gjennom på nytt</Button>
      </div>
    </div>
  );
}
