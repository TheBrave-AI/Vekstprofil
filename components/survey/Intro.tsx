import BrandBar from "../ui/BrandBar";
import PrimaryButton from "../ui/PrimaryButton";
import Eyebrow from "../ui/Eyebrow";

interface Props {
  onStart: () => void;
  questionCount?: number;
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

 

export default function Intro({ onStart, questionCount }: Props) {
  return (
    <div className="w-full max-w-[720px] bg-midnight rounded-card shadow-card p-[clamp(28px,4.4vw,52px)] m-10">
      <BrandBar />

      <Eyebrow label="Nullpunkt" />

      {/* Headline */}
      <h1
        className="font-display font-medium text-cloud leading-[1.1] tracking-[-0.015em] [text-wrap:pretty]"
        style={{ fontSize: "clamp(34px, 5.2vw, 56px)" }}
      >
        La oss kartlegge der dere står i dag.
      </h1>

      {/* Body */}
      <p className="text-mist text-[18.5px] leading-[1.55] max-w-[52ch] mt-5">
        Vi stiller {questionCount} korte spørsmål om salg og marked. Svarene danner et
        utgangspunkt vi kommer tilbake til senere — slik at vi sammen kan se
        nøyaktig hvor mye dere har vokst. Har dere ikke tallet? Hopp videre, og evt. kom tilbake til det senere.
      </p>

      {/* Meta-rad */}
      <div className="flex gap-8 border-t border-line mt-7 pt-7">
        <MetaItem value={String(questionCount)} label="spørsmål" />
        <MetaItem value={`~${String(Math.round(questionCount ? questionCount * 0.4 : 5))}`} label="minutter" />
        <MetaItem value="0" label="krav om tall" />
      </div>

      {/* CTA */}
      <div className="mt-7">
        <PrimaryButton label="Sett i gang" onClick={onStart} />
      </div>
    </div>
  );
}
