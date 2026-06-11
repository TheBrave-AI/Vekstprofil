import FormField from "@/components/form/FormField";

interface Props {
  shortName:  string;
  name:       string;
  introTitle: string;
  introText:  string;
  onChange: (field: "shortName" | "name" | "introTitle" | "introText", value: string) => void;
}

const hint = <span className="text-coral font-normal">(synlig for kunde)</span>;

export function IntroFormFields({ shortName, name, introTitle, introText, onChange }: Props) {
  return (
    <>
      <FormField label="Navn"        hint={hint} value={name}       onChange={(e) => onChange("name",       e.target.value)} placeholder="F.eks. Nullpunkt" />
      <FormField label="Kort navn (intern)"       value={shortName}  onChange={(e) => onChange("shortName",  e.target.value)} placeholder="F.eks. START" />
      <FormField label="Intro-tittel" hint={hint} value={introTitle} onChange={(e) => onChange("introTitle", e.target.value)} placeholder="F.eks. La oss kartlegge der dere står i dag." />
      <FormField label="Intro-tekst"  hint={hint} value={introText}  onChange={(e) => onChange("introText",  e.target.value)} placeholder="Valgfri brødtekst på intro-kortet" />
    </>
  );
}
