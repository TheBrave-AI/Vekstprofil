interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full max-w-[720px] mx-auto py-6">
      {/* Number row */}
      <div className="flex justify-between text-[13px] font-medium mb-2">
        <span className="text-muted">SPØRSMÅL {current + 1} AV {total}</span>
        <span className="text-accent tabular-nums">{percentage.toFixed(0)}%</span>
      </div>

      {/* Track */}
      <div className="h-[3px] bg-steel rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
