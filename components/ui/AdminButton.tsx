import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
  variant?: "solid" | "ghost" | "danger";
}

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
};

const variants = {
  solid: "bg-brand text-onbrand hover:bg-brand-deep",
  ghost: "border border-line text-cloud hover:bg-black/[0.04]",
  danger: "border border-line text-muted hover:text-coral hover:border-coral/40",
};

export default function AdminButton({
  children,
  href,
  type = "button",
  onClick,
  disabled,
  size = "sm",
  fullWidth = false,
  variant = "solid",
}: Props) {
  const base = `rounded-xl font-medium disabled:opacity-50 transition ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  );
}
