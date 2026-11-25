import Link from "next/link";
import { requireRole } from "@/lib/auth";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const me = await requireRole("company");
  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex gap-2">
            <Link href="/company" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-white">My jobs</Link>
            <Link href="/company/applicants" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-white">Applicants</Link>
          </nav>
          <form action="/auth/signout" method="post" className="text-sm text-muted">{me.email} · <button className="hover:text-foreground">Sign out</button></form>
        </div>
        {children}
      </div>
    </div>
  );
}
