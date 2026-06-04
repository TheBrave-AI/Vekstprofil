import { listCustomers } from "@/app/actions";
import Link from "next/link";

export default async function CustomersPage() {
  const customers = await listCustomers();

  const total     = customers.length;
  const submitted = customers.filter((c) => c.surveys.some((s) => s.status === "submitted")).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cloud">Kunder</h1>
        <Link
          href="/admin/customers/new"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-onbrand hover:bg-brand-deep transition"
        >
          + Ny kunde
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Totalt kunder", value: total },
          { label: "Med innsendt svar", value: submitted },
        ].map((s) => (
          <div key={s.label} className="rounded-card bg-midnight px-6 py-5 shadow-card">
            <p className="text-3xl font-display text-cloud">{s.value}</p>
            <p className="text-sm text-mist mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {customers.length === 0 ? (
        <p className="text-mist text-sm">Ingen kunder ennå.</p>
      ) : (
        <div className="overflow-hidden rounded-card bg-midnight shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wider">
                <th className="px-5 py-3">Bedrift</th>
                <th className="px-5 py-3">Kontakt</th>
                <th className="px-5 py-3">Surveys</th>
                <th className="px-5 py-3">Siste status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const latest = c.surveys[0];
                return (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4 font-medium text-cloud">{c.companyName}</td>
                    <td className="px-5 py-4 text-mist">{c.contactName}</td>
                    <td className="px-5 py-4 text-mist">{c.surveys.length}</td>
                    <td className="px-5 py-4">
                      {latest ? (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          latest.status === "submitted" ? "bg-accent/10 text-accent" : "bg-steel/40 text-mist"
                        }`}>
                          {latest.status === "submitted" ? "Innsendt" : "Avventer"}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/customers/${c.id}`} className="text-accent hover:underline text-xs font-medium">
                        Se kunde →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
