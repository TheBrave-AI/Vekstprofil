import { listSurveys } from "@/app/actions";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import SectionHeader from "@/components/layout/SectionHeader";
import EmptyState from "@/components/layout/EmptyState";
import { SURVEY_STATUS, type SurveyStatus } from "@/lib/constants";
import { fullDate, timeOnly } from "@/lib/formatTime";

export default async function SurveysPage() {
  const surveys = await listSurveys();

  const groups = [
    { key: "submitted" as SurveyStatus, label: "Besvarte",  surveys: surveys.filter((s) => s.status === "submitted") },
    { key: "active"    as SurveyStatus, label: "Ubesvarte", surveys: surveys.filter((s) => s.status === "active")    },
    { key: "draft"     as SurveyStatus, label: "Utkast",    surveys: surveys.filter((s) => s.status === "draft")     },
  ].filter((g) => g.surveys.length > 0);

  return (
    <div className="space-y-8">

      <PageHeader title="Undersøkelser" href="/admin/surveys/new" cta="+ Ny undersøkelse" />

      {surveys.length === 0 && (
        <EmptyState title="Ingen undersøkelser ennå">Trykk "Ny undersøkelse" for å opprette en</EmptyState>
      )}

      {groups.map((group) => {
        const st = SURVEY_STATUS[group.key];
        const lastIndex = group.surveys.length - 1;

        return (
          <div key={group.key} className="space-y-2">
            <SectionHeader label={group.label} count={group.surveys.length} dotColor={st.dot} />

            <div className="rounded-card bg-midnight shadow-card overflow-hidden">
              {group.surveys.map((survey, i) => {
                const isDraft  = survey.status === "draft";
                const dateField = survey.status === "submitted" ? (survey.submittedAt ?? survey.createdAt)
                  : survey.status === "active" ? (survey.sentAt ?? survey.createdAt)
                  : survey.createdAt;

                return (
                  <div
                    key={survey.id}
                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.025] transition-colors ${i < lastIndex ? "border-b border-line" : ""}`}
                  >
                    {/* Left: company + template */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={isDraft ? `/admin/surveys/${survey.id}/edit` : `/admin/surveys/${survey.id}`}
                        className="text-[14px] font-semibold text-cloud hover:text-accent transition-colors truncate block leading-snug"
                      >
                        {survey.customer.companyName}
                      </Link>
                      <p className="flex items-center gap-1 text-[12px] text-muted mt-0.5 truncate">
                        <svg width="9" height="11" viewBox="0 0 10 12" fill="none" className="shrink-0 opacity-50">
                          <path d="M1.5 0.5H6.5L9.5 3.5V11C9.5 11.3 9.3 11.5 9 11.5H1.5C1.2 11.5 1 11.3 1 11V1C1 0.7 1.2 0.5 1.5 0.5Z" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M6.5 0.5V3.5H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                          <path d="M3 5.5H7M3 7.5H7M3 9.5H5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        </svg>
                        {survey.template?.name ?? "Ingen mal"}
                      </p>
                    </div>

                    {/* Answers count */}
                    <div className="text-center shrink-0 w-12">
                      <p className="text-[12.5px] text-muted tabular-nums">
                        {survey.status !== "draft"
                          ? <>{survey._count.answers}/{survey._count.questions}</>
                          : survey._count.answers}
                      </p>
                      <p className="text-[11px] text-muted uppercase tracking-wide">svar</p>
                    </div>

                    {/* Date */}
                    <div className="text-right shrink-0 w-28">
                      <p className="text-[12.5px] text-muted">{timeOnly(dateField)}</p>
                      <p className="text-[11px] text-muted mt-0.5">{fullDate(dateField)}</p>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 w-20 text-right">
                      {isDraft ? (
                        <Link
                          href={`/admin/surveys/${survey.id}/edit`}
                          className="text-[12.5px] font-medium text-muted hover:text-cloud transition-colors"
                        >
                          Rediger
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/surveys/${survey.id}`}
                          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:text-accent/70 transition-colors"
                        >
                          Se svar
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 8L8 2M8 2H3M8 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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
