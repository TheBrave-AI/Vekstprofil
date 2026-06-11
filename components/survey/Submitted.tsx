import BrandBar from "../ui/brand/BrandBar";
import Button from "../ui/primitives/Button";

interface Props {
  onReset: () => void;
  companyName?: string;
}

export default function Submitted({ onReset, companyName }: Props) {
  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
      <BrandBar label={companyName} />

      <h1
        className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em] mt-10 text-center"
        style={{ fontSize: "clamp(22px, 3.6vw, 32px)" }}
      >
        Takk!<br />Kartleggingen er sendt.
      </h1>

      {/* Teal circle badge with checkmark */}
      <div className="w-[52px] h-[52px] bg-accent rounded-full flex items-center justify-center mt-16 mx-auto mb-6">
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
    </div>
  );
}
