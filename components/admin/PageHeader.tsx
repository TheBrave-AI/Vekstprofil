import Link from "next/link";

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
      <Link
        href={href}
        className="rounded-xl bg-brand px-4 py-2 text-[13px] font-medium text-onbrand hover:bg-brand-deep transition-colors"
      >
        {cta}
      </Link>
    </div>
  );
}
