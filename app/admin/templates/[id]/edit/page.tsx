import { db } from "@/lib/db";
import { EditTemplateClient } from "./EditTemplateClient";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const template = await db.template.findUnique({
    where:   { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: { select: { id: true, label: true, category: true } } },
      },
    },
  });

  if (!template) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/templates" className="text-xs text-mist hover:text-accent transition">← Maler</Link>
        <h1 className="font-display text-2xl text-cloud mt-1">Rediger mal</h1>
      </div>

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
      />
    </div>
  );
}
