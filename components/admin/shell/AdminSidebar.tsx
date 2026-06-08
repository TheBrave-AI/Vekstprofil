import Link from "next/link";
import ActivityFeed from "../ActivityFeed";
import { relativeTime } from "@/lib/formatTime";
import { SURVEY_STATUS } from "@/lib/constants";

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

export default function AdminSidebar({ active, submitted, draftCount, onCollapse }: Props) {
  return (
    <aside
      className="w-[222px] shrink-0 sticky top-5 bg-midnight rounded-card shadow-card overflow-hidden"
      style={{ height: "calc(100vh - 5.5rem)" }}
    >
      <div className="overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-10 px-3 border-b border-line">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Undersøkelser</span>
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

        <Section label="Ubesvarte" count={active.length}>
          {active.length > 0
            ? active.map((s, i) => <SurveyRow key={s.id} survey={s} isLast={i === active.length - 1} />)
            : <EmptyRow text="Ingen ubesvarte" />
          }
        </Section>

        <Section label="Besvarte" count={submitted.length} bordered>
          {submitted.length > 0
            ? submitted.map((s, i) => <SurveyRow key={s.id} survey={s} isLast={i === submitted.length - 1} />)
            : <EmptyRow text="Ingen besvarte" />
          }
        </Section>
      </div>
    </aside>
  );
}

function Section({ label, count, bordered = false, children }: {
  label: string;
  count: number;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={bordered ? "border-t border-line" : ""}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
        <span className="text-[11px] font-semibold tabular-nums text-muted/70">{count}</span>
      </div>
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

function SurveyRow({ survey, isLast }: { survey: SurveyItem; isLast: boolean }) {
  const showProgress = survey.status === "active"
    && survey.answeredCount !== undefined
    && survey.totalQuestions !== undefined;

  return (
    <Link
      href={`/admin/surveys/${survey.id}`}
      className={`flex items-start gap-2.5 px-4 py-2.5 hover:bg-black/[0.04] transition-colors group ${!isLast ? "border-b border-line" : ""}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 mt-[5px] ${SURVEY_STATUS[survey.status].dot}`} />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-cloud truncate leading-snug group-hover:text-accent transition-colors">
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
