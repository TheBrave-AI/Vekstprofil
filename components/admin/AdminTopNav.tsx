"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",           label: "Dashboard" },
  { href: "/admin/surveys",   label: "Undersøkelser" },
  { href: "/admin/templates", label: "Maler" },
  { href: "/admin/customers", label: "Kunder" },
  { href: "/admin/questions", label: "Spørsmål" },
];

export default function AdminTopNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex items-center gap-1"> 
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3 py-1.5 rounded-lg text-[13.5px] font-medium transition-colors ${
            isActive(href)
              ? "bg-brand text-onbrand"
              : "text-mist hover:text-cloud hover:bg-black/5"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
