import PartnerStrip from "./PartnerStrip";

export default function Footer() {
  return (
    <footer className="bg-surface text-sm text-muted">
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-14 md:py-14">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest">An initiative of Anvesana TBI and PES Trust</p>
        <PartnerStrip className="sm:justify-start" />
        <hr className="my-8 border-black/10" />
        <p>Engineering students and recent graduates only. Target roles are not guaranteed placements. www.anvesana.co.in · info@anvesana.co.in</p>
        <p className="mt-2">© 2026 Scale to Thrive. Photos by Unsplash contributors.</p>
      </div>
    </footer>
  );
}
