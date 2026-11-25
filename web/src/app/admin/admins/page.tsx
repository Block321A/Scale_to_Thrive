import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { inviteAdmin, removeAdmin } from "../actions";
import { field, btn, btnDanger, card } from "@/lib/ui";

export default async function Admins({ searchParams }: PageProps<"/admin/admins">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, email, full_name").eq("role", "admin").order("created_at");
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Admins</h1>
      <Notice ok={sp.ok} err={sp.err} />
      <p className="mb-4 text-sm text-muted">All admins have the same access. The last admin and yourself cannot be removed.</p>
      <form action={inviteAdmin} className={card + " mb-6 flex flex-wrap gap-3"}>
        <input name="email" type="email" required placeholder="New admin email" className={field + " flex-1"} />
        <button className={btn}>Invite admin</button>
      </form>
      <div className={card + " divide-y divide-black/5 p-0"}>
        {(data ?? []).map((a) => (
          <div key={a.id} className="flex items-center justify-between px-6 py-4">
            <div><p className="font-medium">{a.full_name ?? a.email}</p><p className="text-sm text-muted">{a.email}</p></div>
            <form action={removeAdmin}><input type="hidden" name="id" value={a.id} /><button className={btnDanger}>Remove</button></form>
          </div>
        ))}
      </div>
    </>
  );
}
