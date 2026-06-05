import { listTemplates } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import SectionHeader from "@/components/admin/SectionHeader";
import EmptyState from "@/components/admin/EmptyState";

export default async function TemplatesPage() {
  const templates = await listTemplates();

  return (
    <div className="space-y-8">

      <PageHeader title="Maler" href="/admin/templates/new" cta="+ Ny mal" />

      {/* Empty state */}
      {templates.length === 0 && (
        <EmptyState title="Ingen maler ennå">
          Kjør <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">npx prisma db seed</code> for å legge til standardmaler.
        </EmptyState>
      )}

      {/* List */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <SectionHeader label="Alle maler" count={templates.length} />

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
