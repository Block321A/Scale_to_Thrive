import { requireRole } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireRole("admin");
  return (
    <div className="min-h-[70vh] bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pb-8 md:flex-row md:gap-6 md:px-6 md:py-8">
        <AdminNav email={me.email} />
        <section className="min-w-0 flex-1 pb-16 pt-2 md:pt-0">
          <p className="mb-3 truncate text-xs text-muted md:hidden">Signed in as {me.email}</p>
          {children}
        </section>
      </div>
    </div>
  );
}
