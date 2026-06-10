import { listCustomers, listTemplatesWithQuestions, listQuestions } from "@/app/actions";
import { NewSurveyForm } from "@/components/admin/surveys/NewSurveyForm";
import Link from "next/link";

export default async function NewSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;

  const [allCustomers, templates, allQuestions] = await Promise.all([
    listCustomers(),
    listTemplatesWithQuestions(),
    listQuestions(),
  ]);
  const customers = allCustomers
    .map(c => ({ id: c.id, companyName: c.companyName }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link href="/admin" className="text-xs text-mist hover:text-accent transition">← Kunder</Link>
        <h1 className="font-display text-2xl text-cloud mt-1">Ny undersøkelse</h1>
      </div>

      <NewSurveyForm
        customers={customers}
        templates={templates.map((t) => ({
          id: t.id, name: t.name, shortName: t.shortName,
          introTitle: t.introTitle, introText: t.introText,
          questionIds: t.questions.map((q) => q.questionId),
        }))}
        questions={allQuestions.map((q) => ({ id: q.id, label: q.label, category: q.category }))}
        preselectedCustomerId={customerId}
      />
    </div>
  );
}
