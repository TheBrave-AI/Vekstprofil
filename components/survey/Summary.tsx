"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
  companyName?: string;
  isAlreadySubmitted?: boolean;
}

export default function Summary({ questions, answers, onSubmit, onGoToQuestion, companyName, isAlreadySubmitted }: Props) {
  const [showAnswers, setShowAnswers] = useState(false);

  const filledCount = questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== SKIPPED && a !== "";
  }).length;

  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
      <BrandBar label={companyName} />

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
        <button
          type="button"
          onClick={() => setShowAnswers((v) => !v)}
          className="flex w-full items-center justify-between py-3 text-left text-muted hover:text-cloud transition-colors"
        >
          <span className="text-[13px] font-semibold uppercase tracking-[0.1em]">
            Se svar ({filledCount}/{questions.length})
          </span>
          <motion.span
            animate={{ rotate: showAnswers ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showAnswers && (
            <motion.div
              key="answers"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {questions.map((q, i) => {
                const raw       = answers[q.id];
                const formatted = formatAnswer(q, raw);
                const isSkipped = raw === SKIPPED;

                return (
                  <QuestionRow
                    key={q.id}
                    category={q.category}
                    label={q.label}
                    columns="1fr"
                    sub={
                      formatted
                        ? <div className="space-y-1">
                            {formatted.split('\n').filter(Boolean).map((line, i) => (
                              <p key={i} className="text-mist text-[14px] leading-relaxed">{line}</p>
                            ))}
                          </div>
                        : <NotAnsweredPill skipped={isSkipped} />
                    }
                    onClick={() => onGoToQuestion(i)}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action row */}
      
      <div className="flex flex-col items-center gap-[14px] mt-8">
        <h3 className="text-[15px]">Vi har lagret svarene dine. Vil du... </h3>
        <div className="flex gap-4">
          <Button variant="ghost" size="lg" onClick={() => onGoToQuestion(0)}>Endre svarene</Button>
          <Button size="lg" onClick={onSubmit} icon={<Arrow />} disabled={isAlreadySubmitted}>
            {isAlreadySubmitted ? "Allerede innsendt" : "Bekrefte og lukke"}
          </Button>
        </div>
      </div>
    </div>
  );
}
