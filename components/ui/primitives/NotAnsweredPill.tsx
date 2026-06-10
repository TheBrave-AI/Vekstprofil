interface Props {
  skipped?: boolean;
}

export default function NotAnsweredPill({ skipped }: Props) {
  const label = skipped ? "Hoppet over" : "Ikke besvart";
  return (
    <span
      className="text-coral text-[13px] font-medium px-3 py-[5px] rounded-full whitespace-nowrap"
      style={{ background: "rgba(191,77,39,0.10)" }}
    >
      {label}
    </span>
  );
}
