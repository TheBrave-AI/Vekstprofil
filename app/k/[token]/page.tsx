import { getSurvey } from "@/app/actions";
import { notFound } from "next/navigation";
import Survey from "@/components/survey/Survey";

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

  const { questions, answers, name, introTitle, introText } = result.survey!;

  return (
    <Survey
      token={token}
      questions={questions}
      existingAnswers={answers}
      name={name}
      introTitle={introTitle}
      introText={introText}
    />
  );
}
