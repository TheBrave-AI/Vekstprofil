"use client";

import { updateTemplate, setTemplateQuestions } from "@/app/actions";
import AdminButton from "@/components/ui/AdminButton";
import { useState, useTransition } from "react";
import FormField from "@/components/form/FormField";
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
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { deleteTemplate } from "@/app/actions";
import { useRouter } from "next/navigation";

interface TemplateQuestion {
  id:         string; // TemplateQuestion id
  questionId: string;
  label:      string;
  category:   string | null;
  order:      number;
}

interface QuestionRow { id: string; label: string; category: string | null; }

export function EditTemplateClient({
  templateId,
  initialName,
  initialDescription,
  initialActive,
  initialQuestions,
  allQuestions,
}: {
  templateId:          string;
  initialName:         string;
  initialDescription:  string | null;
  initialActive:       boolean;
  initialQuestions:    TemplateQuestion[];
  allQuestions:        QuestionRow[];
}) {
  const [name,        setName]        = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [active,      setActive]      = useState(initialActive);
  const [questions,   setQuestions]   = useState(initialQuestions);
  const [saved,       setSaved]       = useState(false);
  const [showInfo,    setShowInfo]    = useState(false);
  const [isPending,   startTransition] = useTransition();
  const router = useRouter();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const isDirty = JSON.stringify(questions.map(q => q.questionId)) !== JSON.stringify(initialQuestions.map(q => q.questionId));

  const inTemplate = new Set(questions.map((q) => q.questionId));
  const available  = allQuestions.filter((q) => !inTemplate.has(q.id));

  function addQuestion(q: QuestionRow) {
    setQuestions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), questionId: q.id, label: q.label, category: q.category, order: prev.length },
    ]);
  }

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

      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Rediger mal</p>
        <div className="flex items-center gap-2 mt-0.5">
          <h1 className="font-display text-2xl text-cloud leading-tight">{name}</h1>
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${showInfo ? "text-cloud bg-black/[0.08]" : "text-muted hover:text-cloud hover:bg-black/[0.06]"}`}
            title="Rediger malinformasjon"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 1.5a1.5 1.5 0 0 1 3 0v.086a1.5 1.5 0 0 1-.44 1.06L4.5 10.207V12.5h2.293l7.56-7.56A1.5 1.5 0 0 1 9.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M1 13h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {isPending && <p className="text-xs text-accent">Lagrer…</p>}
      {saved    && <p className="text-xs text-accent">✓ Lagret</p>}

      {/* Info card — shown on pencil click */}
      {showInfo && (
      <div className="rounded-card bg-midnight p-6 shadow-card space-y-4">
        <FormField label="Navn"        value={name}        onChange={(e) => setName(e.target.value)} />
        <FormField label="Beskrivelse" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Valgfri" />

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

          <AdminButton onClick={saveInfo} disabled={isPending}>Lagre</AdminButton>
        </div>
      </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        <h2 className="font-display text-xl text-cloud">Spørsmål ({questions.length})</h2>
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
                    onRemove={() => removeQuestion(q.questionId)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <AdminButton onClick={handleSaveQuestions} disabled={isPending || !isDirty}>
            {isPending ? "Lagrer…" : "Lagre"}
          </AdminButton>
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

      <AddQuestionsPanel available={available} onAdd={addQuestion} />
      <ConfirmDeleteButton
      
        label="Slett mal"
        description="Malen vil bli permanent slettet. Dette kan ikke angres."
        onConfirm={async () => {
          await deleteTemplate(templateId);
          router.push("/admin/templates");
        }}
      />
    </div>
  );
}
