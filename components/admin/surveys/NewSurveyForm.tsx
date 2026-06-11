"use client";

import { createSurvey, createAndActivateSurvey } from "@/app/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IntroFormFields } from "@/components/admin/shared/IntroFormFields";
import Button from "@/components/ui/primitives/Button";

interface CustomerRow  { id: string; companyName: string; }
interface QuestionRow  { id: string; label: string; category: string | null; }
interface TemplateStarter {
  id: string; name: string; shortName: string | null;
  introTitle: string | null; introText: string | null;
  questionIds: string[];
}

export function NewSurveyForm({
  customers,
  templates,
  questions,
  preselectedCustomerId,
}: {
  customers:              CustomerRow[];
  templates:              TemplateStarter[];
  questions:              QuestionRow[];
  preselectedCustomerId?: string;
}) {
  const [customerId,  setCustomerId]  = useState(
    customers.find(c => c.id === preselectedCustomerId)?.id ?? customers[0]?.id ?? ""
  );
  const [templateId,  setTemplateId]  = useState("");
  const [selected,    setSelected]    = useState<string[]>([]);
  const [name,        setName]        = useState("");
  const [introTitle,  setIntroTitle]  = useState("");
  const [introText,   setIntroText]   = useState("");
  const [pendingAction, setPendingAction] = useState<"draft" | "active" | null>(null);
  const router = useRouter();

  function applyStarter(t: TemplateStarter) {
    setTemplateId(t.id);
    setName(t.name);
    setIntroTitle(t.introTitle ?? "");
    setIntroText(t.introText ?? "");
    setSelected(t.questionIds);
  }

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const activeTemplateId = templates.find(t =>
    t.id === templateId &&
    t.questionIds.join(",") === selected.join(",") &&
    t.name === name &&
    (t.introTitle ?? "") === introTitle &&
    (t.introText ?? "") === introText
  )?.id ?? null;

  const introData = {
    name:       name       || undefined,
    introTitle: introTitle || undefined,
    introText:  introText  || undefined,
  };

  async function handleDraft() {
    if (!customerId || pendingAction) return;
    setPendingAction("draft");
    try {
      const { id } = await createSurvey(customerId, activeTemplateId ?? undefined, introData, selected);
      router.push(`/admin/surveys/${id}/edit`);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleActivate() {
    if (!customerId || pendingAction) return;
    setPendingAction("active");
    try {
      const { id } = await createAndActivateSurvey(customerId, activeTemplateId ?? undefined, introData, selected);
      router.push(`/admin/surveys/${id}`);
    } finally {
      setPendingAction(null);
    }
  }

  if (customers.length === 0) {
    return (
      <p className="text-sm text-mist">
        Ingen kunder ennå.{" "}
        <a href="/admin/customers/new" className="text-accent hover:underline">Opprett en kunde</a> først.
      </p>
    );
  }

  return (
    <form className="space-y-6">

      {/* Kunde */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Kunde</p>
        <div className="rounded-card bg-midnight p-4 shadow-card">
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud focus:border-accent focus:outline-none transition"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kopier fra mal */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Velg mal</p>
          <div className="flex flex-wrap gap-2">
            
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyStarter(t)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${activeTemplateId === t.id ? "bg-accent/10 border-accent text-cloud" : "bg-midnight border-line text-mist hover:text-cloud hover:border-steel"}`}
              >
                {t.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setTemplateId(""); setName(""); setIntroTitle(""); setIntroText(""); setSelected([]); }}
              className={`px-3 py-1.5 text-sm rounded-lg border border-dashed transition ${activeTemplateId === null ? "border-steel text-cloud" : "border-line text-mist hover:text-cloud hover:border-steel"}`}
            >
              Lag uten mal
            </button>
          </div>

        </div>
      )}

      {/* Intro-innhold */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Intro-innhold</p>
        <div className="rounded-card bg-midnight p-6 shadow-card space-y-4">
          <IntroFormFields
            name={name} introTitle={introTitle} introText={introText}
            onChange={(field, value) => ({ name: setName, introTitle: setIntroTitle, introText: setIntroText })[field](value)}
          />
        </div>
      </div>

      {/* Spørsmål */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Spørsmål ({selected.length} valgt)</p>
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
        {selected.length === 0 && (
          <p className="text-xs text-mist">Velg minst ett spørsmål for å opprette undersøkelsen.</p>
        )}
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleDraft}
          loading={pendingAction === "draft"}
          disabled={!customerId || selected.length === 0 || pendingAction !== null}
        >
          Lagre som utkast
        </Button>
        <Button
          type="button"
          variant="solid"
          onClick={handleActivate}
          loading={pendingAction === "active"}
          disabled={!customerId || selected.length === 0 || pendingAction !== null}
        >
          Opprett og aktiver
        </Button>
      </div>

    </form>
  );
}
