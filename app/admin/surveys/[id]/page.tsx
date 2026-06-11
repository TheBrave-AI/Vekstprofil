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
import { fullDate } from "@/lib/formatTime";

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
      <div className="space-y-3">
        <div className="space-y-1">
          <Link
            href={`/admin/customers/${survey.customerId}`}
            className="text-xs text-mist hover:text-accent transition"
          >
            ← Tilbake til kunde
          </Link>
          <PageHeader title={survey.customer.companyName} />
          <p className="flex items-center gap-1.5 text-[16px] text-muted">
            <svg width="11" height="13" viewBox="0 0 10 12" fill="none" className="shrink-0 opacity-50">
              <path d="M1.5 0.5H6.5L9.5 3.5V11C9.5 11.3 9.3 11.5 9 11.5H1.5C1.2 11.5 1 11.3 1 11V1C1 0.7 1.2 0.5 1.5 0.5Z" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6.5 0.5V3.5H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M3 5.5H7M3 7.5H7M3 9.5H5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            {survey.name ?? survey.template?.name ?? "Undersøkelse"}
            {survey.submittedAt && <> · Besvart {fullDate(survey.submittedAt)}</>}
          </p>
        </div>
        {survey.status !== "draft" && <CopyLinkButton token={survey.token} />}
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

      <div className="flex items-center justify-between">
        <DeleteSurveyButton surveyId={survey.id} />
        <Button variant="ghost" href={`/api/export/${survey.token}`}>
          Last ned CSV
        </Button>
      </div>
    </div>
  );
}

