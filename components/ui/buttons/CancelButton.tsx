import Button from "@/components/ui/Button";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function CancelButton({ children = "Avbryt", onClick, disabled }: Props) {
  return (
    <Button variant="ghost" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}
