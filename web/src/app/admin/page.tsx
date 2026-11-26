import { createClient } from "@/lib/supabase/server";
import { card, btnGhost } from "@/lib/ui";
import { formatDate } from "@/lib/content";

export default async function Dashboard() {
  const supabase = await createClient();
  const [tracks, intake, pending, enrollees, jobs, jobApps] = await Promise.all([
    supabase.from("tracks").select("id, name"),
    supabase.rpc("track_intake"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("enrollees").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("job_applications").select("id", { count: "exact", head: true }).eq("stage", "applied"),
  ]);
  const rows = (intake.data ?? []) as { track_id: string; seats_total: number; seats_left: number; applications_open: boolean; opening_date: string | null }[];
  const stat = (label: string, v: number | null) => (
    <div className={card}><p className="text-2xl font-semibold md:text-3xl">{v ?? 0}</p><p className="text-sm text-muted">{label}</p></div>
  );
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
        <a href="/admin/export?type=members" className={btnGhost}>Download all members (Excel)</a>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stat("New applications", pending.count)}
        {stat("Enrollees", enrollees.count)}
        {stat("Open jobs", jobs.count)}
        {stat("Job applications to review", jobApps.count)}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(tracks.data ?? []).map((t) => {
          const r = rows.find((x) => x.track_id === t.id);
          return (
            <div key={t.id} className={card}>
              <h2 className="font-semibold">{t.name} track</h2>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                <li>Opens: <strong className="text-foreground">{r?.opening_date ? formatDate(r.opening_date) : "not set"}</strong></li>
                <li>Seats: <strong className="text-foreground">{r ? `${r.seats_left} left of ${r.seats_total}` : "-"}</strong></li>
                <li>Applications: <strong className={r?.applications_open ? "text-green-700" : "text-foreground"}>{r?.applications_open ? "Open" : "Closed"}</strong></li>
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
