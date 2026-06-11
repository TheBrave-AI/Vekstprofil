import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";

export const buttonVariants = cva(
  "inline-flex items-center gap-2 rounded-xl font-medium disabled:opacity-50 transition",
  {
    variants: {
      variant: {
        solid:  "border border-transparent bg-brand text-onbrand hover:bg-brand-deep",
        ghost:  "border border-line text-muted hover:text-cloud hover:bg-black/[0.04]",
        danger: "border border-line text-muted hover:text-coral hover:border-coral/40",
        coral:  "border border-transparent bg-coral/90 text-white hover:bg-coral",
        accent:   "border border-transparent bg-accent/10 text-accent hover:bg-accent/20",
        success:  "border border-transparent bg-[#16a34a] text-white hover:bg-[#15803d]",
      },
      size: {
        sm: "px-5 py-2.5 text-sm",
        md: "px-6 py-3 text-sm",
        lg: "px-6 py-3.5 text-sm",
      },
      fullWidth: {
        true: "w-full justify-center",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "sm",
    },
  }
);

interface Props extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function Button({
  children,
  href,
  type = "button",
  onClick,
  disabled,
  loading,
  icon,
  variant,
  size,
  fullWidth,
  className,
}: Props) {
  const cls = [buttonVariants({ variant, size, fullWidth }), className].filter(Boolean).join(" ");

  const content = (
    <>
      {icon && <span className="shrink-0 flex">{icon}</span>}
      {children}
    </>
  );

  if (href) {
    return <Link href={href} className={cls}>{content}</Link>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls} aria-busy={loading || undefined}>
      {content}
    </button>
  );
}
