import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { listTemplates, createSurvey, activateSurvey } from "@/app/actions";
import { DeleteCustomerButton } from "@/components/admin/DeleteCustomerButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [customer, templates] = await Promise.all([
    db.customer.findUnique({
      where:   { id },
      include: {
        surveys: {
          orderBy: { createdAt: "desc" },
          include: { template: { select: { name: true } }, _count: { select: { answers: true } } },
        },
      },
    }),
    listTemplates(),
  ]);

  if (!customer) notFound();

  const statusLabel: Record<string, string> = {
    draft:     "Utkast",
    active:    "Aktiv",
    submitted: "Innsendt",
  };
  const statusStyle: Record<string, string> = {
    draft:     "bg-steel/40 text-mist",
    active:    "bg-accent/10 text-accent",
    submitted: "bg-brand/10 text-brand",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/admin/customers" className="text-xs text-mist hover:text-accent transition">← Kunder</Link>
          <h1 className="font-display text-2xl text-cloud">{customer.companyName}</h1>
          <p className="text-sm text-mist">{customer.contactName}{customer.contactEmail && ` · ${customer.contactEmail}`}</p>
        </div>

        {templates.length > 0 && (
          <form action={async (fd: FormData) => {
            "use server";
            const tid = fd.get("templateId") as string;
            await createSurvey(id, tid || undefined);
            redirect(`/admin/customers/${id}`);
          }}>
            <div className="flex gap-2">
              <select name="templateId" className="rounded-xl border border-line bg-navy px-3 py-2 text-sm text-cloud focus:border-accent focus:outline-none">
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button type="submit" className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-onbrand hover:bg-brand-deep transition">
                + Ny survey
              </button>
            </div>
          </form>
        )}
      </div>

      {customer.surveys.length === 0 ? (
        <p className="text-sm text-mist">Ingen surveys ennå.</p>
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
                  <td className="px-5 py-4 text-mist">{s.createdAt.toLocaleDateString("nb-NO")}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[s.status]}`}>
                      {statusLabel[s.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-mist">{s._count.answers}</td>
                  <td className="px-5 py-4 text-right flex gap-3 justify-end">
                    {s.status === "draft" && (
                      <>
                        <Link href={`/admin/surveys/${s.id}/edit`} className="text-mist hover:text-cloud text-xs font-medium">Rediger</Link>
                        <form action={async () => { "use server"; await activateSurvey(s.id); redirect("/admin"); }}>
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
