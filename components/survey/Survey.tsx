'use client';
import { useState } from "react";
import { saveAnswer, submitSurvey } from "@/app/actions";
import { SKIPPED } from "@/lib/types";
import type { Question, AnswerMap } from "@/lib/types";
import SpørsmålKort from "./SpørsmålKort";
import Intro from "./Intro";
import Oppsummering from "./Oppsummering";

interface Props {
  token: string;
  questions: Question[];
  // Georges DB-format: { value: string | null; skipped: boolean }
  existingAnswers: Record<string, { value: string | null; skipped: boolean }>;
}

// Konverterer DB-formatet til det frontend-vennlige AnswerMap-formatet
function toAnswerMap(raw: Props["existingAnswers"]): AnswerMap {
  return Object.fromEntries(
    Object.entries(raw).map(([id, a]) => [id, a.skipped ? SKIPPED : (a.value ?? "")])
  );
}

type Stage = "intro" | number | "summary" | "submitted";

export default function Survey({ token, questions, existingAnswers }: Props) {
  const [stage, setStage] = useState<Stage>("intro");
  // Initialiser med eventuelle eksisterende svar (kunden kan ha begynt tidligere)
  const [answers, setAnswers] = useState<AnswerMap>(() => toAnswerMap(existingAnswers));
  const [draft, setDraft] = useState("");

  function goNext() {
    if (stage === "intro") { setStage(0); return; }
    if (typeof stage === "number") {
      const q = questions[stage];
      // Per spec: tomt svar på Neste teller som SKIPPED
      const value = draft.trim() || SKIPPED;
      setAnswers(prev => ({ ...prev, [q.id]: value }));
      setDraft("");
      setStage(stage < questions.length - 1 ? stage + 1 : "summary");
      saveAnswer(token, q.id, value); // fire-and-forget — blokkerer ikke UI
    }
  }

  function goSkip() {
    if (typeof stage !== "number") return;
    const q = questions[stage];
    setAnswers(prev => ({ ...prev, [q.id]: SKIPPED }));
    setDraft("");
    setStage(stage < questions.length - 1 ? stage + 1 : "summary");
    saveAnswer(token, q.id, SKIPPED);
  }

  function goBack() {
    // Per spec: tilbake lagrer ikke-tomt draft før navigering
    if (typeof stage === "number" && draft.trim()) {
      const q = questions[stage];
      setAnswers(prev => ({ ...prev, [q.id]: draft }));
      saveAnswer(token, q.id, draft);
    }
    setDraft("");
    if (stage === "summary") { setStage(questions.length - 1); return; }
    if (typeof stage === "number" && stage > 0) setStage(stage - 1);
    else if (typeof stage === "number" && stage === 0) setStage("intro");
  }

  // Hopper direkte til et spørsmål fra Oppsummering — laster eksisterende svar i draft
  function goToQuestion(i: number) {
    const existing = answers[questions[i].id];
    setDraft(existing && existing !== SKIPPED ? existing : "");
    setStage(i);
  }

  async function handleSubmit() {
    await submitSurvey(token);
    setStage("submitted");
  }

  return (
    <div className="flex flex-col min-h-screen bg-ink">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {stage === "intro" && <Intro onStart={goNext} />}
        {typeof stage === "number" && (
          <SpørsmålKort
            question={questions[stage]}
            index={stage}
            total={questions.length}
            draft={draft}
            onDraftChange={setDraft}
            onNext={goNext}
            onSkip={goSkip}
            onBack={goBack}
          />
        )}
        {stage === "summary" && (
          <Oppsummering
            answers={answers}
            onSubmit={handleSubmit}
            onGoToQuestion={goToQuestion}
          />
        )}
        {stage === "submitted" && <div>TODO: &lt;Innsendt /&gt;</div>}
      </main>

      {process.env.NODE_ENV === "development" && (
        <nav className="fixed bottom-3 left-3 flex flex-wrap gap-1 bg-black/80 text-white text-[11px] p-2 rounded-lg z-50">
          <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => setStage("intro")}>Intro</button>
          {questions.map((_, i) => (
            <button key={i} className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => { setDraft(""); setStage(i); }}>Q{i + 1}</button>
          ))}
          <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => setStage("summary")}>Sum</button>
          <button className="px-2 py-1 rounded hover:bg-white/20" type="button" onClick={() => setStage("submitted")}>Done</button>
        </nav>
      )}
    </div>
  );
}
