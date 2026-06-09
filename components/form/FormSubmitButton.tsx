import { SaveButton } from "@/components/ui/buttons/SaveButton";

interface Props {
  label: string;
  isPending: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function FormSubmitButton({ label, isPending, disabled, fullWidth = true }: Props) {
  return (
    <SaveButton type="submit" loading={isPending} disabled={disabled} fullWidth={fullWidth}>
      {isPending ? "Oppretter…" : label}
    </SaveButton>
  );
}
