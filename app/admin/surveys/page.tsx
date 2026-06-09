import { listSurveys } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import SectionHeader from "@/components/admin/SectionHeader";
import EmptyState from "@/components/admin/EmptyState";
import { SURVEY_STATUS, type SurveyStatus } from "@/lib/constants";

function fmt(d: Date | string) {
  const date = new Date(d);
  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) return date.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SurveysPage() {
  const surveys = await listSurveys();

  const submitted = surveys.filter((s) => s.status === "submitted");
  const active    = surveys.filter((s) => s.status === "active");
  const draft     = surveys.filter((s) => s.status === "draft");

  const groups = [
    { key: "submitted", label: "Besvarte",   surveys: submitted },
    { key: "active",    label: "Ubesvarte", surveys: active    },
    { key: "draft",     label: "Utkast",    surveys: draft     },
  ].filter((g) => g.surveys.length > 0);

  return (
    <div className="space-y-8">

      <PageHeader title="Undersøkelser" href="/admin/surveys/new" cta="+ Ny undersøkelse" />

      {/* Empty state */}
      {surveys.length === 0 && (
        <EmptyState title="Ingen undersøkelser ennå">Trykk "Ny undersøkelse" for å opprette en</EmptyState>
      )}

      {/* Grouped list */}
      {groups.map((group) => {
        const st = SURVEY_STATUS[group.key as SurveyStatus];
        return (
          <div key={group.key} className="space-y-2">

            <SectionHeader label={group.label} count={group.surveys.length} dotColor={st.dot} />

            {/* Rows */}
            <div className="rounded-card bg-midnight shadow-card overflow-hidden">
              {group.surveys.map((s, i) => {
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
                        href={`/admin/surveys/${group.key === "draft" ? `${s.id}/edit` : s.id}`}
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
                      <p className="text-[15px] font-semibold text-cloud tabular-nums">
                        {s.status === "active"
                          ? <>{s._count.answers}<span className="text-[12px] font-normal text-muted">/{s._count.questions}</span></>
                          : s._count.answers}
                      </p>
                      <p className="text-[10.5px] text-muted uppercase tracking-wide">svar</p>
                    </div>

                    {/* Date */}
                    <div className="text-right shrink-0 w-28">
                      {dateField && (
                        <p className="text-[12.5px] font-medium text-cloud">{fmt(dateField)}</p>
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
