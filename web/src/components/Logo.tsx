// Text-based wordmark for "Scale to Thrive". No image needed; scales with font size.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex flex-col leading-none font-extrabold tracking-tight ${className}`}
      aria-label="Scale to Thrive"
    >
      <span className="flex items-baseline gap-2 text-[#1e3a5f]">
        <span className="text-4xl">SCALE</span>
        <span className="text-xl font-semibold italic text-[#8b4a2b]">to</span>
      </span>
      <span className="mt-1 flex items-center gap-2 text-4xl text-[#8b4a2b]">
        THRIVE
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#1e3a5f]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 18 L12 10 L16 14 L21 6" />
          <path d="M15 6 H21 V12" />
        </svg>
      </span>
    </span>
  );
}
