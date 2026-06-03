"use client";

import { createQuestionnaire } from "@/app/actions";
import { useState, useTransition } from "react";

interface Template {
  t_id: number;
  title: string;
  short_title: string | null;
}

export function NewSubmissionForm({ templates }: { templates: Template[] }) {
  const [link, setLink]         = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const t_id         = Number(formData.get("t_id"));
    const customerName = (formData.get("customerName") as string).trim();
    startTransition(async () => {
      const { link } = await createQuestionnaire(t_id, customerName);
      setLink(`${window.location.origin}/k/${link}`);
    });
  }

  if (link) {
    return (
      <div className="rounded-card bg-midnight p-8 shadow-card space-y-5 max-w-lg">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase text-accent">Lenke klar</p>
          <h2 className="font-display text-xl text-cloud">Send denne til kunden</h2>
        </div>
        <div className="rounded-xl border border-line bg-navy px-4 py-3 font-mono text-sm text-cloud break-all select-all">
          {link}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(link)}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-onbrand hover:bg-brand-deep transition"
          >
            Kopier lenke
          </button>
          <button
            onClick={() => setLink(null)}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-cloud hover:bg-midnight transition"
          >
            Ny kartlegging
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-card bg-midnight p-8 shadow-card space-y-5 max-w-lg">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-widest uppercase text-accent">Ny kartlegging</p>
        <h2 className="font-display text-xl text-cloud">Opprett kundelenke</h2>
      </div>

      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Mal</span>
          <select
            name="t_id"
            required
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud focus:border-accent focus:outline-none transition"
          >
            {templates.map((t) => (
              <option key={t.t_id} value={t.t_id}>
                {t.short_title ?? t.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Kundenavn</span>
          <input
            name="customerName"
            required
            placeholder="Eksempel AS"
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud placeholder:text-muted focus:border-accent focus:outline-none transition"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-50 transition"
      >
        {isPending ? "Oppretter…" : "Opprett kartleggingslenke"}
      </button>
    </form>
  );
}
