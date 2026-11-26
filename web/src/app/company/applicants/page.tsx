import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { moveStage } from "../actions";
import { field, btn, btnGhost, card } from "@/lib/ui";

const stages = ["applied", "shortlisted", "interview", "offered", "selected", "rejected"];

type Row = {
  id: string; stage: string; note: string | null; created_at: string;
  jobs: { title: string; company_id: string | null };
  enrollees: { id: string; track_id: string; college: string; city_state: string | null; date_of_birth: string | null; gender: string | null; career_goal: string | null; github_url: string | null; resume_path: string | null; details: Record<string, string | null>;
    profiles: { full_name: string | null; email: string; phone: string | null; photo_url: string | null } };
};

export default async function Applicants({ searchParams }: PageProps<"/company/applicants">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const myId = (await supabase.rpc("my_company_id")).data;
  const { data } = await supabase
    .from("job_applications")
    .select("id, stage, note, created_at, jobs(title, company_id), enrollees(id, track_id, college, city_state, date_of_birth, gender, career_goal, github_url, resume_path, details, profiles(full_name, email, phone, photo_url))")
    .order("created_at", { ascending: false });
  const rows = ((data ?? []) as unknown as Row[]).filter((r) => r.jobs.company_id === myId);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Applicants</h1>
        <div className="flex flex-wrap gap-2">
          <a href="/company/export?track=it" className={btn}>Export IT applicants (Excel)</a>
          <a href="/company/export?track=non-it" className={btn}>Export Non-IT applicants (Excel)</a>
          <a href="/company/export" className={btnGhost}>Export all</a>
        </div>
      </div>
      <Notice ok={sp.ok} err={sp.err} />
      <div className="space-y-4">
        {rows.map((r) => {
          const p = r.enrollees.profiles;
          return (
            <div key={r.id} className={card}>
              <div className="flex flex-wrap items-start gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-surface ring-2 ring-white shadow">
                  {p.photo_url ? <Image src={p.photo_url} alt={p.full_name ?? ""} fill sizes="64px" className="object-cover object-top" unoptimized /> : <span className="grid size-full place-items-center bg-navy text-white">{(p.full_name ?? "?")[0]}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">{p.full_name}</p>
                  <p className="text-sm text-muted">For: {r.jobs.title} · {r.enrollees.track_id === "it" ? "IT" : "Non-IT"} track</p>
                  <p className="mt-1 text-sm">{p.email} · {p.phone}</p>
                  <p className="text-sm text-muted">{r.enrollees.college}{r.enrollees.city_state ? `, ${r.enrollees.city_state}` : ""}</p>
                  {r.enrollees.career_goal && <p className="mt-1 text-sm text-muted">Goal: {r.enrollees.career_goal}</p>}
                  {r.enrollees.github_url && <p className="text-sm"><a className="text-accent" href={r.enrollees.github_url}>GitHub</a></p>}
                  {r.enrollees.resume_path && <p className="text-sm"><a className="text-accent" href={`/company/resume?path=${encodeURIComponent(r.enrollees.resume_path)}`}>Resume</a></p>}
                  {r.note && <p className="mt-1 text-sm">Note from applicant: {r.note}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                <form action={moveStage} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="stage" defaultValue={r.stage} className={field + " w-36"}>{stages.map((s) => <option key={s}>{s}</option>)}</select>
                  <button className={btn}>Update</button>
                </form>
                <a href={`/documents/job-application?id=${r.id}`} className={btnGhost}>Download application</a>
                </div>
              </div>
            </div>
          );
        })}
        {!rows.length && <p className="text-muted">No applicants yet.</p>}
      </div>
    </>
  );
}
