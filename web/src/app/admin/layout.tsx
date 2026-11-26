import Link from "next/link";
import { requireRole } from "@/lib/auth";

const items = [
  ["/admin", "Dashboard"],
  ["/admin/tracks", "Tracks"],
  ["/admin/applications", "Applications"],
  ["/admin/enrollees", "Enrollees"],
  ["/admin/jobs", "Jobs"],
  ["/admin/companies", "Companies"],
  ["/admin/admins", "Admins"],
  ["/admin/settings", "Email settings"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireRole("admin");
  return (
    <div className="bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row">
        <aside className="md:w-52 md:shrink-0">
          <p className="mb-3 text-xs text-muted">Admin · {me.email}</p>
          <nav className="flex flex-wrap gap-2 md:flex-col">
            {items.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-white">{label}</Link>
            ))}
          </nav>
          <form action="/auth/signout" method="post" className="mt-4"><button className="px-3 text-sm text-muted hover:text-foreground">Sign out</button></form>
        </aside>
        <section className="min-w-0 flex-1 pb-16">{children}</section>
      </div>
    </div>
  );
}
