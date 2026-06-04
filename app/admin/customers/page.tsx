import { listCustomers } from "@/app/actions";
import Link from "next/link";

export default async function CustomersPage() {
  const customers = await listCustomers();

  const total     = customers.length;
  const submitted = customers.filter((c) => c.surveys.some((s) => s.status === "submitted")).length;
  const active    = customers.filter((c) => c.surveys.some((s) => s.status === "active")).length;

  const stats = [
    { label: "Totalt",       value: total,     color: "text-cloud",  bar: "bg-cloud/40" },
    { label: "Med innsendt", value: submitted,  color: "text-accent", bar: "bg-accent"   },
    { label: "Med aktiv",    value: active,     color: "text-marker", bar: "bg-marker"   },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-1">Oversikt</p>
          <h1 className="font-display text-[28px] leading-none text-cloud">Kunder</h1>
        </div>
        <Link
          href="/admin/customers/new"
          className="rounded-xl bg-brand px-4 py-2 text-[13px] font-medium text-onbrand hover:bg-brand-deep transition-colors"
        >
          + Ny kunde
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card bg-midnight shadow-card px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-[32px] font-display leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[12.5px] text-muted mt-1.5">{s.label}</p>
              </div>
              <span className={`w-2 h-2 rounded-full mt-1.5 ${s.bar}`} />
            </div>
            {total > 0 && (
              <div className="mt-4 h-[3px] bg-steel/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.bar}`}
                  style={{ width: `${Math.round((s.value / total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {customers.length === 0 && (
        <div className="rounded-card bg-midnight shadow-card px-8 py-12 text-center">
          <p className="font-display text-lg text-cloud mb-1">Ingen kunder ennå</p>
          <p className="text-[13px] text-muted">Opprett en kunde for å komme i gang.</p>
        </div>
      )}

      {/* List */}
      {customers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Alle kunder</p>
            <span className="text-[11px] text-muted/60 font-medium">({customers.length})</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <div className="rounded-card bg-midnight shadow-card overflow-hidden">
            {customers.map((c, i) => {
              const latest = c.surveys[0];
              const isLast = i === customers.length - 1;

              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.025] transition-colors ${!isLast ? "border-b border-line" : ""}`}
                >
                  {/* Left: company + contact */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-cloud truncate leading-snug">
                      {c.companyName}
                    </p>
                    <p className="text-[12px] text-muted mt-0.5 truncate">{c.contactName}</p>
                  </div>

                  {/* Survey count */}
                  <div className="text-center shrink-0 w-12">
                    <p className="text-[15px] font-semibold text-cloud tabular-nums">{c.surveys.length}</p>
                    <p className="text-[10.5px] text-muted uppercase tracking-wide">surveys</p>
                  </div>

                  {/* Status */}
                  <div className="shrink-0 w-28 text-right">
                    {latest ? (
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        latest.status === "submitted"
                          ? "bg-accent/10 text-accent"
                          : latest.status === "active"
                          ? "bg-marker/10 text-marker"
                          : "bg-steel/40 text-muted"
                      }`}>
                        {latest.status === "submitted" ? "Innsendt" : latest.status === "active" ? "Aktiv" : "Utkast"}
                      </span>
                    ) : (
                      <span className="text-[12px] text-muted">—</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0 w-20 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:text-accent/70 transition-colors"
                    >
                      Se kunde
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 8L8 2M8 2H3M8 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
