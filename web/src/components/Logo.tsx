// Text-based wordmark for "Scale to Thrive". No image needed; scales with font size.
export default function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const big = compact ? "text-xl" : "text-4xl";
  const to = compact ? "text-xs" : "text-xl";
  const icon = compact ? "h-4 w-4" : "h-7 w-7";
  return (
    <span
      className={`inline-flex flex-col leading-none font-extrabold tracking-tight ${className}`}
      aria-label="Scale to Thrive"
    >
      <span className="flex items-baseline gap-2 text-[#1e3a5f]">
        <span className={big}>SCALE</span>
        <span className={`font-semibold italic text-[#8b4a2b] ${to}`}>to</span>
      </span>
      <span className={`mt-0.5 flex items-center gap-1.5 text-[#8b4a2b] ${big}`}>
        THRIVE
        <svg viewBox="0 0 24 24" className={`${icon} text-[#1e3a5f]`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 18 L12 10 L16 14 L21 6" />
          <path d="M15 6 H21 V12" />
        </svg>
      </span>
    </span>
  );
}
