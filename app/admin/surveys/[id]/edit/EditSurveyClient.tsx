"use client";

import { setSurveyQuestions, activateSurvey } from "@/app/actions";
import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewQuestionForm } from "@/app/admin/questions/new/NewQuestionForm";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableQuestion } from "@/components/ui/SortableQuestion";

interface QuestionRow { id: string; label: string; category: string | null; }

export function EditSurveyClient({
  surveyId,
  surveyQuestions,
  allQuestions,
}: {
  surveyId:        string;
  surveyQuestions: QuestionRow[];
  allQuestions:    QuestionRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [current, setCurrent] = useState(surveyQuestions);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setShowModal(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const isDirty = JSON.stringify(current.map(q => q.id)) !== JSON.stringify(surveyQuestions.map(q => q.id));
  const inSurvey  = new Set(current.map((q) => q.id));
  const available = allQuestions.filter((q) => !inSurvey.has(q.id));

  function add(q: QuestionRow) {
    setCurrent((prev) => [...prev, q]);
  }

  function remove(id: string) {
    setCurrent((prev) => prev.filter((q) => q.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = current.findIndex((q) => q.id === active.id);
    const newIndex = current.findIndex((q) => q.id === over.id);
    setCurrent((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  function handleSave() {
    startTransition(() => setSurveyQuestions(surveyId, current.map((q) => q.id)));
  }

  function handleReset() {
    setCurrent(surveyQuestions);
  }

  function handleActivate() {
    startTransition(async () => {
      try {
        await setSurveyQuestions(surveyId, current.map((q) => q.id));
        await activateSurvey(surveyId);
        router.push("/admin");
      } catch {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      
      {/* Current questions */}
      <div className="space-y-3">
        <h2 className="font-display text-lg text-cloud">Spørsmål i surveyen ({current.length})</h2>
        {current.length === 0 ? (
          <p className="text-sm text-mist">Ingen spørsmål ennå.</p>
        ) : (
          <div className="rounded-card bg-midnight shadow-card overflow-hidden relative z-0">
            <DndContext id="survey-questions" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={current.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                {current.map((q, i) => (
                  <SortableQuestion
                    key={q.id}
                    item={q}
                    index={i}
                    action={
                      <button
                        type="button"
                        onClick={() => remove(q.id)}
                        className="text-muted hover:text-coral transition"
                        aria-label="Fjern"
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M2 2L11 11M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
      

      {/* Available questions */}
      {available.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg text-cloud">Legg til spørsmål</h2>
          {/* Create new question */}
      <div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent/70 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Lag nytt spørsmål
        </button>
      </div>
          <div className="rounded-card bg-midnight shadow-card overflow-hidden relative z-0">
            {available.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-5 py-3 border-b border-line last:border-0">
                <div>
                  {q.category && <p className="text-xs text-accent uppercase tracking-widest">{q.category}</p>}
                  <p className="text-sm text-cloud">{q.label}</p>
                </div>
                <button type="button" onClick={() => add(q)} className="text-accent hover:underline text-xs font-medium">+ Legg til</button>
              </div>
            ))}
          </div>
        </div>
      )}

      

      {/* Actions */}
      <div className="flex items-center gap-3 relative z-10">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !isDirty}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-40 transition"
        >
          {isPending ? "Lagrer…" : "Lagre"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending || !isDirty}
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-mist hover:text-cloud disabled:opacity-40 transition"
        >
          Tilbakestill
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleActivate}
          disabled={isPending || current.length === 0}
          className="rounded-xl bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/20 disabled:opacity-40 transition"
        >
          Aktiver skjema
        </button>
      </div>
      {/* New question modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-midnight border border-line text-muted hover:text-cloud transition-colors"
              aria-label="Lukk"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <NewQuestionForm
              onCreated={(q) => {
                setCurrent((prev) => [...prev, q]);
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
