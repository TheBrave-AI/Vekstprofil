import { listQuestions } from "@/app/actions";
import { QuestionsClient } from "./QuestionsClient";

export default async function QuestionsPage() {
  const questions = await listQuestions();

  return (
    <div className="space-y-6">
      <QuestionsClient questions={questions} />
    </div>
  );
}
