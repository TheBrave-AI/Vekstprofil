import { db } from "@/lib/db";
import type { Question } from "@/lib/types";

export default async function ClientQuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const questionnaire = await db.questionnaire.findUnique({
    where:   { link: token },
    include: { template: true, customer: true },
  });

  if (!questionnaire) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl text-cloud">Link ikke funnet</h1>
          <p className="text-mist text-sm">Denne lenken finnes ikke eller er ugyldig.</p>
        </div>
      </main>
    );
  }

  if (questionnaire.answer_ids !== null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl text-cloud">Allerede besvart</h1>
          <p className="text-mist text-sm">Skjemaet er allerede fylt ut. Takk for dine svar!</p>
        </div>
      </main>
    );
  }

  // Load questions for this template (ordered by question_ids array)
  const questionIds = questionnaire.template.question_ids as number[];
  const rawQuestions = await db.question.findMany({
    where: { q_id: { in: questionIds } },
  });

  // Preserve the order defined in template.question_ids
  const questions: Question[] = questionIds
    .map((id) => rawQuestions.find((q) => q.q_id === id))
    .filter((q): q is NonNullable<typeof q> => q !== undefined)
    .map((q) => ({
      q_id:        q.q_id,
      question:    q.question,
      hint:        q.hint,
      placeholder: q.placeholder,
      suffix:      q.suffix,
      prefix:      q.prefix,
      category:    q.category,
      answer_type: q.answer_type as Question["answer_type"],
    }));

  // TODO (Andreas): replace placeholder with:
  // <Questionnaire link={token} questions={questions} />
  // On submit call: submitQuestionnaire(link, answers) from "@/app/actions"
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink">
      <div className="rounded-card bg-midnight p-8 shadow-card text-center space-y-2 max-w-sm w-full mx-4">
        <p className="text-xs font-medium tracking-widest uppercase text-accent">
          {questionnaire.template.short_title ?? questionnaire.template.title}
        </p>
        <h1 className="font-display text-xl text-cloud">
          {questionnaire.customer.name}
        </h1>
        <p className="text-sm text-mist">
          {questions.length} spørsmål · Questionnaire-komponenten kobles inn her.
        </p>
        <p className="font-mono text-xs text-muted pt-2">link: {token}</p>
      </div>
    </main>
  );
}
