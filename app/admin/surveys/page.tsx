import { listSurveys } from "@/app/actions";
import Link from "next/link";

const STATUS = {
  submitted: { label: "Innsendt",  dot: "bg-accent",  badge: "bg-accent/10 text-accent" },
  active:    { label: "Aktiv",     dot: "bg-marker",   badge: "bg-marker/10 text-accent" },
  draft:     { label: "Utkast",    dot: "bg-steel",    badge: "bg-steel/40 text-muted"  },
} as const;

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

function relativeTime(d: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (seconds < 3600)      return `${Math.floor(seconds / 60)} min siden`;
  if (seconds < 86400)     return `${Math.floor(seconds / 3600)}t siden`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} d siden`;
  return fmt(d);
}

export default async function SurveysPage() {
  const surveys = await listSurveys();

  const submitted = surveys.filter((s) => s.status === "submitted");
  const active    = surveys.filter((s) => s.status === "active");
  const draft     = surveys.filter((s) => s.status === "draft");

  const stats = [
    { label: "Innsendt", value: submitted.length, color: "text-accent",  bar: "bg-accent"  },
    { label: "Aktive",   value: active.length,    color: "text-marker",  bar: "bg-marker"  },
    { label: "Utkast",   value: draft.length,     color: "text-muted",   bar: "bg-steel"   },
  ];

  const groups = [
    { key: "submitted", label: "Innsendt",  surveys: submitted },
    { key: "active",    label: "Aktive",    surveys: active    },
    { key: "draft",     label: "Utkast",    surveys: draft     },
  ].filter((g) => g.surveys.length > 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-1">Oversikt</p>
          <h1 className="font-display text-[28px] leading-none text-cloud">Surveys</h1>
        </div>
        <Link
          href="/admin/surveys/new"
          className="rounded-xl bg-brand px-4 py-2 text-[13px] font-medium text-onbrand hover:bg-brand-deep transition-colors"
        >
          + Ny survey
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
            {surveys.length > 0 && (
              <div className="mt-4 h-[3px] bg-steel/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.bar}`}
                  style={{ width: `${Math.round((s.value / surveys.length) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {surveys.length === 0 && (
        <div className="rounded-card bg-midnight shadow-card px-8 py-12 text-center">
          <p className="font-display text-lg text-cloud mb-1">Ingen surveys ennå</p>
          <p className="text-[13px] text-muted">Opprett en survey fra en kundes side.</p>
        </div>
      )}

      {/* Grouped list */}
      {groups.map((group) => {
        const st = STATUS[group.key as keyof typeof STATUS];
        return (
          <div key={group.key} className="space-y-2">

            {/* Section header */}
            <div className="flex items-center gap-2.5 px-1">
              <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                {group.label}
              </p>
              <span className="text-[11px] text-muted/60 font-medium">({group.surveys.length})</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            {/* Rows */}
            <div className="rounded-card bg-midnight shadow-card overflow-hidden">
              {group.surveys.map((s, i) => {
                const total     = s._count.answers + (s.status === "submitted" ? 0 : 0);
                const dateField = s.status === "submitted" ? s.submittedAt : s.status === "active" ? s.sentAt : s.createdAt;
                const isLast    = i === group.surveys.length - 1;

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.025] transition-colors ${!isLast ? "border-b border-line" : ""}`}
                  >
                    {/* Left: company + template */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/customers/${s.customer.id}`}
                        className="text-[14px] font-semibold text-cloud hover:text-accent transition-colors truncate block leading-snug"
                      >
                        {s.customer.companyName}
                      </Link>
                      <p className="text-[12px] text-muted mt-0.5 truncate">
                        {s.template?.name ?? "Ingen mal"}
                      </p>
                    </div>

                    {/* Answers count */}
                    <div className="text-center shrink-0 w-12">
                      <p className="text-[15px] font-semibold text-cloud tabular-nums">{s._count.answers}</p>
                      <p className="text-[10.5px] text-muted uppercase tracking-wide">svar</p>
                    </div>

                    {/* Date */}
                    <div className="text-right shrink-0 w-28">
                      {dateField && (
                        <>
                          <p className="text-[12.5px] font-medium text-cloud">{relativeTime(dateField)}</p>
                          <p className="text-[11px] text-muted mt-0.5">{fmt(dateField)}</p>
                        </>
                      )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0 w-20 text-right">
                      {s.status !== "draft" ? (
                        <Link
                          href={`/admin/surveys/${s.id}`}
                          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:text-accent/70 transition-colors"
                        >
                          Se svar
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 8L8 2M8 2H3M8 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/surveys/${s.id}/edit`}
                          className="text-[12.5px] font-medium text-muted hover:text-cloud transition-colors"
                        >
                          Rediger
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
