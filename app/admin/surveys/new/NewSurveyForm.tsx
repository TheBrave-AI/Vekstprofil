"use client";

import { createSurvey } from "@/app/actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface CustomerRow { id: string; companyName: string; }
interface TemplateRow { id: string; name: string; }

export function NewSurveyForm({
  customers,
  templates,
  preselectedCustomerId,
}: {
  customers: CustomerRow[];
  templates: TemplateRow[];
  preselectedCustomerId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(fd: FormData) {
    const customerId = fd.get("customerId") as string;
    const templateId = (fd.get("templateId") as string) || undefined;
    startTransition(async () => {
      const { id } = await createSurvey(customerId, templateId);
      router.push(`/admin/surveys/${id}/edit`);
    });
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
    <form action={handleSubmit} className="rounded-card bg-midnight p-8 shadow-card space-y-5 max-w-lg">
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Kunde</span>
          <select
            name="customerId"
            required
            defaultValue={preselectedCustomerId ?? customers[0]?.id}
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud focus:border-accent focus:outline-none transition"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-cloud">Mal (valgfri)</span>
          <select
            name="templateId"
            className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud focus:border-accent focus:outline-none transition"
          >
            <option value="">— Ingen mal, legg til spørsmål manuelt —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted">Velger du en mal kopieres spørsmålene automatisk inn.</p>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-50 transition"
      >
        {isPending ? "Oppretter…" : "Opprett survey (utkast)"}
      </button>
    </form>
  );
}
