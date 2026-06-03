import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const questionnaires = await db.questionnaire.findMany({
    orderBy: { qu_id: "desc" },
    include: { customer: true, template: true },
  });

  const total     = questionnaires.length;
  const submitted = questionnaires.filter((q) => q.answer_ids !== null).length;
  const pending   = total - submitted;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cloud">Kartlegginger</h1>
        <Link
          href="/admin/new"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-onbrand hover:bg-brand-deep transition"
        >
          + Ny lenke
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Totalt",    value: total },
          { label: "Innsendt",  value: submitted },
          { label: "Avventer",  value: pending },
        ].map((s) => (
          <div key={s.label} className="rounded-card bg-midnight px-6 py-5 shadow-card">
            <p className="text-3xl font-display text-cloud">{s.value}</p>
            <p className="text-sm text-mist mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {questionnaires.length === 0 ? (
        <p className="text-mist text-sm">Ingen kartlegginger ennå.</p>
      ) : (
        <div className="overflow-hidden rounded-card bg-midnight shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wider">
                <th className="px-5 py-3">Kunde</th>
                <th className="px-5 py-3">Mal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {questionnaires.map((q) => (
                <tr key={q.qu_id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 text-cloud font-medium">{q.customer.name}</td>
                  <td className="px-5 py-4 text-mist">{q.template.short_title ?? q.template.title}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      q.answer_ids !== null
                        ? "bg-accent/10 text-accent"
                        : "bg-steel/40 text-mist"
                    }`}>
                      {q.answer_ids !== null ? "Innsendt" : "Avventer"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {q.answer_ids !== null ? (
                      <Link href={`/admin/submissions/${q.qu_id}`} className="text-accent hover:underline text-xs font-medium">
                        Se svar →
                      </Link>
                    ) : (
                      <span className="font-mono text-xs text-muted select-all">/k/{q.link}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
