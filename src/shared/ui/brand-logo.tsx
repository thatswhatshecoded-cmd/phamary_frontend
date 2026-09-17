type BrandLogoProps = {
  dark?: boolean;
};

export function BrandLogo({ dark = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-2" aria-label="ApniPharma">
      <svg aria-hidden="true" className="size-9 drop-shadow-sm" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="brand-gradient" x1="5" y1="5" x2="35" y2="35"><stop stopColor="#4de0f1" /><stop offset="1" stopColor="#1487df" /></linearGradient></defs><circle cx="20" cy="20" r="17" fill="url(#brand-gradient)" stroke="white" strokeWidth="1.5" /><path d="M20 8v24M8 20h24" stroke="white" strokeWidth="4" strokeLinecap="round" /></svg>
      <span className={`text-[30px] font-light tracking-[-1.5px] ${dark ? "text-[#062f58]" : "text-white"}`}>ApniPharma</span>
      <span className="rounded-full bg-[#198fe7] px-2 py-1 text-xs font-semibold text-white shadow-sm">Rx</span>
    </div>
  );
}
