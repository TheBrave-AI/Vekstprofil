import BraveLogo from "./BraveLogo";

interface Props {
  label?: string;
}

export default function BrandBar({ label = "VEKSTPROFIL" }: Props) {
  return (
    <div className="flex items-center gap-2 pt-2 w-full">
      <BraveLogo className="h-8 text-brand" />
      <span className="ml-auto text-[12px] font-bold tracking-[0.14em] text-muted opacity-90">
        {label.toUpperCase()}
      </span>
    </div>
  );
}
