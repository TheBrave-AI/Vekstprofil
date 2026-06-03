import { getSurvey } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function ClientQuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getSurvey(token);

  if (result.status === "not_found") notFound();
  if (result.status === "draft")     notFound();

  if (result.status === "submitted") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl text-cloud">Allerede besvart</h1>
          <p className="text-mist text-sm">Skjemaet er allerede fylt ut. Takk for dine svar!</p>
        </div>
      </main>
    );
  }

  const { questions, answers } = result.survey!;

  // TODO (Andreas): replace placeholder with:
  // <Skjema token={token} questions={questions} existingAnswers={answers} />
  // Per-question: saveAnswer(token, questionId, value | SKIPPED)
  // On final confirm: submitSurvey(token)
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink">
      <div className="rounded-card bg-midnight p-8 shadow-card text-center space-y-2 max-w-sm w-full mx-4">
        <p className="text-xs font-medium tracking-widest uppercase text-accent">Brave — Kartlegging</p>
        <p className="text-sm text-mist">{questions.length} spørsmål · Questionnaire-komponenten kobles inn her.</p>
        <p className="font-mono text-xs text-muted pt-2">token: {token}</p>
      </div>
    </main>
  );
}
