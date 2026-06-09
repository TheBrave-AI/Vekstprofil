import { listCustomers, listTemplates } from "@/app/actions";
import { NewSurveyForm } from "@/components/admin/surveys/NewSurveyForm";
import Link from "next/link";

export default async function NewSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;

  const [allCustomers, templates] = await Promise.all([
    listCustomers(),
    listTemplates(),
  ]);
  const customers = allCustomers
    .map(c => ({ id: c.id, companyName: c.companyName }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-xs text-mist hover:text-accent transition">← Kunder</Link>
        <h1 className="font-display text-2xl text-cloud mt-1">Ny undersøkelse</h1>
        <p className="text-sm text-mist mt-1">
          Undersøkelsen opprettes som utkast — du kan redigere spørsmål før du aktiverer lenken.
        </p>
      </div>

      <NewSurveyForm
        customers={customers}
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        preselectedCustomerId={customerId}
      />
    </div>
  );
}
