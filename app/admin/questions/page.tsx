import { listQuestions } from "@/app/actions";
import Link from "next/link";

export default async function QuestionsPage() {
  const questions = await listQuestions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl text-cloud">Spørsmålskatalog</h1>
          <p className="text-[12.5px] text-muted mt-0.5">
            Alle spørsmål deles på tvers av maler og surveys. Endringer gjelder retroaktivt.
          </p>
        </div>
        <Link
          href="/admin/questions/new"
          className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-onbrand hover:bg-brand-deep transition"
        >
          + Nytt spørsmål
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-card bg-midnight shadow-card px-6 py-10 text-center">
          <p className="text-sm text-muted">
            Ingen spørsmål ennå.{" "}
            <Link href="/admin/questions/new" className="text-accent hover:underline">
              Opprett det første
            </Link>{" "}
            eller kjør{" "}
            <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">npx prisma db seed</code>.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card bg-midnight shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Kategori</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Spørsmål</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Type</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Alternativer</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-line last:border-0 hover:bg-black/[0.03] transition-colors group">
                  <td className="px-5 py-3 text-[11.5px] font-medium uppercase tracking-widest text-accent whitespace-nowrap">
                    {q.category ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-[13.5px] text-cloud max-w-sm">
                    <Link href={`/admin/questions/${q.id}/edit`} className="group-hover:text-brand transition-colors">
                      {q.label}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-mist whitespace-nowrap">{q.type}</td>
                  <td className="px-5 py-3 text-xs text-muted">
                    {Array.isArray(q.options) ? `${(q.options as string[]).length} stk` : "—"}
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
