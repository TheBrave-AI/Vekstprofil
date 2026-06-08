"use client";
import Link from "next/link";

const LINKS = [
  { label: "Hjem",          href: "/" },
  { label: "Survey",        href: "/k/test-onboarding-demo" },
  null,
  { label: "Dashboard",     href: "/admin" },
  { label: "Login",         href: "/login" },
  null,
  { label: "+ Ny kunde",    href: "/admin/customers/new" },
  { label: "Testkunde",     href: "/admin/customers/test-customer-001" },
  null,
  { label: "+ Ny survey",   href: "/admin/surveys/new" },
  null,
  { label: "Maler",         href: "/admin/templates" },
  { label: "+ Ny mal",      href: "/admin/templates/new" },
  { label: "Rediger mal",   href: "/admin/templates/default-template/edit" },
  null,
  { label: "Spørsmål",      href: "/admin/questions" },
] as const;

export default function DevNav() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <nav
      className="fixed bottom-3 right-3 flex flex-col gap-[2px] bg-black/85 text-white
        text-[11px] p-2 rounded-lg z-50 max-h-[90vh] overflow-y-auto"
      aria-label="Dev navigation"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-2 pb-1">
        DEV
      </span>
      {LINKS.map((link, i) =>
        link === null ? (
          <hr key={i} className="border-white/10 my-[3px]" />
        ) : (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="px-2 py-1 rounded hover:bg-white/20 transition-colors whitespace-nowrap"
          >
            {link.label}
          </Link>
        )
      )}
    </nav>
  );
}
