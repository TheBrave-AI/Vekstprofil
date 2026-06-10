import type { ReactNode } from "react";

interface Props {
  category?: string | null;
  label: string;
  right?: ReactNode;
  sub?: ReactNode;
  onClick?: () => void;
  columns?: string;
  className?: string;
}

export default function QuestionRow({
  category,
  label,
  right,
  sub,
  onClick,
  columns = "1fr",
  className = "",
}: Props) {
  const base = `grid gap-5 py-[18px] border-b border-line ${className}`;

  const inner = (
    <>
      <div className="flex flex-col gap-1 min-w-0">
        {category && (
          <span className="text-muted text-[11px] font-bold uppercase tracking-[0.12em]">
            {category}
          </span>
        )}
        <span className="text-cloud text-[16px] font-semibold leading-snug">{label}</span>
        {sub && <div className="mt-1.5">{sub}</div>}
      </div>
      {right !== undefined && (
        <div className="flex items-center justify-end pl-4 shrink-0">{right}</div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left transition-colors hover:bg-black/[0.03] rounded-sm ${base}`}
        style={{ gridTemplateColumns: columns }}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={base} style={{ gridTemplateColumns: columns }}>
      {inner}
    </div>
  );
}
