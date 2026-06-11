"use client";

import { updateTemplate, setTemplateQuestions, deleteTemplate } from "@/app/actions";
import { EditEntityHeader } from "@/components/admin/shared/EditEntityHeader";
import { EditQuestionModal } from "@/components/admin/questions/EditQuestionModal";
import Button from "@/components/ui/primitives/Button";
import { SaveButton } from "@/components/ui/buttons/SaveButton";
import { useState, useTransition } from "react";
import { AddQuestionsPanel } from "@/components/admin/questions/AddQuestionsPanel";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableQuestion } from "@/components/admin/questions/SortableQuestion";
import { ConfirmDeleteButton } from "../shared/ConfirmDeleteButton";
import { useRouter } from "next/navigation";

interface TemplateQuestion {
  id:          string; // TemplateQuestion id
  questionId:  string;
  label:       string;
  category:    string | null;
  order:       number;
  type?:       string;
  help?:       string | null;
  placeholder?: string | null;
  prefix?:     string | null;
  suffix?:     string | null;
  options?:    unknown;
}

interface QuestionRow {
  id:          string;
  label:       string;
  category:    string | null;
  type?:       string;
  help?:       string | null;
  placeholder?: string | null;
  prefix?:     string | null;
  suffix?:     string | null;
  options?:    unknown;
}

export function EditTemplateClient({
  templateId,
  initialName,
  initialShortName,
  initialIntroTitle,
  initialIntroText,
  initialActive,
  initialQuestions,
  allQuestions,
}: {
  templateId:          string;
  initialName:         string;
  initialShortName:    string | null;
  initialIntroTitle:   string | null;
  initialIntroText:    string | null;
  initialActive:       boolean;
  initialQuestions:    TemplateQuestion[];
  allQuestions:        QuestionRow[];
}) {
  const [name,        setName]        = useState(initialName);
  const [introTitle,  setIntroTitle]  = useState(initialIntroTitle  ?? "");
  const [introText,   setIntroText]   = useState(initialIntroText   ?? "");
  const [active,      setActive]      = useState(initialActive);
  const [questions,   setQuestions]   = useState(initialQuestions);
  const [saved,       setSaved]       = useState(false);
  const [showInfo,    setShowInfo]    = useState(false);
  const [editing,     setEditing]     = useState<TemplateQuestion | null>(null);
  const [isPending,   startTransition] = useTransition();
  const router = useRouter();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const isDirty = JSON.stringify(questions.map(q => q.questionId)) !== JSON.stringify(initialQuestions.map(q => q.questionId));

  const inTemplate = new Set(questions.map((q) => q.questionId));
  const available  = allQuestions.filter((q) => !inTemplate.has(q.id));

  function addQuestion(q: QuestionRow) {
    setQuestions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), questionId: q.id, label: q.label, category: q.category, order: prev.length, type: q.type, help: q.help, placeholder: q.placeholder, prefix: q.prefix, suffix: q.suffix, options: q.options },
    ]);
  }

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function saveInfo() {
    startTransition(async () => {
      await updateTemplate(templateId, {
        name,
        introTitle: introTitle || null,
        introText:  introText  || null,
        active,
      });
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

      <EditEntityHeader
        overline="Rediger mal"
        title={name}
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo((v) => !v)}
        isPending={isPending}
        saved={saved}
        name={name} introTitle={introTitle} introText={introText}
        onChange={(field, value) => ({ name: setName, introTitle: setIntroTitle, introText: setIntroText })[field](value)}
        onSaveInfo={saveInfo}
      >
        {/* Aktiv-toggle — alltid synlig */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-cloud">Aktiv</span>
          <button
            type="button"
            onClick={toggleActive}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${active ? "bg-accent" : "bg-steel"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
          </button>
          <span className="text-xs text-mist">{active ? "Vises ved oppretting av undersøkelse" : "Arkivert"}</span>
        </div>
      </EditEntityHeader>

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
                    item={{ id: q.questionId, label: q.label, category: q.category, type: q.type, help: q.help, placeholder: q.placeholder, prefix: q.prefix, suffix: q.suffix, options: q.options }}
                    index={i}
                    onRemove={() => removeQuestion(q.questionId)}
                    onEdit={() => setEditing(q)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <AddQuestionsPanel available={available} onAdd={addQuestion} />

      <EditQuestionModal
        question={editing ? { id: editing.questionId, label: editing.label, category: editing.category, type: editing.type ?? "text", help: editing.help ?? null, placeholder: editing.placeholder ?? null, prefix: editing.prefix ?? null, suffix: editing.suffix ?? null, options: editing.options } : null}
        onClose={() => setEditing(null)}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 relative z-10">
        <SaveButton type="button" onClick={handleSaveQuestions} loading={isPending} disabled={!isDirty} />
        <Button variant="ghost" onClick={handleResetQuestions} disabled={isPending || !isDirty}>
          Tilbakestill
        </Button>
      </div>

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
