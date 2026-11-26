import Image from "next/image";
import Logo from "./Logo";
import { partners } from "@/lib/content";

// Scale to Thrive plus the partner logos. On phones: two even rows of three. On larger screens: one row.
export default function PartnerStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-3 items-center justify-items-center gap-x-3 gap-y-7 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-12 ${className}`}>
      <Logo compact />
      {partners.map((p) => (
        <Image
          key={p.name}
          src={p.file}
          alt={p.name}
          width={140}
          height={56}
          className="h-7 w-auto max-w-full object-contain mix-blend-multiply sm:h-10"
        />
      ))}
    </div>
  );
}
