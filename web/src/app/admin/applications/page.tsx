import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import { setApplicationStatus, finalizeApplication } from "../actions";
import { field, btn, btnGhost, btnDanger, th, td, table, thead, tbody, tr } from "@/lib/ui";

const badge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800", shortlisted: "bg-blue-50 text-blue-800",
  finalized: "bg-green-50 text-green-800", rejected: "bg-red-50 text-red-700",
};


// Readable version of the track-specific answers (education is shown on its own line)
const ANSWER_LABELS: Record<string, string> = { experience: "Experience", github_url: "GitHub", tools: "Tools", english: "English", career_area: "Career area" };
const answerLines = (ans: Record<string, string | null> | null) =>
  Object.entries(ANSWER_LABELS).filter(([k]) => ans?.[k]).map(([k, l]) => `${l}: ${ans![k]}`).join(" · ") || "No extra answers";

export default async function Applications({ searchParams }: PageProps<"/admin/applications">) {
  const sp = await searchParams;
  const track = typeof sp.track === "string" ? sp.track : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const supabase = await createClient();
  let query = supabase.from("applications").select("*").order("created_at", { ascending: false }).limit(300);
  if (track) query = query.eq("track_id", track);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`full_name.ilike.%${q.replace(/[,()%]/g, " ")}%,email.ilike.%${q.replace(/[,()%]/g, " ")}%`);
  const { data } = await query;
  const exportQs = new URLSearchParams({ track, status, q }).toString();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Applications</h1>
        <a href={`/admin/export?type=applications&${exportQs}`} className={btnGhost}>Export Excel</a>
      </div>
      <Notice ok={sp.ok} err={sp.err} />
      <form className="mb-4 flex flex-wrap gap-2">
        <select name="track" defaultValue={track} className={field + " sm:w-36"}><option value="">All tracks</option><option value="it">IT</option><option value="non-it">Non-IT</option></select>
        <select name="status" defaultValue={status} className={field + " sm:w-36"}><option value="">All statuses</option>{["pending", "shortlisted", "finalized", "rejected"].map((s) => <option key={s}>{s}</option>)}</select>
        <input name="q" defaultValue={q} placeholder="Search name or email" className={field + " sm:w-60"} />
        <button className={btn}>Filter</button>
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className={table}>
          <thead className={thead}><tr className="border-b border-black/5"><th className={th}>Applicant</th><th className={th}>Track</th><th className={th}>Details</th><th className={th}>Status</th><th className={th}>Actions</th></tr></thead>
          <tbody className={tbody}>
            {(data ?? []).map((a) => (
              <tr key={a.id} className={tr}>
                <td className={td}><p className="font-medium">{a.full_name}</p><p className="text-muted">{a.email}</p><p className="text-muted">{a.phone}</p></td>
                <td className={td} data-label="Track">{a.track_id === "it" ? "IT" : "Non-IT"}</td>
                <td className={td + " md:max-w-xs"}>
                  <details><summary className="cursor-pointer text-accent">View</summary>
                    <div className="mt-2 space-y-1 text-muted">
                      <p>College: {a.college}</p><p>Education: {a.answers?.education_level ?? "-"}{a.answers?.branch ? `, ${a.answers.branch}` : ""} ({a.answers?.education_status === "completed" ? "passed out" : "studying"} {a.answers?.passout_year ?? ""})</p><p>City: {a.city_state ?? "-"}</p>
                      <p>Why: {a.reason}</p><p>Goal: {a.career_goal ?? "-"}</p>
                      <p>{answerLines(a.answers)}</p>
                      <p>Heard from: {a.heard_from ?? "-"}</p>
                      <p>Resume: {a.resume_path ? <a className="text-accent" href={`/admin/applications/resume?path=${encodeURIComponent(a.resume_path)}`}>Download</a> : "none"}</p>
                    </div>
                  </details>
                </td>
                <td className={td} data-label="Status"><span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[a.status]}`}>{a.status}</span></td>
                <td className={td + " pt-3 md:pt-3"}>
                  <div className="flex flex-wrap gap-2">
                  <a href={`/documents/application?id=${a.id}`} className={btnGhost}>Download PDF</a>
                  {a.status !== "finalized" && a.status !== "rejected" && (
                    <>
                      {a.status === "pending" && (
                        <form action={setApplicationStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="shortlisted" /><button className={btnGhost}>Shortlist</button></form>
                      )}
                      <form action={finalizeApplication}><input type="hidden" name="id" value={a.id} /><button className={btn}>Finalize</button></form>
                      <form action={setApplicationStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="rejected" /><button className={btnDanger}>Reject</button></form>
                    </>
                  )}
                  </div>
                </td>
              </tr>
            ))}
            {!data?.length && <tr><td className={td} colSpan={5}>No applications.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
