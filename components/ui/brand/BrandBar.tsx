import BraveLogo from "./BraveLogo";

interface Props {
  label?: string;
  logoUrl?: string | null;
  showLogoLabel?: boolean;
}

export default function BrandBar({ label = "VEKSTPROFIL", logoUrl, showLogoLabel = false }: Props) {
  const showLabel = !logoUrl || showLogoLabel;

  return (
    <div className="flex items-start gap-2 py-3 mb-1 w-full">
      <BraveLogo className="h-7 w-auto text-brand" />
      <div className="ml-auto flex flex-col items-center gap-2">
        {logoUrl && (
          <img src={logoUrl} alt={label} className="h-7 w-auto object-contain" />
        )}
        {showLabel && (
          <span
            className={`font-bold tracking-[0.14em] text-muted opacity-90 ${
              logoUrl ? "text-[14px]" : "text-[16px]"
            }`}
          >
            {label.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
