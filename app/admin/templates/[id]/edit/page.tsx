import { listQuestions, getTemplate } from "@/app/actions";
import { EditTemplateClient } from "@/components/admin/EditTemplateClient";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [template, allQuestions] = await Promise.all([
    getTemplate(id),
    listQuestions(),
  ]);

  if (!template) notFound();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href="/admin/templates" className="text-xs text-mist hover:text-accent transition">← Maler</Link>

      <EditTemplateClient
        templateId={template.id}
        initialName={template.name}
        initialDescription={template.description}
        initialActive={template.active}
        initialQuestions={template.questions.map((tq) => ({
          id:         tq.id,
          questionId: tq.questionId,
          label:      tq.question.label,
          category:   tq.question.category,
          order:      tq.order,
        }))}
        allQuestions={allQuestions.map((q) => ({
          id:       q.id,
          label:    q.label,
          category: q.category,
        }))}
      />
    </div>
  );
}
