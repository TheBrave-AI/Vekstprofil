"use client";

import { updateQuestion } from "@/app/actions";
import { SaveButton } from "@/components/ui/buttons/SaveButton";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/form/FormField";

const TYPES = [
  { value: "text",        label: "Tekst",      desc: "Fritekst, lang svar" },
  { value: "number",      label: "Tall",        desc: "Numerisk input" },
  { value: "boolean",     label: "Ja / Nei",    desc: "Med valgfri begrunnelse" },
  { value: "select",      label: "Velg én",     desc: "Velg ett alternativ" },
  { value: "multiselect", label: "Velg flere",  desc: "Velg ett eller flere" },
];

interface Question {
  id:          string;
  label:       string;
  type:        string;
  category:    string | null;
  help:        string | null;
  placeholder: string | null;
  prefix:      string | null;
  suffix:      string | null;
  options:     unknown;
}

interface Props {
  question: Question;
  onSaved:  () => void;
  onClose:  () => void;
}

export function EditQuestionForm({ question, onSaved, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState(question.type);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const needsOptions     = type === "select" || type === "multiselect";
  const needsPrefix      = type === "number";
  const needsPlaceholder = type === "text" || type === "number";

  const existingOptions = Array.isArray(question.options)
    ? (question.options as string[]).join("\n")
    : "";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const label    = (formData.get("label")    as string).trim();
        const category = (formData.get("category") as string).trim() || null;
        const help     = (formData.get("help")     as string).trim() || null;

        const optionsRaw = (formData.get("options") as string ?? "").trim();
        const options = needsOptions
          ? optionsRaw.split("\n").map(s => s.trim()).filter(Boolean)
          : null;

        if (needsOptions && (!options || options.length < 2)) {
          setError("Legg til minst 2 alternativer (ett per linje).");
          return;
        }

        await updateQuestion(question.id, {
          label,
          type,
          category,
          help,
          placeholder: needsPlaceholder ? ((formData.get("placeholder") as string).trim() || null) : null,
          prefix:      needsPrefix      ? ((formData.get("prefix")      as string).trim() || null) : null,
          suffix:      needsPrefix      ? ((formData.get("suffix")      as string).trim() || null) : null,
          options,
        });

        router.refresh();
        onSaved();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Noe gikk galt.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="rounded-card bg-midnight p-8 shadow-card space-y-6 max-w-xl mx-auto">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-widest uppercase text-accent">Rediger</p>
        <h2 className="font-display text-xl text-cloud">Rediger spørsmål</h2>
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

      <FormField name="label"    label="Spørsmålstekst" defaultValue={question.label}            required />
      <FormField name="category" label="Kategori (valgfri)" defaultValue={question.category ?? ""} placeholder="F.eks. Salg" />
      <FormField name="help"     label="Hjelpetekst (valgfri)" defaultValue={question.help ?? ""}  placeholder="Forklarende tekst vist under spørsmålet" />

      {needsPlaceholder && (
        <FormField name="placeholder" label="Plassholdertekst (valgfri)" defaultValue={question.placeholder ?? ""} placeholder="F.eks. Skriv inn antall…" />
      )}

      {needsPrefix && (
        <div className="grid grid-cols-2 gap-4">
          <FormField name="prefix" label="Prefiks (valgfri)" defaultValue={question.prefix ?? ""} placeholder="F.eks. kr" />
          <FormField name="suffix" label="Suffiks (valgfri)" defaultValue={question.suffix ?? ""} placeholder="F.eks. %" />
        </div>
      )}

      {needsOptions && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Alternativer <span className="text-accent">*</span></span>
          <textarea
            name="options"
            rows={5}
            defaultValue={existingOptions}
            placeholder={"Alternativ 1\nAlternativ 2\nAlternativ 3"}
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud placeholder:text-muted focus:border-accent focus:outline-none transition resize-none"
          />
          <p className="text-[11.5px] text-muted">Én per linje. Minst 2 alternativer.</p>
        </label>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <SaveButton loading={isPending}>Lagre endringer</SaveButton>
        <button type="button" onClick={onClose} className="text-sm text-muted hover:text-cloud transition">
          Avbryt
        </button>
      </div>
    </form>
  );
}
