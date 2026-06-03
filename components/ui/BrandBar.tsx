export default function BrandBar() {
  return (
    <div className="flex items-center gap-2 pt-2 w-full">
      <span className="font-display font-semibold text-brand text-3xl">Brave</span>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="2" cy="14" r="1.8" fill="#bf4d27"/>
        <path d="M2 10 A4 4 0 0 1 6 14"  stroke="#bf4d27" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M2 6.5 A7.5 7.5 0 0 1 9.5 14"  stroke="#bf4d27" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M2 3 A11 11 0 0 1 13 14" stroke="#bf4d27" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      <span className="ml-auto text-[12px] font-bold tracking-[0.14em] text-muted opacity-90">VEKSTPROFIL</span>
    </div>
  );
}
    