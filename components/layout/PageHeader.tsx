import Button from "@/components/ui/primitives/Button";

interface Props {
  title: string;
  href?: string;
  cta?: string;
  label?: string;
}

export default function PageHeader({ title, href, cta}: Props) {
  return (
    <div className="flex items-end justify-between">
      <div>
        
        <h1 className="font-display text-[28px] leading-none text-cloud">{title}</h1>
      </div>
      {href && cta && <Button href={href}>{cta}</Button>}
    </div>
  );
}
