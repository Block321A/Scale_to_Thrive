import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { createCompany, resendLink } from "../actions";
import { field, btn, btnGhost, card } from "@/lib/ui";

export default async function Companies({ searchParams }: PageProps<"/admin/companies">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("id, name, email, description, logo_path").order("created_at", { ascending: false });
  const logo = (p: string) => supabase.storage.from("logos").getPublicUrl(p).data.publicUrl;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Companies</h1>
        <a href="/admin/export?type=companies" className={btnGhost}>Export Excel</a>
      </div>
      <Notice ok={sp.ok} err={sp.err} />
      <form action={createCompany} className={card + " mb-8 grid gap-3 sm:grid-cols-2"}>
        <h2 className="font-semibold sm:col-span-2">Add a company</h2>
        <input name="name" required placeholder="Company name" className={field} />
        <input name="email" type="email" required placeholder="Company login email" className={field} />
        <textarea name="description" rows={2} placeholder="Short description" className={field + " sm:col-span-2"} />
        <label className="text-sm sm:col-span-2">Logo (PNG, JPG, WebP or SVG, up to 2 MB)<input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className={field} /></label>
        <div className="sm:col-span-2"><button className={btn}>Create and email set-password link</button></div>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((c) => (
          <div key={c.id} className={card + " flex gap-4"}>
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface">
              {c.logo_path && <Image src={logo(c.logo_path)} alt={c.name} fill sizes="64px" className="object-contain p-1" unoptimized />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{c.name}</p><p className="text-sm text-muted">{c.email}</p>
              <p className="mt-1 text-sm text-muted">{c.description}</p>
              <form action={resendLink} className="mt-2"><input type="hidden" name="email" value={c.email} /><input type="hidden" name="from" value="/admin/companies" /><button className={btnGhost}>Resend set-password email</button></form>
            </div>
          </div>
        ))}
        {!data?.length && <p className="text-muted">No companies yet.</p>}
      </div>
    </>
  );
}
