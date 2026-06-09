interface Props {
  label: string;
  className?: string;
}

export default function Eyebrow({ label, className = "mt-8 mb-5" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="w-[22px] h-[2px] bg-marker shrink-0" />
      <span className="text-accent text-[12.5px] font-bold uppercase tracking-[0.14em]">
        {label}
      </span>
    </div>
  );
}
