"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  customerCount: number;
}

export default function AdminTopNav({ customerCount }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const NAV = [
    { href: "/admin",           label: "Dashboard",      badge: null },
    { href: "/admin/surveys",   label: "Undersøkelser",  badge: null },
    { href: "/admin/templates", label: "Undersøkelses-maler",          badge: null },
    { href: "/admin/customers", label: "Kunder",         badge: customerCount },
    { href: "/admin/questions", label: "Spørsmål",       badge: null },
  ];

  return (
    <nav className="flex items-center gap-1">
      {NAV.map(({ href, label, badge }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13.5px] font-medium transition-colors ${
              active
                ? "bg-brand text-onbrand"
                : "text-mist hover:text-cloud hover:bg-black/5"
            }`}
          >
            {label}
            {badge !== null && (
              <span className={`text-[11px] font-semibold tabular-nums leading-none px-1.5 py-0.5 rounded-full ${
                active ? "bg-white/20 text-onbrand" : "bg-black/8 text-muted"
              }`}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
