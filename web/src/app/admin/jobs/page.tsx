import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { createSpecialJob, setJobStatus, deleteJob } from "../actions";
import { field, btn, btnGhost, btnDanger, card, th, td } from "@/lib/ui";

type Row = { id: string; title: string; status: string; is_special: boolean; track_id: string | null; companies: { name: string } | null; job_applications: { stage: string }[] };

export default async function Jobs({ searchParams }: PageProps<"/admin/jobs">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("jobs").select("id, title, status, is_special, track_id, companies(name), job_applications(stage)").order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];

  // Track-wise report: how many enrollees applied and how many were selected
  const { data: apps } = await supabase.from("job_applications").select("stage, enrollees(track_id)");
  const report: Record<string, { applied: number; selected: number }> = { it: { applied: 0, selected: 0 }, "non-it": { applied: 0, selected: 0 } };
  for (const a of (apps ?? []) as unknown as { stage: string; enrollees: { track_id: string } | null }[]) {
    const t = a.enrollees?.track_id;
    if (!t || !report[t]) continue;
    report[t].applied++;
    if (a.stage === "selected") report[t].selected++;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Jobs</h1>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/export?type=job-applications&track=it" className={btn}>Export IT job applications (Excel)</a>
          <a href="/admin/export?type=job-applications&track=non-it" className={btn}>Export Non-IT job applications (Excel)</a>
          <a href="/admin/export?type=jobs" className={btnGhost}>Export jobs and all applications</a>
        </div>
      </div>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {Object.entries(report).map(([t, r]) => (
          <div key={t} className={card}><h2 className="font-semibold">{t === "it" ? "IT" : "Non-IT"} report</h2>
            <p className="mt-2 text-sm text-muted">{r.applied} job applications · <strong className="text-foreground">{r.selected} selected</strong></p></div>
        ))}
      </div>

      <form action={createSpecialJob} className={card + " mb-8 grid gap-3 sm:grid-cols-2"}>
        <h2 className="font-semibold sm:col-span-2">Post a Special job (by admin)</h2>
        <input name="title" required placeholder="Job title" className={field} />
        <input name="location" placeholder="Location" className={field} />
        <select name="track_id" className={field}><option value="">Both tracks</option><option value="it">IT</option><option value="non-it">Non-IT</option></select>
        <input name="apply_by" type="date" className={field} title="Last date to apply" />
        <input name="external_url" type="url" placeholder="External apply link (optional)" className={field + " sm:col-span-2"} />
        <textarea name="description" required rows={3} placeholder="Description" className={field + " sm:col-span-2"} />
        <div className="sm:col-span-2"><button className={btn}>Post job</button></div>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full">
          <thead><tr className="border-b border-black/5"><th className={th}>Job</th><th className={th}>Company</th><th className={th}>Applicants</th><th className={th}>Selected</th><th className={th}>Status</th><th className={th}></th></tr></thead>
          <tbody className="divide-y divide-black/5">
            {rows.map((j) => (
              <tr key={j.id}>
                <td className={td}><p className="font-medium">{j.title}</p><p className="text-muted">{j.track_id ? (j.track_id === "it" ? "IT" : "Non-IT") : "Both tracks"}</p></td>
                <td className={td}>{j.is_special ? "Special (admin)" : j.companies?.name}</td>
                <td className={td}>{j.job_applications.length}</td>
                <td className={td}>{j.job_applications.filter((a) => a.stage === "selected").length}</td>
                <td className={td}>{j.status}</td>
                <td className={td}>
                  <div className="flex gap-2">
                    <form action={setJobStatus}><input type="hidden" name="id" value={j.id} /><input type="hidden" name="status" value={j.status === "open" ? "closed" : "open"} /><button className={btnGhost}>{j.status === "open" ? "Close" : "Reopen"}</button></form>
                    <form action={deleteJob}><input type="hidden" name="id" value={j.id} /><button className={btnDanger}>Delete</button></form>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td className={td} colSpan={6}>No jobs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
