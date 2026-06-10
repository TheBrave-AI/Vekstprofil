import FormField from "@/components/form/FormField";

interface Props {
  shortName:  string;
  name:       string;
  introTitle: string;
  introText:  string;
  onChange: (field: "shortName" | "name" | "introTitle" | "introText", value: string) => void;
}

const visible = <span className="text-coral font-normal ml-1">(synlig for kunde)</span>;

export function IntroFormFields({ shortName, name, introTitle, introText, onChange }: Props) {
  return (
    <>
      <FormField label={<>Navn {visible}</>}               value={name}       onChange={(e) => onChange("name",       e.target.value)} placeholder="F.eks. Nullpunkt" />
      <FormField label="Kort navn (intern)"                value={shortName}  onChange={(e) => onChange("shortName",  e.target.value)} placeholder="F.eks. START" />
      <FormField label={<>Intro-tittel {visible}</>}       value={introTitle} onChange={(e) => onChange("introTitle", e.target.value)} placeholder="F.eks. La oss kartlegge der dere står i dag." />
      <FormField label={<>Intro-tekst {visible}</>}        value={introText}  onChange={(e) => onChange("introText",  e.target.value)} placeholder="Valgfri brødtekst på intro-kortet" />
    </>
  );
}
