import { getSurveyAdmin } from "@/app/actions";
import { mapQuestion } from "@/lib/mapQuestion";
import { formatAnswer } from "@/lib/formatAnswer";
import { CopyLinkButton } from "@/components/admin/shared/CopyLinkButton";
import { DeleteSurveyButton } from "@/components/admin/surveys/DeleteSurveyButton";
import Button from "@/components/ui/primitives/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import NotAnsweredPill from "@/components/ui/primitives/NotAnsweredPill";
import QuestionRow from "@/components/ui/primitives/QuestionRow";
import PageHeader from "@/components/layout/PageHeader";

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const survey = await getSurveyAdmin(id);
  if (!survey) notFound();

  const answerByQid = Object.fromEntries(survey.answers.map((a) => [a.questionId, a]));

  const answeredCount = survey.questions.filter(({ question: q }) => {
    const a = answerByQid[q.id];
    return a && !a.skipped && a.value;
  }).length;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/admin/customers/${survey.customerId}`}
            className="text-xs text-mist hover:text-accent transition"
          >
            ← {survey.customer.companyName}
          </Link>
          <PageHeader title={survey.template?.name ?? "Undersøkelse"} />
          
          <p className="text-[16px] text-muted">
            {survey.submittedAt &&
              `Besvart ${survey.submittedAt.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}`}
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
        <div className="rounded-card bg-midnight shadow-card overflow-hidden">
          {/* Count */}
          <div className="px-6 py-4 border-b border-line">
            <p className="text-[12.5px] text-muted">
              {answeredCount} av {survey.questions.length} besvart
            </p>
          </div>

          {/* Rows */}
          <div>
            {survey.questions.map(({ question: q }) => {
              const a         = answerByQid[q.id];
              const formatted = a && !a.skipped ? formatAnswer(mapQuestion(q), a.value ?? undefined) : null;

              return (
                <QuestionRow
                  key={q.id}
                  category={q.category}
                  label={q.label}
                  className="px-6 last:border-0"
                  sub={
                    formatted
                      ? <div className="space-y-1">
                          {formatted.split('\n').filter(Boolean).map((line, i) => (
                            <p key={i} className="text-mist text-[14px] leading-relaxed">{line}</p>
                          ))}
                        </div>
                      : <NotAnsweredPill skipped={!!a?.skipped} />
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

