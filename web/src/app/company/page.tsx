import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { postJob, toggleJob } from "./actions";
import { field, btn, btnGhost, card } from "@/lib/ui";

export default async function CompanyHome({ searchParams }: PageProps<"/company">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const myId = (await supabase.rpc("my_company_id")).data as string | null;
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, location, status, track_id, apply_by, job_applications(stage)")
    .eq("company_id", myId ?? "")
    .order("created_at", { ascending: false });
  const own = jobs ?? [];

  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">My jobs</h1>
      <Notice ok={sp.ok} err={sp.err} />
      <form action={postJob} className={card + " mb-8 grid gap-3 sm:grid-cols-2"}>
        <h2 className="font-semibold sm:col-span-2">Post a job</h2>
        <input name="title" required placeholder="Job title" className={field} />
        <input name="location" placeholder="Location" className={field} />
        <select name="track_id" className={field}><option value="">Both tracks</option><option value="it">IT</option><option value="non-it">Non-IT</option></select>
        <input name="apply_by" type="date" className={field} title="Last date to apply" />
        <input name="external_url" type="url" placeholder="External apply link (optional)" className={field + " sm:col-span-2"} />
        <textarea name="description" required rows={3} placeholder="Description, skills and how to apply" className={field + " sm:col-span-2"} />
        <div className="sm:col-span-2"><button className={btn}>Post job</button></div>
      </form>
      <div className="space-y-3">
        {own.map((j) => {
          const apps = (j.job_applications ?? []) as { stage: string }[];
          return (
            <div key={j.id} className={card + " flex flex-wrap items-center justify-between gap-4"}>
              <div>
                <p className="font-semibold">{j.title}</p>
                <p className="text-sm text-muted">{j.location ?? "Location not set"} · {j.track_id ? (j.track_id === "it" ? "IT" : "Non-IT") : "Both tracks"} · {j.status}</p>
                <p className="text-sm text-muted">{apps.length} applicants · {apps.filter((a) => a.stage === "selected").length} selected</p>
              </div>
              <form action={toggleJob}><input type="hidden" name="id" value={j.id} /><input type="hidden" name="status" value={j.status === "open" ? "closed" : "open"} /><button className={btnGhost}>{j.status === "open" ? "Close job" : "Reopen"}</button></form>
            </div>
          );
        })}
        {!own.length && <p className="text-muted">You have not posted any jobs yet.</p>}
      </div>
    </>
  );
}
