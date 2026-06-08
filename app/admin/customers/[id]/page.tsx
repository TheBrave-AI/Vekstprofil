import { getCustomer, activateSurvey } from "@/app/actions";
import { redirect } from "next/navigation";
import { DeleteCustomerButton } from "@/components/admin/DeleteCustomerButton";
import AdminButton from "@/components/ui/AdminButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import type { SurveyStatus } from "@/lib/constants";
import SectionHeader from "@/components/admin/SectionHeader";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await getCustomer(id);

  if (!customer) notFound();


  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/admin/customers" className="text-xs text-mist hover:text-accent transition">← Kunder</Link>
          <h1 className="font-display text-2xl text-cloud">{customer.companyName}</h1>
          <p className="text-sm text-mist">{customer.contactName}{customer.contactEmail && ` · ${customer.contactEmail}`}</p>
        </div>

        <AdminButton href={`/admin/surveys/new?customerId=${id}`}>+ Ny undersøkelse</AdminButton>
      </div>
      <SectionHeader label="Undersøkelser" count={customer.surveys.length} />
      {customer.surveys.length === 0 ? (
        <p className="text-sm text-mist">Ingen undersøkelser ennå.</p>
      ) : (
        <div className="overflow-hidden rounded-card bg-midnight shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wider">
                <th className="px-5 py-3">Mal</th>
                <th className="px-5 py-3">Opprettet</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Svar</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customer.surveys.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 text-mist">{s.template?.name ?? "—"}</td>
                  <td className="px-5 py-4 text-mist">{new Date(s.createdAt).toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={s.status as SurveyStatus} />
                  </td>
                  <td className="px-5 py-4 text-mist">{s._count.answers}</td>
                  <td className="px-5 py-4 text-right flex gap-3 justify-end">
                    {s.status === "draft" && (
                      <>
                        <Link href={`/admin/surveys/${s.id}/edit`} className="text-mist hover:text-cloud text-xs font-medium">Rediger</Link>
                        <form action={async () => { "use server"; await activateSurvey(s.id); redirect(`/admin/surveys/${s.id}`); }}>
                          <button type="submit" className="text-accent hover:underline text-xs font-medium">Aktiver →</button>
                        </form>
                      </>
                    )}
                    {s.status !== "draft" && (
                      <Link href={`/admin/surveys/${s.id}`} className="text-accent hover:underline text-xs font-medium">Se svar →</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Danger zone */}
      <div className="pt-4 border-t border-line">
        <DeleteCustomerButton
          customerId={customer.id}
          customerName={customer.companyName}
          surveyCount={customer.surveys.length}
        />
      </div>
    </div>
  );
}
