'use client';
import { useState } from "react";
import { saveAnswer, submitSurvey } from "@/app/actions";
import { SKIPPED } from "@/lib/types";
import type { Question, AnswerMap } from "@/lib/types";
import QuestionCard from "./QuestionCard";
import Intro from "./Intro";
import Summary from "./Summary";
import Submitted from "./Submitted";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AnimationDefinition } from "framer-motion";

interface Props {
  token: string;
  questions: Question[];
  // George's DB format: { value: string | null; skipped: boolean }
  existingAnswers: Record<string, { value: string | null; skipped: boolean }>;
}

// Converts the DB format to the frontend-friendly AnswerMap format
function toAnswerMap(raw: Props["existingAnswers"]): AnswerMap {
  return Object.fromEntries(
    Object.entries(raw).map(([id, a]) => [id, a.skipped ? SKIPPED : (a.value ?? "")])
  );
}

type Stage = "intro" | number | "summary" | "submitted";

const EASE = [0.32, 0, 0.18, 1] as const;
const variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -24 : 24 }),
};
const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};


export default function Survey({ token, questions, existingAnswers }: Props) {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<AnswerMap>(() => toAnswerMap(existingAnswers));
  const [draft, setDraft] = useState("");
  const [direction, setDirection] = useState(1);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  function goNext() {
    if (stage === "intro") { setDirection(1); setStage(0); return; }
    if (typeof stage === "number") {
      const q = questions[stage];
      // Per spec: empty answer on Next counts as SKIPPED
      const value = draft.trim() || SKIPPED;
      setAnswers(prev => ({ ...prev, [q.id]: value }));
      setDraft("");
      setDirection(1);
      setStage(stage < questions.length - 1 ? stage + 1 : "summary");
      void saveAnswer(token, q.id, value);
    }
  }

  function goSkip() {
    if (typeof stage !== "number") return;
    const q = questions[stage];
    setAnswers(prev => ({ ...prev, [q.id]: SKIPPED }));
    setDraft("");
    setDirection(1);
    setStage(stage < questions.length - 1 ? stage + 1 : "summary");
    void saveAnswer(token, q.id, SKIPPED);
  }

  function goBack() {
    // Per spec: back saves a non-empty draft before navigating
    if (typeof stage === "number" && draft.trim()) {
      const q = questions[stage];
      setAnswers(prev => ({ ...prev, [q.id]: draft }));
      void saveAnswer(token, q.id, draft);
    }
    setDirection(-1);
    if (stage === "summary") {
      const target = questions.length - 1;
      const existing = answers[questions[target].id];
      setDraft(existing && existing !== SKIPPED ? existing : "");
      setStage(target);
      return;
    }
    if (typeof stage === "number" && stage > 0) {
      const target = stage - 1;
      const existing = answers[questions[target].id];
      setDraft(existing && existing !== SKIPPED ? existing : "");
      setStage(target);
    } else if (typeof stage === "number" && stage === 0) {
      setDraft("");
      setStage("intro");
    }
  }

  // Jumps directly to a question from Summary — loads the existing answer into draft
  function goToQuestion(i: number) {
    const existing = answers[questions[i].id];
    setDraft(existing && existing !== SKIPPED ? existing : "");
    setDirection(-1); // always backward from summary
    setStage(i);
  }

  async function handleSubmit() {
    await submitSurvey(token);
    setDirection(1);
    setStage("submitted");
  }

  function handleReset() {
    setAnswers({});
    setDraft("");
    setDirection(-1);
    setStage("intro");
  }

  return (
    <div className="flex flex-col min-h-screen bg-ink">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        <div className="relative w-full flex justify-center">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={typeof stage === "number" ? `q-${stage}` : stage}
            custom={direction}
            variants={prefersReducedMotion ? reducedVariants : variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              prefersReducedMotion
                ? { opacity: { duration: 0.2 } }
                : { opacity: { duration: 0.2, ease: EASE }, y: { duration: 0.25, ease: EASE } }
            }
            style={{ willChange: "transform, opacity" }}
            className="w-full flex justify-center"
            onAnimationComplete={(definition: AnimationDefinition) => {
              if (definition === "center" && typeof stage === "number") setFocusTrigger(n => n + 1);
            }}
          >
            {stage === "intro" && <Intro onStart={goNext} questionCount={questions.length} />}
            {typeof stage === "number" && (
              <QuestionCard
                question={questions[stage]}
                index={stage}
                total={questions.length}
                draft={draft}
                onDraftChange={setDraft}
                onNext={goNext}
                onSkip={goSkip}
                onBack={goBack}
                focusTrigger={focusTrigger}
              />
            )}
            {stage === "summary" && (
              <Summary
                questions={questions}
                answers={answers}
                onSubmit={handleSubmit}
                onGoToQuestion={goToQuestion}
              />
            )}
            {stage === "submitted" && <Submitted onReset={handleReset} />}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>

      {process.env.NODE_ENV === "development" && (
        <nav className="fixed bottom-3 left-3 flex flex-wrap gap-1 bg-black/80 text-white text-[11px] p-2 rounded-lg z-50">
          <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => { setDirection(-1); setStage("intro"); }}>Intro</button>
          {questions.map((_, i) => (
            <button key={i} className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => { setDraft(""); setDirection(1); setStage(i); }}>Q{i + 1}</button>
          ))}
          <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => { setDirection(1); setStage("summary"); }}>Sum</button>
          <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => { setDirection(1); setStage("submitted"); }}>Done</button>
        </nav>
      )}
    </div>
  );
}
