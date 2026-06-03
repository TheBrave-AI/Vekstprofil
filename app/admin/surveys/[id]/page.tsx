import { getSurveyAdmin } from "@/app/actions";
import { formatAnswer } from "@/lib/formatAnswer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Question } from "@/lib/types";

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const survey = await getSurveyAdmin(id);
  if (!survey) notFound();

  const answerByQid = Object.fromEntries(survey.answers.map((a) => [a.questionId, a]));

  const statusLabel: Record<string, string> = { draft: "Utkast", active: "Aktiv", submitted: "Innsendt" };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href={`/admin/customers/${survey.customerId}`} className="text-xs text-mist hover:text-accent transition">
            ← {survey.customer.companyName}
          </Link>
          <h1 className="font-display text-2xl text-cloud">Survey — {survey.createdAt.toLocaleDateString("nb-NO")}</h1>
          <p className="text-sm text-mist">
            {survey.template?.name ?? "Ingen mal"} · {statusLabel[survey.status]}
            {survey.submittedAt && ` · Innsendt ${survey.submittedAt.toLocaleDateString("nb-NO")}`}
          </p>
        </div>
        <a href={`/api/export/${survey.token}`} className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-cloud hover:bg-midnight transition">
          Last ned CSV
        </a>
      </div>

      {survey.questions.length === 0 ? (
        <p className="text-sm text-mist">Ingen spørsmål i denne surveyen.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {survey.questions.map((sq) => {
            const q = sq.question;
            const a = answerByQid[q.id];
            const qTyped: Question = {
              id: q.id, label: q.label, type: q.type as Question["type"],
              category: q.category ?? "", help: q.help ?? "", placeholder: q.placeholder ?? "",
              prefix: q.prefix ?? undefined, suffix: q.suffix ?? undefined,
            };
            const formatted = a && !a.skipped ? formatAnswer(qTyped, a.value ?? undefined) : null;
            return (
              <div key={q.id} className="rounded-xl bg-midnight border border-line p-4 space-y-1">
                {q.category && <p className="text-xs font-medium tracking-widest uppercase text-accent">{q.category}</p>}
                <p className="text-sm font-medium text-cloud">{q.label}</p>
                {formatted ? (
                  <p className="text-sm text-cloud font-mono">{formatted}</p>
                ) : (
                  <span className="inline-block rounded-full bg-coral/10 px-2.5 py-0.5 text-xs text-coral">
                    {a?.skipped ? "Hoppet over" : "Ikke besvart"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
