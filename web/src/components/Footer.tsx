import Image from "next/image";
import { partners } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="bg-surface text-sm text-muted">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest">An initiative of Anvesana TBI and PES Trust</p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {partners.map((p) => (
            <Image key={p.name} src={p.file} alt={p.name} width={140} height={56} className="h-10 w-auto object-contain mix-blend-multiply" />
          ))}
        </div>
        <hr className="my-8 border-black/10" />
        <p>Engineering students and recent graduates only. Target roles are not guaranteed placements. www.anvesana.co.in · info@anvesana.co.in</p>
        <p className="mt-2">© 2026 Scale to Thrive. Photos by Unsplash contributors.</p>
      </div>
    </footer>
  );
}
