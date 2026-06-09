"use client";

import { setSurveyQuestions, activateSurvey, updateSurvey } from "@/app/actions";
import { IntroFormFields } from "@/components/admin/IntroFormFields";
import Button from "@/components/ui/Button";
import { SaveButton } from "@/components/ui/buttons/SaveButton";
import { useTransition, useState, useEffect } from "react";
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
import { SortableQuestion, type SortableQuestionItem } from "@/components/ui/SortableQuestion";
import { DeleteSurveyButton } from "./DeleteSurveyButton";
import { EditQuestionForm } from "./EditQuestionForm";

interface QuestionRow extends SortableQuestionItem {}

export function EditSurveyClient({
  surveyId,
  surveyQuestions,
  allQuestions,
  initialShortName,
  initialName,
  initialIntroTitle,
  initialIntroText,
}: {
  surveyId:          string;
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

  useEffect(() => {
    if (!editing) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setEditing(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

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

      {/* Intro info toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowInfo((v) => !v)}
          className="text-[12px] font-medium text-muted hover:text-cloud transition flex items-center gap-1.5"
        >
          <span>{showInfo ? "▾" : "▸"}</span> Intro-innhold
        </button>

        {saved && <p className="text-xs text-accent mt-1">✓ Lagret</p>}

        {showInfo && (
          <div className="rounded-card bg-midnight p-6 shadow-card space-y-4 mt-3">
            <IntroFormFields
              shortName={shortName} name={name} introTitle={introTitle} introText={introText}
              onChange={(field, value) => ({ shortName: setShortName, name: setName, introTitle: setIntroTitle, introText: setIntroText })[field](value)}
            />
            <div className="flex justify-end">
              <SaveButton type="button" onClick={saveInfo} loading={isPending} />
            </div>
          </div>
        )}
      </div>

      {/* Current questions */}
      <div className="space-y-3">
        <h2 className="font-display text-xl text-cloud">Spørsmål i surveyen ({current.length})</h2>
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
                    onEdit={(item) => setEditing(item as QuestionRow)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
      

      <AddQuestionsPanel available={available} onAdd={add} />

      

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditing(null)}
        >
          <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-midnight border border-line text-muted hover:text-cloud transition-colors"
              aria-label="Lukk"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <EditQuestionForm
              question={{ id: editing.id, label: editing.label, category: editing.category, type: editing.type ?? "text", help: editing.help ?? null, placeholder: editing.placeholder ?? null, prefix: editing.prefix ?? null, suffix: editing.suffix ?? null, options: editing.options }}
              onSaved={() => setEditing(null)}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>
      )}

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
