import AdminButton from "@/components/ui/AdminButton";

interface Props {
  title: string;
  href: string;
  cta: string;
  label?: string;
}

export default function PageHeader({ title, href, cta, label = "Oversikt" }: Props) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-1">{label}</p>
        <h1 className="font-display text-[28px] leading-none text-cloud">{title}</h1>
      </div>
      <AdminButton href={href}>{cta}</AdminButton>
    </div>
  );
}
