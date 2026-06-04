import Link from "next/link";
import ActivityFeed from "./ActivityFeed";

export interface SurveyItem {
  id: string;
  companyName: string;
  status: "active" | "submitted";
  date: string;
  answeredCount?: number;
  totalQuestions?: number;
}

interface Props {
  active: SurveyItem[];
  submitted: SurveyItem[];
  draftCount: number;
  onCollapse: () => void;
}

function relativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 3600)      return `${Math.floor(seconds / 60)} min siden`;
  if (seconds < 86400)     return `${Math.floor(seconds / 3600)}t siden`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} d siden`;
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default function AdminSidebar({ active, submitted, draftCount, onCollapse }: Props) {
  return (
    <aside
      className="w-[210px] shrink-0 sticky top-5 bg-midnight rounded-card shadow-card flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 5.5rem)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-10 px-3 border-b border-line shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Surveys</span>
        <button
          type="button"
          onClick={onCollapse}
          className="flex items-center justify-center w-6 h-6 rounded-md text-muted hover:text-cloud hover:bg-black/[0.06] transition-colors"
          title="Skjul sidebar"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
        <Section label="Aktive">
          {active.length > 0
            ? active.map(s => <SurveyRow key={s.id} survey={s} />)
            : <EmptyRow text="Ingen aktive" />
          }
        </Section>

        <Section label="Mottatt" bordered>
          {submitted.length > 0
            ? submitted.map(s => <SurveyRow key={s.id} survey={s} />)
            : <EmptyRow text="Ingen mottatte" />
          }
        </Section>

        
        {/* <ActivityFeed /> Removed for now */}
        
        {/* Status-oppsummering */}
        <div className="mt-auto p-4 border-t border-line shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-3">Totalt</p>
          <div className="flex flex-col gap-2">
            <StatusRow label="Aktive"  count={active.length}    color="bg-accent" />
            <StatusRow label="Mottatt" count={submitted.length} color="bg-marker" />
            <StatusRow label="Utkast"  count={draftCount}       color="bg-steel"  />
          </div>
        </div>

        
      </div>
    </aside>
  );
}

function Section({ label, bordered = false, children }: {
  label: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={bordered ? "border-t border-line" : ""}>
      <p className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="flex flex-col pb-2">{children}</div>
    </div>
  );
}

function StatusRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
        <span className="text-[13px] text-mist">{label}</span>
      </div>
      <span className="text-[13px] font-medium text-cloud tabular-nums">{count}</span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-4 py-2 pb-3 text-[12.5px] text-muted italic">{text}</p>;
}

function SurveyRow({ survey }: { survey: SurveyItem }) {
  const showProgress = survey.status === "active"
    && survey.answeredCount !== undefined
    && survey.totalQuestions !== undefined;

  return (
    <Link
      href={`/admin/surveys/${survey.id}`}
      className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-black/[0.04] transition-colors group"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 mt-[5px] ${survey.status === "active" ? "bg-accent" : "bg-marker"}`} />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-cloud truncate leading-snug group-hover:text-brand transition-colors">
          {survey.companyName}
        </p>
        <p className="text-[11.5px] text-muted mt-0.5">
          {relativeTime(survey.date)}
          {showProgress && (
            <span className="ml-1.5 text-muted">
              · {survey.answeredCount}/{survey.totalQuestions}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
