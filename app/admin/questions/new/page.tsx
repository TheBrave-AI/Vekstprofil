import { NewQuestionForm } from "@/components/admin/questions/NewQuestionForm";

export default function NewQuestionPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-cloud">Nytt spørsmål</h1>
      <NewQuestionForm />
    </div>
  );
}
