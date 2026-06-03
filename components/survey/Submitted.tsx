import BrandBar from "../ui/BrandBar";
import GhostButton from "../ui/GhostButton";

interface Props {
  onReset: () => void;
}

export default function Submitted({ onReset }: Props) {
  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
      <BrandBar />

      {/* Teal circle badge with checkmark */}
      <div className="w-[52px] h-[52px] bg-accent rounded-full flex items-center justify-center mt-10 mb-8">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M4 11l5 5 9-9"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1
        className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em]"
        style={{ fontSize: "clamp(28px, 4.6vw, 42px)" }}
      >
        Takk! Kartleggingen er sendt.
      </h1>

      <p className="text-mist text-[18.5px] leading-[1.55] max-w-[48ch] mt-5">
        Vi tar en gjennomgang av svarene og følger opp. Disse tallene blir
        nullpunktet vi måler fremtidig vekst mot — slik at vi sammen kan se
        nøyaktig hva Brave har bidratt med.
      </p>

      <div className="mt-8">
        <GhostButton label="Start på nytt" onClick={onReset} />
      </div>
    </div>
  );
}
