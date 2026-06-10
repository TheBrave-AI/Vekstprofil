"use client";

import { setSurveyQuestions, activateSurvey, updateSurvey } from "@/app/actions";
import { EditEntityHeader } from "@/components/admin/shared/EditEntityHeader";
import { EditQuestionModal } from "@/components/admin/questions/EditQuestionModal";
import Button from "@/components/ui/primitives/Button";
import { SaveButton } from "@/components/ui/buttons/SaveButton";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { AddQuestionsPanel } from "@/components/admin/questions/AddQuestionsPanel";
import { Modal } from "@/components/ui/Modal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableQuestion, type SortableQuestionItem } from "@/components/admin/questions/SortableQuestion";
import { DeleteSurveyButton } from "./DeleteSurveyButton";

interface QuestionRow extends SortableQuestionItem {}

export function EditSurveyClient({
  surveyId,
  title,
  surveyQuestions,
  allQuestions,
  initialShortName,
  initialName,
  initialIntroTitle,
  initialIntroText,
}: {
  surveyId:          string;
  title:             string;
  surveyQuestions:   QuestionRow[];
  allQuestions:      QuestionRow[];
  initialShortName:  string | null;
  initialName:       string | null;
  initialIntroTitle: string | null;
  initialIntroText:  string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [current,    setCurrent]    = useState(surveyQuestions);
  const [editing,    setEditing]    = useState<QuestionRow | null>(null);
  const [showInfo,   setShowInfo]   = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [shortName,  setShortName]  = useState(initialShortName  ?? "");
  const [name,       setName]       = useState(initialName       ?? "");
  const [introTitle, setIntroTitle] = useState(initialIntroTitle ?? "");
  const [introText,  setIntroText]  = useState(initialIntroText  ?? "");

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

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function saveInfo() {
    startTransition(async () => {
      await updateSurvey(surveyId, {
        shortName:  shortName  || null,
        name:       name       || null,
        introTitle: introTitle || null,
        introText:  introText  || null,
      });
      flash();
    });
  }

  function handleActivate() {
    startTransition(async () => {
      try {
        await setSurveyQuestions(surveyId, current.map((q) => q.id));
        await activateSurvey(surveyId);
        router.push(`/admin/surveys/${surveyId}`);
      } catch {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">

      <EditEntityHeader
        overline="Rediger undersøkelse"
        title={title}
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo((v) => !v)}
        isPending={isPending}
        saved={saved}
        shortName={shortName} name={name} introTitle={introTitle} introText={introText}
        onChange={(field, value) => ({ shortName: setShortName, name: setName, introTitle: setIntroTitle, introText: setIntroText })[field](value)}
        onSaveInfo={saveInfo}
      />

      {/* Current questions */}
      <div className="space-y-3">
        <h2 className="font-display text-xl text-cloud">Spørsmål ({current.length})</h2>
        <div className="rounded-card bg-midnight shadow-card overflow-hidden relative z-0">
          {current.length === 0 ? (
            <p className="px-5 py-4 text-sm text-mist">Ingen spørsmål ennå.</p>
          ) : (
            <DndContext id="survey-questions" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={current.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                {current.map((q, i) => (
                  <SortableQuestion
                    key={q.id}
                    item={q}
                    index={i}
                    onRemove={() => remove(q.id)}
                    onEdit={(item) => setEditing(item as QuestionRow)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
      

      <AddQuestionsPanel available={available} onAdd={add} />

      

      <EditQuestionModal
        question={editing ? { id: editing.id, label: editing.label, category: editing.category, type: editing.type ?? "text", help: editing.help ?? null, placeholder: editing.placeholder ?? null, prefix: editing.prefix ?? null, suffix: editing.suffix ?? null, options: editing.options } : null}
        onClose={() => setEditing(null)}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 relative z-10">
        <SaveButton type="button" onClick={handleSave} loading={isPending} disabled={!isDirty} />
        <Button variant="ghost" onClick={handleReset} disabled={isPending || !isDirty}>
          Tilbakestill
        </Button>
        <DeleteSurveyButton surveyId={surveyId} />
        <div className="flex-1" />
        <Button variant="accent" onClick={handleActivate} disabled={isPending || current.length === 0}>
          Aktiver skjema
        </Button>
      </div>
    </div>
  );
}
