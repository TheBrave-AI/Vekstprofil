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
}

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
};

export default function AdminButton({
  children,
  href,
  type = "button",
  onClick,
  disabled,
  size = "sm",
  fullWidth = false,
}: Props) {
  const base = `rounded-xl bg-brand font-medium text-onbrand hover:bg-brand-deep disabled:opacity-50 transition ${sizes[size]} ${fullWidth ? "w-full" : ""}`;

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
