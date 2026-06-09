import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function DeleteButton({ children = "Slett", onClick, disabled }: Props) {
  return (
    <Button variant="danger" onClick={onClick} disabled={disabled} icon={<Trash2 size={14} />}>
      {children}
    </Button>
  );
}
