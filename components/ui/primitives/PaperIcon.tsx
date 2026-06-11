interface Props {
  size?: number;
  className?: string;
}

export default function PaperIcon({ size = 9, className = "shrink-0 text-muted" }: Props) {
  return (
    <svg width={size} height={Math.round(size * 1.2)} viewBox="0 0 10 12" fill="none" className={className}>
      <path d="M1.5 0.5H6.5L9.5 3.5V11C9.5 11.3 9.3 11.5 9 11.5H1.5C1.2 11.5 1 11.3 1 11V1C1 0.7 1.2 0.5 1.5 0.5Z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6.5 0.5V3.5H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M3 5.5H7M3 7.5H7M3 9.5H5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
