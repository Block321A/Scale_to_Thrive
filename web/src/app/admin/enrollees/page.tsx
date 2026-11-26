import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { setMilestone, resendLink } from "../actions";
import { btn, btnGhost, field, th, td } from "@/lib/ui";

export default async function Enrollees({ searchParams }: PageProps<"/admin/enrollees">) {
  const sp = await searchParams;
  const open = typeof sp.open === "string" ? sp.open : "";
  const supabase = await createClient();
  const { data: enrollees } = await supabase
    .from("enrollees")
    .select("id, track_id, college, profiles(full_name, email), enrollee_milestones(week, status)")
    .order("created_at", { ascending: false });
  const { data: titles } = await supabase.from("track_milestones").select("track_id, week, title").order("week");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Enrollees</h1>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/export?type=enrollees&track=it" className={btn}>Export IT enrollees (Excel)</a>
          <a href="/admin/export?type=enrollees&track=non-it" className={btn}>Export Non-IT enrollees (Excel)</a>
          <a href="/admin/export?type=members" className={btnGhost}>Export all members (Excel)</a>
        </div>
      </div>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full">
          <thead><tr className="border-b border-black/5"><th className={th}>Enrollee</th><th className={th}>Track</th><th className={th}>Progress</th><th className={th}></th></tr></thead>
          <tbody className="divide-y divide-black/5">
            {(enrollees ?? []).map((e) => {
              const p = e.profiles as unknown as { full_name: string | null; email: string } | null;
              const ms = (e.enrollee_milestones ?? []) as { week: number; status: string }[];
              const done = ms.filter((m) => m.status === "completed").length;
              return (
                <tr key={e.id}>
                  <td className={td}><p className="font-medium">{p?.full_name}</p><p className="text-muted">{p?.email}</p><p className="text-muted">{e.college}</p></td>
                  <td className={td}>{e.track_id === "it" ? "IT" : "Non-IT"}</td>
                  <td className={td}>{done} of 12 completed</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-2">
                      <a href={`?open=${e.id}`} className={btnGhost}>Milestones</a>
                      <form action={resendLink}><input type="hidden" name="email" value={p?.email ?? ""} /><input type="hidden" name="from" value="/admin/enrollees" /><button className={btnGhost}>Resend set-password email</button></form>
                    </div>
                    {open === e.id && (
                      <div className="mt-3 space-y-2">
                        {(titles ?? []).filter((t) => t.track_id === e.track_id).map((t) => {
                          const cur = ms.find((m) => m.week === t.week)?.status ?? "not_started";
                          return (
                            <form key={t.week} action={setMilestone} className="flex items-center gap-2">
                              <input type="hidden" name="enrollee_id" value={e.id} /><input type="hidden" name="week" value={t.week} />
                              <span className="w-56 text-xs">Week {t.week}: {t.title}</span>
                              <select name="status" defaultValue={cur} className={field + " w-36"}>
                                <option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option>
                              </select>
                              <button className={btn}>Set</button>
                            </form>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!enrollees?.length && <tr><td className={td} colSpan={4}>No enrollees yet. Finalize an application to create one.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
