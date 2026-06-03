import { db } from "@/lib/db";
import { formatAnswer } from "@/lib/formatAnswer";
import { AnswersChart } from "./AnswersChart";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Question } from "@/lib/types";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const qu_id = Number(id);

  const questionnaire = await db.questionnaire.findUnique({
    where:   { qu_id },
    include: { customer: true, template: true },
  });

  if (!questionnaire) notFound();

  const answerIds  = questionnaire.answer_ids as number[] | null;
  const isSubmitted = answerIds !== null;

  const answers = isSubmitted && answerIds!.length > 0
    ? await db.answer.findMany({
        where:   { a_id: { in: answerIds! } },
        include: { question: true },
      })
    : [];

  const templateQuestionIds = questionnaire.template.question_ids as number[];
  const allQuestions = await db.question.findMany({
    where: { q_id: { in: templateQuestionIds } },
  });

  const questions: Question[] = templateQuestionIds
    .map((qid) => allQuestions.find((q) => q.q_id === qid))
    .filter((q): q is NonNullable<typeof q> => q !== undefined)
    .map((q) => ({
      id:          q.id,
      category:    q.category,
      label:       q.label,
      help:        q.help,
      placeholder: q.placeholder,
      type:        q.type as Question["type"],
      prefix:      q.prefix  ?? undefined,
      suffix:      q.suffix  ?? undefined,
      options:     q.options ? (q.options as string[]) : undefined,
      slider:      q.slider  ? (q.slider as Question["slider"]) : undefined,
    }));

  // Map answers by question string slug (id)
  const answerBySlug = Object.fromEntries(
    answers.map((a) => [a.question.id, a])
  );

  const chartData = questions
    .filter((q) => q.type === "number")
    .flatMap((q) => {
      const a = answerBySlug[q.id];
      if (!a || a.empty || !a.value) return [];
      const num = parseFloat(a.value.replace(/\s|kr/gi, "").replace(",", "."));
      if (isNaN(num)) return [];
      return [{ label: q.category, value: num, unit: q.suffix ?? q.prefix ?? "" }];
    });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/admin" className="text-xs text-mist hover:text-accent transition">← Innboks</Link>
          <h1 className="font-display text-2xl text-cloud">{questionnaire.customer.name}</h1>
          <p className="text-sm text-mist">
            {questionnaire.template.short_title ?? questionnaire.template.title}&nbsp;·&nbsp;
            {isSubmitted ? "Innsendt" : "Ikke besvart ennå"}
          </p>
        </div>
        {isSubmitted && (
          <a
            href={`/api/export/${questionnaire.link}`}
            className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-cloud hover:bg-midnight transition"
          >
            Last ned CSV
          </a>
        )}
      </div>

      {!isSubmitted ? (
        <p className="text-sm text-mist">Kunden har ikke besvart ennå.</p>
      ) : (
        <>
          <AnswersChart data={chartData} />
          <div>
            <h2 className="font-display text-lg text-cloud mb-4">Alle svar</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {questions.map((q) => {
                const a = answerBySlug[q.id];
                const formatted = a && !a.empty ? formatAnswer(q, a.value ?? undefined) : null;
                return (
                  <div key={q.id} className="rounded-xl bg-midnight border border-line p-4 space-y-1">
                    <p className="text-xs font-medium tracking-widest uppercase text-accent">{q.category}</p>
                    <p className="text-sm font-medium text-cloud">{q.label}</p>
                    {formatted ? (
                      <p className="text-sm text-cloud font-mono">{formatted}</p>
                    ) : (
                      <span className="inline-block rounded-full bg-coral/10 px-2.5 py-0.5 text-xs text-coral">
                        Ikke oppgitt
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
