import { SURVEY_STATUS, type SurveyStatus } from "@/lib/constants";

interface Props {
  status: SurveyStatus;
}

export default function StatusBadge({ status }: Props) {
  const { label, badge } = SURVEY_STATUS[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge}`}>
      {label}
    </span>
  );
}
