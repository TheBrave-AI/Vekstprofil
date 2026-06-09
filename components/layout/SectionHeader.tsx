interface Props {
  label: string;
  count: number;
  dotColor?: string;
}

export default function SectionHeader({ label, count, dotColor }: Props) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      {dotColor && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />}
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <span className="text-[11px] text-muted/60 font-medium">({count})</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}
