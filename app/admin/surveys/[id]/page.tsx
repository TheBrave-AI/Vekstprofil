import { getSurveyAdmin } from "@/app/actions";
import { formatAnswer } from "@/lib/formatAnswer";
import { CopyLinkButton } from "@/components/admin/shared/CopyLinkButton";
import { DeleteSurveyButton } from "@/components/admin/surveys/DeleteSurveyButton";
import Button from "@/components/ui/primitives/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Question } from "@/lib/types";
import NotAnsweredPill from "@/components/ui/primitives/NotAnsweredPill";
import QuestionRow from "@/components/ui/primitives/QuestionRow";

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const survey = await getSurveyAdmin(id);
  if (!survey) notFound();

  const answerByQid = Object.fromEntries(survey.answers.map((a) => [a.questionId, a]));

  const statusLabel: Record<string, string> = { draft: "Utkast", active: "Ubesvart", submitted: "Besvart" };
  const answeredCount = survey.questions.filter(({ question: q }) => {
    const a = answerByQid[q.id];
    return a && !a.skipped && a.value;
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/admin/customers/${survey.customerId}`}
            className="text-xs text-muted hover:text-accent transition"
          >
            ← {survey.customer.companyName}
          </Link>
          <h1 className="font-display text-2xl text-cloud">
            Undersøkelse — {survey.createdAt.toLocaleDateString("nb-NO")}
          </h1>
          <p className="text-[12.5px] text-muted">
            {survey.template?.name ?? "Ingen mal"} · {statusLabel[survey.status]}
            {survey.submittedAt &&
              ` · Besvart ${survey.submittedAt.toLocaleDateString("nb-NO")}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 items-end">
          {survey.status !== "draft" && <CopyLinkButton token={survey.token} />}
          <Button variant="ghost" href={`/api/export/${survey.token}`}>
            Last ned CSV
          </Button>
        </div>
      </div>

      {/* Answer list */}
      {survey.questions.length === 0 ? (
        <p className="text-sm text-muted">Ingen spørsmål i denne undersøkelsen.</p>
      ) : (
        <div className="rounded-card bg-midnight shadow-card overflow-hidden max-w-3xl">
          {/* Count */}
          <div className="px-6 py-4 border-b border-line">
            <p className="text-[12.5px] text-muted">
              {answeredCount} av {survey.questions.length} besvart
            </p>
          </div>

          {/* Rows */}
          <div>
            {survey.questions.map(({ question: q }) => {
              const a = answerByQid[q.id];
              const qTyped: Question = {
                id: q.id, label: q.label, type: q.type as Question["type"],
                category: q.category ?? "", help: q.help ?? "", placeholder: q.placeholder ?? "",
                prefix: q.prefix ?? undefined, suffix: q.suffix ?? undefined,
              };
              const formatted = a && !a.skipped ? formatAnswer(qTyped, a.value ?? undefined) : null;
              const isLongText = q.type === "text";

              // For boolean: extract optional description after "Ja\n"
              const boolDesc =
                q.type === "boolean" && a?.value?.startsWith("Ja\n")
                  ? a.value.slice(3).trim()
                  : null;

              return (
                <QuestionRow
                  key={q.id}
                  category={q.category}
                  label={q.label}
                  columns="minmax(0,55%) minmax(0,45%)"
                  className="px-6 last:border-0"
                  sub={boolDesc && <p className="text-mist text-[13px] mt-1 leading-relaxed">{boolDesc}</p>}
                  right={
                    formatted ? (
                      <span className="font-display font-medium text-brand text-[21px] tabular-nums text-right max-w-[200px] leading-tight">
                        {formatted}
                      </span>
                    ) : (
                      <NotAnsweredPill skipped={!!a?.skipped} />
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      <DeleteSurveyButton surveyId={survey.id} />
    </div>
  );
}

