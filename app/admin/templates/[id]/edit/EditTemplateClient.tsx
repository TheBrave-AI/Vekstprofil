"use client";

import { updateTemplate, setTemplateQuestions } from "@/app/actions";
import { useState, useTransition } from "react";
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

interface TemplateQuestion {
  id:         string; // TemplateQuestion id
  questionId: string;
  label:      string;
  category:   string | null;
  order:      number;
}

export function EditTemplateClient({
  templateId,
  initialName,
  initialDescription,
  initialActive,
  initialQuestions,
}: {
  templateId:          string;
  initialName:         string;
  initialDescription:  string | null;
  initialActive:       boolean;
  initialQuestions:    TemplateQuestion[];
}) {
  const [name,        setName]        = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [active,      setActive]      = useState(initialActive);
  const [questions,   setQuestions]   = useState(initialQuestions);
  const [saved,       setSaved]       = useState(false);
  const [isPending,   startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const isDirty = JSON.stringify(questions.map(q => q.questionId)) !== JSON.stringify(initialQuestions.map(q => q.questionId));

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function saveInfo() {
    startTransition(async () => {
      await updateTemplate(templateId, { name, description: description || null, active });
      flash();
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q.questionId === active.id);
    const newIndex = questions.findIndex((q) => q.questionId === over.id);
    const next = arrayMove(questions, oldIndex, newIndex);
    setQuestions(next);
  }

  function removeQuestion(questionId: string) {
    setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
  }

  function handleSaveQuestions() {
    startTransition(() => setTemplateQuestions(templateId, questions.map((q) => q.questionId)));
  }

  function handleResetQuestions() {
    setQuestions(initialQuestions);
  }

  function toggleActive() {
    const next = !active;
    setActive(next);
    startTransition(() => updateTemplate(templateId, { active: next }));
  }

  return (
    <div className="space-y-8">
      {isPending && <p className="text-xs text-accent">Lagrer…</p>}
      {saved    && <p className="text-xs text-accent">✓ Lagret</p>}

      {/* Info */}
      <div className="rounded-card bg-midnight p-6 shadow-card space-y-4">
        <h2 className="font-display text-lg text-cloud">Malinformasjon</h2>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Navn</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud focus:border-accent focus:outline-none transition"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Beskrivelse</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Valgfri"
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud placeholder:text-muted focus:border-accent focus:outline-none transition"
          />
        </label>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-cloud">Aktiv</span>
            <button
              type="button"
              onClick={toggleActive}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${active ? "bg-accent" : "bg-steel"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
            </button>
            <span className="text-xs text-mist">{active ? "Vises ved oppretting av survey" : "Arkivert"}</span>
          </div>

          <button
            type="button"
            onClick={saveInfo}
            disabled={isPending}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-50 transition"
          >
            Lagre
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <h2 className="font-display text-lg text-cloud">Spørsmål ({questions.length})</h2>
        <div className="rounded-card bg-midnight shadow-card overflow-hidden relative z-0">
          {questions.length === 0 ? (
            <p className="px-5 py-4 text-sm text-mist">Ingen spørsmål i denne malen.</p>
          ) : (
            <DndContext id="template-questions" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={questions.map((q) => q.questionId)} strategy={verticalListSortingStrategy}>
                {questions.map((q, i) => (
                  <SortableQuestion
                    key={q.id}
                    item={{ id: q.questionId, label: q.label, category: q.category }}
                    index={i}
                    action={
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.questionId)}
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
          )}
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={handleSaveQuestions}
            disabled={isPending || !isDirty}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-40 transition"
          >
            {isPending ? "Lagrer…" : "Lagre"}
          </button>
          <button
            type="button"
            onClick={handleResetQuestions}
            disabled={isPending || !isDirty}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-mist hover:text-cloud disabled:opacity-40 transition"
          >
            Tilbakestill
          </button>
        </div>
      </div>
    </div>
  );
}
