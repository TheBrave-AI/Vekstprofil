interface Props {
  title?: string;
  children: React.ReactNode;
}

export default function EmptyState({ title, children }: Props) {
  return (
    <div className="rounded-card bg-midnight shadow-card px-8 py-12 text-center">
      {title && <p className="font-display text-lg text-cloud mb-1">{title}</p>}
      <div className="text-[13px] text-muted">{children}</div>
    </div>
  );
}
