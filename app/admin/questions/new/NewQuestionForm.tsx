"use client";

import { createQuestion } from "@/app/actions";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/form/FormField";
import FormSubmitButton from "@/components/form/FormSubmitButton";

const TYPES = [
  { value: "text",        label: "Tekst",         desc: "Fritekst, lang svar" },
  { value: "number",      label: "Tall",           desc: "Numerisk input" },
  { value: "boolean",     label: "Ja / Nei",       desc: "Med valgfri begrunnelse" },
  { value: "select",      label: "Velg én",        desc: "Velg ett alternativ" },
  { value: "multiselect", label: "Velg flere",     desc: "Velg ett eller flere" },
];

interface CreatedQuestion { id: string; label: string; category: string | null; }

export function NewQuestionForm({ onCreated }: { onCreated?: (q: CreatedQuestion) => void } = {}) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState("text");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const needsOptions = type === "select" || type === "multiselect";
  const needsPrefix  = type === "number";
  const needsPlaceholder = type === "text" || type === "number";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const label    = (formData.get("label")    as string).trim();
        const category = (formData.get("category") as string).trim() || undefined;

        const optionsRaw = (formData.get("options") as string ?? "").trim();
        const options = needsOptions
          ? optionsRaw.split("\n").map(s => s.trim()).filter(Boolean)
          : undefined;

        if (needsOptions && (!options || options.length < 2)) {
          setError("Legg til minst 2 alternativer (ett per linje).");
          return;
        }

        const { id } = await createQuestion({
          label,
          type,
          category,
          help:        (formData.get("help")         as string).trim() || undefined,
          placeholder: needsPlaceholder ? ((formData.get("placeholder") as string).trim() || undefined) : undefined,
          prefix:      needsPrefix ? ((formData.get("prefix")  as string).trim() || undefined) : undefined,
          suffix:      needsPrefix ? ((formData.get("suffix")  as string).trim() || undefined) : undefined,
          options,
        });

        if (onCreated) {
          onCreated({ id, label, category: category ?? null });
        } else {
          router.push("/admin/questions");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Noe gikk galt.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="rounded-card bg-midnight p-8 shadow-card space-y-6 max-w-xl mx-auto">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-widest uppercase text-accent">Nytt spørsmål</p>
        <h2 className="font-display text-xl text-cloud">Opprett spørsmål</h2>
      </div>

      {/* Type picker */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-cloud">Type</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition ${
                type === t.value
                  ? "border-accent bg-accent/10 text-cloud"
                  : "border-line text-muted hover:border-accent/50 hover:text-cloud"
              }`}
            >
              <span className="text-[13px] font-medium">{t.label}</span>
              <span className="text-[11px] opacity-70">{t.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Label */}
      <FormField name="label" label="Spørsmålstekst" placeholder="F.eks. Hvor mange selgere har dere?" required />

      {/* Category */}
      <FormField name="category" label="Kategori (valgfri)" placeholder="F.eks. Salg" />

      {/* Help text */}
      <FormField name="help" label="Hjelpetekst (valgfri)" placeholder="Forklarende tekst vist under spørsmålet" />

      {/* Placeholder — text + number only */}
      {needsPlaceholder && (
        <FormField name="placeholder" label="Plassholdertekst (valgfri)" placeholder="F.eks. Skriv inn antall…" />
      )}

      {/* Prefix / suffix — number only */}
      {needsPrefix && (
        <div className="grid grid-cols-2 gap-4">
          <FormField name="prefix" label="Prefiks (valgfri)" placeholder="F.eks. kr" />
          <FormField name="suffix" label="Suffiks (valgfri)" placeholder="F.eks. %" />
        </div>
      )}

      {/* Options — select + multiselect only */}
      {needsOptions && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Alternativer <span className="text-accent">*</span></span>
          <textarea
            name="options"
            rows={5}
            placeholder={"Alternativ 1\nAlternativ 2\nAlternativ 3"}
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud placeholder:text-muted focus:border-accent focus:outline-none transition resize-none"
          />
          <p className="text-[11.5px] text-muted">Én per linje. Minst 2 alternativer.</p>
        </label>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <FormSubmitButton label="Opprett spørsmål" isPending={isPending} fullWidth={false} />
        {!onCreated && (
          <a href="/admin/questions" className="text-sm text-muted hover:text-cloud transition">
            Avbryt
          </a>
        )}
      </div>
    </form>
  );
}

