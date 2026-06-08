"use client";

import { setSurveyQuestions, activateSurvey } from "@/app/actions";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { AddQuestionsPanel } from "@/components/admin/AddQuestionsPanel";
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
                    onRemove={() => remove(q.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
      

      <AddQuestionsPanel available={available} onAdd={add} />

      

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
    </div>
  );
}
