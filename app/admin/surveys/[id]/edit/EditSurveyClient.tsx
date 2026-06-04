"use client";

import { addQuestionToSurvey, removeQuestionFromSurvey, activateSurvey } from "@/app/actions";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

interface QuestionRow { id: string; label: string; category: string | null; }

export function EditSurveyClient({
  surveyId,
  surveyQuestions,
  allQuestions,
}: {
  surveyId:       string;
  surveyQuestions: QuestionRow[];
  allQuestions:   QuestionRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [current, setCurrent] = useState(surveyQuestions);

  const inSurvey = new Set(current.map((q) => q.id));
  const available = allQuestions.filter((q) => !inSurvey.has(q.id));

  function add(q: QuestionRow) {
    setCurrent((prev) => [...prev, q]);
    startTransition(() => addQuestionToSurvey(surveyId, q.id));
  }

  function remove(id: string) {
    setCurrent((prev) => prev.filter((q) => q.id !== id));
    startTransition(() => removeQuestionFromSurvey(surveyId, id));
  }

  function handleActivate() {
    startTransition(async () => {
      try {
        await activateSurvey(surveyId);
        router.push(`/admin/surveys/${surveyId}`);
      } catch {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      {isPending && <p className="text-xs text-accent">Lagrer…</p>}

      {/* Current questions */}
      <div className="space-y-3">
        <h2 className="font-display text-lg text-cloud">Spørsmål i surveyen ({current.length})</h2>
        {current.length === 0 ? (
          <p className="text-sm text-mist">Ingen spørsmål ennå.</p>
        ) : (
          <div className="rounded-card bg-midnight shadow-card overflow-hidden">
            {current.map((q, i) => (
              <div key={q.id} className="flex items-center justify-between px-5 py-3 border-b border-line last:border-0">
                <div>
                  {q.category && <p className="text-xs text-accent uppercase tracking-widest">{q.category}</p>}
                  <p className="text-sm text-cloud">{q.label}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>#{i + 1}</span>
                  <button onClick={() => remove(q.id)} className="text-coral hover:text-coral/70 transition">Fjern</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available questions */}
      {available.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg text-cloud">Legg til spørsmål</h2>
          <div className="rounded-card bg-midnight shadow-card overflow-hidden">
            {available.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-5 py-3 border-b border-line last:border-0">
                <div>
                  {q.category && <p className="text-xs text-accent uppercase tracking-widest">{q.category}</p>}
                  <p className="text-sm text-cloud">{q.label}</p>
                </div>
                <button onClick={() => add(q)} className="text-accent hover:underline text-xs font-medium">+ Legg til</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleActivate}
        disabled={isPending || current.length === 0}
        className="rounded-xl bg-brand px-6 py-3 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-50 transition"
      >
        Aktiver og send til kunde
      </button>
    </div>
  );
}
