import Button from "@/components/ui/primitives/Button";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function SaveButton({ children = "Lagre", type = "submit", onClick, disabled, loading, fullWidth }: Props) {
  return (
    <Button variant="solid" type={type} onClick={onClick} disabled={disabled} loading={loading} fullWidth={fullWidth ?? undefined}>
      {children}
    </Button>
  );
}
