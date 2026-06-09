"use client";

import { createTemplate } from "@/app/actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/form/FormField";
import FormSubmitButton from "@/components/form/FormSubmitButton";

interface QuestionRow { id: string; label: string; category: string | null; }

export function NewTemplateForm({ questions }: { questions: QuestionRow[] }) {
  const [selected, setSelected]      = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function handleSubmit(fd: FormData) {
    const name       = (fd.get("name") as string).trim();
    const shortName  = (fd.get("shortName") as string).trim();
    const introTitle = (fd.get("introTitle") as string).trim();
    const introText  = (fd.get("introText") as string).trim();
    startTransition(async () => {
      await createTemplate({ name, shortName: shortName || undefined, introTitle: introTitle || undefined, introText: introText || undefined, questionIds: selected });
      router.push("/admin/templates");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="rounded-card bg-midnight p-6 shadow-card space-y-4">
        <FormField name="shortName"  label="Kort navn (intern)"              placeholder="F.eks. START" />
        <FormField name="name"       label="Navn (synlig for kunde)"         placeholder="f.eks. Brave Nullpunkt" required />
        <FormField name="introTitle" label="Intro-tittel (synlig for kunde)" placeholder="F.eks. La oss kartlegge der dere står i dag." />
        <FormField name="introText"  label="Intro-tekst (synlig for kunde)"  placeholder="Valgfri brødtekst på intro-kortet" />
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

      <FormSubmitButton label="Opprett mal" isPending={isPending} disabled={selected.length === 0} fullWidth={false} />
    </form>
  );
}
