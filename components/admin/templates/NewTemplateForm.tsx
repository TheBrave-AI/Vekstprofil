"use client";

import { createTemplate } from "@/app/actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IntroFormFields } from "@/components/admin/shared/IntroFormFields";
import FormSubmitButton from "@/components/form/FormSubmitButton";

interface QuestionRow { id: string; label: string; category: string | null; }
interface TemplateStarter {
  id: string; name: string; shortName: string | null;
  introTitle: string | null; introText: string | null;
  questionIds: string[];
}

export function NewTemplateForm({ questions, templates }: { questions: QuestionRow[]; templates: TemplateStarter[] }) {
  const [selected,   setSelected]   = useState<string[]>([]);
  const [name,       setName]       = useState("");
  const [introTitle, setIntroTitle] = useState("");
  const [introText,  setIntroText]  = useState("");
  const [isPending,  startTransition] = useTransition();
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createTemplate({ name: name.trim(), introTitle: introTitle.trim() || undefined, introText: introText.trim() || undefined, questionIds: selected });
      router.push("/admin/templates");
    });
  }

  function applyStarter(t: TemplateStarter) {
    setName(t.name);
    setIntroTitle(t.introTitle ?? "");
    setIntroText(t.introText ?? "");
    setSelected(t.questionIds);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {templates.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Kopier fra eksisterende mal</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyStarter(t)}
                className="px-3 py-1.5 text-sm rounded-lg bg-midnight border border-line text-mist hover:text-cloud hover:border-steel transition"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-card bg-midnight p-6 shadow-card space-y-4">
        <IntroFormFields
          name={name} introTitle={introTitle} introText={introText}
          onChange={(field, value) => ({ name: setName, introTitle: setIntroTitle, introText: setIntroText })[field](value)}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-cloud">Velg spørsmål ({selected.length} valgt)</p>
        <div className="rounded-card bg-midnight shadow-card overflow-hidden">
          {questions.map((q) => (
            <label key={q.id} className="flex items-center gap-3 px-5 py-3 border-b border-line last:border-0 cursor-pointer hover:bg-steel/10 transition">
              <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggle(q.id)} className="accent-accent" />
              <div>
                {q.category && <p className="text-xs text-accent uppercase tracking-widest">{q.category}</p>}
                <p className="text-sm text-cloud">{q.label}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <FormSubmitButton label="Opprett mal" isPending={isPending} disabled={!name.trim() || selected.length === 0} fullWidth={false} />
    </form>
  );
}
