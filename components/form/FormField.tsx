interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export default function FormField({ label, required, className, ...rest }: Props) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-cloud">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </span>
      <input
        required={required}
        className={`w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud placeholder:text-muted focus:border-accent focus:outline-none transition ${className ?? ""}`}
        {...rest}
      />
    </label>
  );
}
