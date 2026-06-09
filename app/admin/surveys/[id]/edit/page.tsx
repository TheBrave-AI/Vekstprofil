import { getSurveyAdmin, listQuestions } from "@/app/actions";
import { EditSurveyClient } from "@/components/admin/EditSurveyClient";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [survey, allQuestions] = await Promise.all([getSurveyAdmin(id), listQuestions()]);
  if (!survey) notFound();

  if (survey.status !== "draft") {
    return (
      <div className="space-y-4">
        <Link href={`/admin/surveys/${id}`} className="text-xs text-mist hover:text-accent">← Tilbake</Link>
        <p className="text-sm text-mist">Kun utkast kan redigeres. Status er nå: <strong>{survey.status}</strong></p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/customers/${survey.customerId}`} className="text-xs text-mist hover:text-accent transition">
          ← {survey.customer.companyName}
        </Link>
        <h1 className="font-display text-2xl text-cloud mt-1">Rediger survey (utkast)</h1>
      </div>

      <EditSurveyClient
        surveyId={id}
        surveyQuestions={survey.questions.map((sq) => ({
          id:          sq.question.id,
          label:       sq.question.label,
          category:    sq.question.category,
          type:        sq.question.type,
          help:        sq.question.help,
          placeholder: sq.question.placeholder,
          prefix:      sq.question.prefix,
          suffix:      sq.question.suffix,
          options:     sq.question.options,
        }))}
        allQuestions={allQuestions.map((q) => ({
          id:          q.id,
          label:       q.label,
          category:    q.category,
          type:        q.type,
          help:        q.help,
          placeholder: q.placeholder,
          prefix:      q.prefix,
          suffix:      q.suffix,
          options:     q.options,
        }))}
        initialShortName={survey.shortName}
        initialName={survey.name}
        initialIntroTitle={survey.introTitle}
        initialIntroText={survey.introText}
      />
    </div>
  );
}
