import { listQuestions, listTemplatesWithQuestions } from "@/app/actions";
import { NewTemplateForm } from "@/components/admin/templates/NewTemplateForm";
import Link from "next/link";

export default async function NewTemplatePage() {
  const [questions, templates] = await Promise.all([listQuestions(), listTemplatesWithQuestions()]);
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link href="/admin/templates" className="text-xs text-mist hover:text-accent transition">← Maler</Link>
        <h1 className="font-display text-2xl text-cloud mt-1">Ny mal</h1>
      </div>
      <NewTemplateForm
        questions={questions.map((q) => ({ id: q.id, label: q.label, category: q.category }))}
        templates={templates.map((t) => ({ id: t.id, name: t.name, shortName: t.shortName, introTitle: t.introTitle, introText: t.introText, questionIds: t.questions.map((q) => q.questionId) }))}
      />
    </div>
  );
}
