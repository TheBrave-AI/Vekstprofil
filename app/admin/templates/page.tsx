import { listTemplates } from "@/app/actions";
import Link from "next/link";

export default async function TemplatesPage() {
  const templates = await listTemplates();

  const totalQuestions = templates.reduce((sum, t) => sum + t._count.questions, 0);

  const stats = [
    { label: "Maler",      value: templates.length, color: "text-cloud",  bar: "bg-cloud/40" },
    { label: "Spørsmål",   value: totalQuestions,   color: "text-accent", bar: "bg-accent"   },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-1">Oversikt</p>
          <h1 className="font-display text-[28px] leading-none text-cloud">Maler</h1>
        </div>
        <Link
          href="/admin/templates/new"
          className="rounded-xl bg-brand px-4 py-2 text-[13px] font-medium text-onbrand hover:bg-brand-deep transition-colors"
        >
          + Ny mal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card bg-midnight shadow-card px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-[32px] font-display leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[12.5px] text-muted mt-1.5">{s.label}</p>
              </div>
              <span className={`w-2 h-2 rounded-full mt-1.5 ${s.bar}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="rounded-card bg-midnight shadow-card px-8 py-12 text-center">
          <p className="font-display text-lg text-cloud mb-1">Ingen maler ennå</p>
          <p className="text-[13px] text-muted">
            Kjør <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">npx prisma db seed</code> for å legge til standardmaler.
          </p>
        </div>
      )}

      {/* List */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Alle maler</p>
            <span className="text-[11px] text-muted/60 font-medium">({templates.length})</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <div className="rounded-card bg-midnight shadow-card overflow-hidden">
            {templates.map((t, i) => {
              const isLast = i === templates.length - 1;
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.025] transition-colors ${!isLast ? "border-b border-line" : ""}`}
                >
                  {/* Left: name + description */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-cloud truncate leading-snug">{t.name}</p>
                    {t.description && (
                      <p className="text-[12px] text-muted mt-0.5 truncate">{t.description}</p>
                    )}
                  </div>

                  {/* Question count */}
                  <div className="text-center shrink-0 w-16">
                    <p className="text-[15px] font-semibold text-cloud tabular-nums">{t._count.questions}</p>
                    <p className="text-[10.5px] text-muted uppercase tracking-wide">spørsmål</p>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 w-20 text-right">
                    <Link
                      href={`/admin/templates/${t.id}/edit`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:text-accent/70 transition-colors"
                    >
                      Rediger
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
