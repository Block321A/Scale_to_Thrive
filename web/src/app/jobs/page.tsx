import Image from "next/image";
import { redirect } from "next/navigation";
import { getProfile, getUserId } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import Notice from "@/components/Notice";
import ReadMore from "@/components/ReadMore";
import { applyToJob } from "./actions";
import { field, btn, card } from "@/lib/ui";

type Job = { id: string; title: string; description: string; location: string | null; track_id: string | null; apply_by: string | null; external_url: string | null; is_special: boolean; companies: { name: string; logo_path: string | null; description: string | null } | null };

export default async function Jobs({ searchParams }: PageProps<"/jobs">) {
  const sp = await searchParams;
  if (!supabaseConfigured) redirect("/login");
  const uid = await getUserId();
  if (!uid) redirect("/login");
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  // Profile, job list and "jobs I already applied for" are requested together
  const [me, { data }, mine] = await Promise.all([
    getProfile(),
    supabase
      .from("jobs")
      .select("id, title, description, location, track_id, apply_by, external_url, is_special, companies(name, logo_path, description)")
      .eq("status", "open")
      .or(`apply_by.is.null,apply_by.gte.${today}`)
      .order("created_at", { ascending: false }),
    supabase.from("job_applications").select("job_id").eq("enrollee_id", uid),
  ]);
  if (!me) redirect("/login");
  const jobs = (data ?? []) as unknown as Job[];
  const applied = new Set<string>((mine.data ?? []).map((m) => m.job_id));
  const logo = (p: string) => supabase.storage.from("logos").getPublicUrl(p).data.publicUrl;
  const special = jobs.filter((j) => j.is_special);
  const regular = jobs.filter((j) => !j.is_special);

  const render = (j: Job) => (
    <div key={j.id} className={card}>
      <div className="flex gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface">
          {j.companies?.logo_path ? <Image src={logo(j.companies.logo_path)} alt={j.companies.name} fill sizes="56px" className="object-contain p-1" unoptimized /> : <span className="grid size-full place-items-center bg-navy text-lg text-white">S</span>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">{j.title}</h3>
          <p className="text-sm text-muted">{j.is_special ? "Scale to Thrive" : j.companies?.name} · {j.location ?? "Location not set"} · {j.track_id ? (j.track_id === "it" ? "IT track" : "Non-IT track") : "Both tracks"}{j.apply_by ? ` · apply by ${j.apply_by}` : ""}</p>
          <ReadMore text={j.description} className="mt-3" />
          {j.external_url && <p className="mt-2 text-sm"><a className="text-accent" href={j.external_url} rel="noopener noreferrer" target="_blank">Company website / apply link</a></p>}
          {me?.role === "enrollee" && (
            applied.has(j.id) ? <p className="mt-4 text-sm font-medium text-green-700">You applied for this job</p> : (
              <form action={applyToJob} className="mt-4 space-y-2">
                <input type="hidden" name="job_id" value={j.id} />
                <input name="note" placeholder="Optional note to the company" className={field} />
                <p className="text-xs text-muted">Your complete profile will be shared with this company.</p>
                <button className={btn}>Apply</button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface pb-24">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Jobs</h1>
        <p className="mt-2 text-muted">Openings from partner companies and Scale to Thrive.</p>
        <div className="mt-6"><Notice ok={sp.ok} err={sp.err} /></div>
        {me && me.role !== "enrollee" && <p className="mb-4 text-sm text-muted">Only enrolled students can apply.</p>}
        {special.length > 0 && <><h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-widest text-brown">Special</h2><div className="space-y-4">{special.map(render)}</div></>}
        <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-widest text-brown">Companies</h2>
        <div className="space-y-4">{regular.map(render)}{!jobs.length && <p className="text-muted">No open jobs right now.</p>}</div>
      </div>
    </div>
  );
}
