"use client";

import { updateTemplate } from "@/app/actions";
import { useState, useTransition } from "react";

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
  const [saved,       setSaved]       = useState(false);
  const [isPending,   startTransition] = useTransition();

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  function saveInfo() {
    startTransition(async () => {
      await updateTemplate(templateId, { name, description: description || null, active });
      flash();
    });
  }

  function toggleActive() {
    const next = !active;
    setActive(next);
    startTransition(() => updateTemplate(templateId, { active: next }));
  }

  return (
    <div className="space-y-8 max-w-2xl">
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
        <h2 className="font-display text-lg text-cloud">Spørsmål ({initialQuestions.length})</h2>
        <div className="rounded-card bg-midnight shadow-card overflow-hidden">
          {initialQuestions.length === 0 ? (
            <p className="px-5 py-4 text-sm text-mist">Ingen spørsmål i denne malen.</p>
          ) : (
            initialQuestions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-4 px-5 py-3 border-b border-line last:border-0">
                <span className="text-xs text-muted font-mono w-4">{i + 1}</span>
                <div className="flex-1">
                  {q.category && <p className="text-xs text-accent uppercase tracking-widest">{q.category}</p>}
                  <p className="text-sm text-cloud">{q.label}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-muted">
          For å endre spørsmål i en mal, gå til{" "}
          <a href="/admin/questions" className="text-accent hover:underline">Spørsmålskatalog</a>.
        </p>
      </div>
    </div>
  );
}
