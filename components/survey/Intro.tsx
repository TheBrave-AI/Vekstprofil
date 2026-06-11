import BrandBar from "../ui/brand/BrandBar";
import Button from "../ui/primitives/Button";
import Arrow from "../ui/primitives/Arrow";
import Eyebrow from "../ui/primitives/Eyebrow";

interface Props {
  onStart: () => void;
  questionCount?: number;
  companyName?: string;
  name?: string | null;
  introTitle?: string | null;
  introText?: string | null;
}

function MetaItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display font-medium text-brand text-[28px] leading-none tabular-nums">
        {value}
      </span>
      <span className="text-muted text-[13.5px] font-medium">{label}</span>
    </div>
  );
}

const DEFAULT_TITLE = "La oss kartlegge der dere står i dag.";
const DEFAULT_TEXT  = "Vi stiller korte spørsmål om salg og marked. Svarene danner et utgangspunkt vi kommer tilbake til senere — slik at vi sammen kan se nøyaktig hvor mye dere har vokst. Har dere ikke tallet? Hopp videre, og evt. kom tilbake til det senere.";

export default function Intro({ onStart, questionCount, companyName, name, introTitle, introText }: Props) {
  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(20px,4.4vw,52px)] my-6 sm:my-10">
      <BrandBar label={companyName} />

      {name && <Eyebrow label={name} />}

      {/* Headline */}
      <h1
        className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em] [text-wrap:pretty]"
        style={{ fontSize: "clamp(34px, 5.2vw, 56px)" }}
      >
        {introTitle ?? DEFAULT_TITLE}
      </h1>

      {/* Body */}
      <p className="text-mist text-[16px] sm:text-[18.5px] leading-[1.55] max-w-[52ch] mt-5">
        {introText ?? DEFAULT_TEXT}
      </p>

      {/* Meta-rad */}
      <div className="flex items-center gap-8 border-t border-line mt-7 pt-7">
        <MetaItem value={String(questionCount ?? 0)} label="spørsmål" />
        <MetaItem value={`~${String(Math.ceil(questionCount ? questionCount * 0.3 : 5))}`} label="minutter" />
        <Button size="lg" onClick={onStart} className="flex-1 justify-center md:flex-none md:w-2/3 md:ml-auto">Sett i gang <Arrow /></Button>
      </div>

    </div>
  );
}
