import BraveLogo from "./BraveLogo";

export default function BrandBar() {
  return (
    <div className="flex items-center gap-2 pt-2 w-full">
      <BraveLogo className="h-8 text-brand" />
      <span className="ml-auto text-[12px] font-bold tracking-[0.14em] text-muted opacity-90">VEKSTPROFIL</span>
    </div>
  );
}
    