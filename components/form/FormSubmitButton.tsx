interface Props {
  label: string;
  isPending: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function FormSubmitButton({ label, isPending, disabled, fullWidth = true }: Props) {
  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      className={`${fullWidth ? "w-full " : ""}rounded-xl bg-brand px-6 py-3 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-50 transition`}
    >
      {isPending ? "Oppretter…" : label}
    </button>
  );
}
