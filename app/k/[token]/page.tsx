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

  const { questions, answers, companyName, name, introTitle, introText } = result.survey!;

  return (
    <Survey
      token={token}
      questions={questions}
      existingAnswers={answers}
      companyName={companyName}
      name={name}
      introTitle={introTitle}
      introText={introText}
      initiallySubmitted={result.status === "submitted"}
    />
  );
}
