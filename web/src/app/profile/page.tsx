import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildResume, scoreResume } from "@/lib/resume";
import { loadResumeInput } from "@/lib/resume-data";

const statusLabel: Record<string, string> = { completed: "Completed", in_progress: "In progress", not_started: "Not started" };

export default async function Profile() {
  const me = await requireRole("enrollee");
  const supabase = await createClient();
  const { data: enrollee } = await supabase.from("enrollees").select("track_id, college, city_state, career_goal, github_url, tracks(name)").eq("id", me.id).single();
  const [{ data: ms }, { data: titles }, { data: apps }] = await Promise.all([
    supabase.from("enrollee_milestones").select("week, status").eq("enrollee_id", me.id),
    supabase.from("track_milestones").select("week, title").eq("track_id", enrollee?.track_id ?? "").order("week"),
    supabase.from("job_applications").select("id, stage, created_at, jobs(title, is_special, companies(name))").eq("enrollee_id", me.id).order("created_at", { ascending: false }),
  ]);
  const resumeInput = await loadResumeInput(supabase, me);
  const ats = resumeInput ? scoreResume(resumeInput, buildResume(resumeInput)) : null;
  const track = (enrollee?.tracks as unknown as { name: string } | null)?.name ?? "";
  const status = new Map((ms ?? []).map((m) => [m.week, m.status]));
  const done = [...status.values()].filter((s) => s === "completed").length;
  const firstOpen = (titles ?? []).find((t) => status.get(t.week) !== "completed")?.week;

  return (
    <div className="bg-surface pb-24">
      <div className="relative h-56 md:h-72">
        <Image src="/images/office.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="mx-auto max-w-4xl px-0 md:px-6">
        <div className="relative rounded-b-[28px] bg-white px-8 pb-8 pt-24 shadow-sm">
          <div className="absolute -top-20 left-8"><Avatar src={me.photo_url ?? "/images/portrait-1.jpg"} name={me.full_name ?? "Profile"} size={160} /></div>
          <div className="absolute right-6 top-6 flex gap-3 text-sm"><Link href="/jobs" className="text-accent">Browse jobs</Link>
            <form action="/auth/signout" method="post"><button className="text-muted hover:text-foreground">Sign out</button></form></div>
          <h1 className="text-3xl font-semibold tracking-tight">{me.full_name}</h1>
          <p className="text-muted">{track} track · {enrollee?.college}</p>
          <p className="mt-1 text-sm text-muted">{me.email}{me.phone ? ` · ${me.phone}` : ""}{enrollee?.city_state ? ` · ${enrollee.city_state}` : ""}</p>
          {enrollee?.career_goal && <p className="mt-3 text-sm">Goal: {enrollee.career_goal}</p>}
        </div>

        <section className="mt-6 rounded-[28px] bg-white p-8">
          <h2 className="text-xl font-semibold">Workshop milestones · {track} track</h2>
          <p className="text-sm text-muted">{done} of 12 weeks completed</p>
          <div className="mt-4 h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-accent" style={{ width: `${(done / 12) * 100}%` }} /></div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {(titles ?? []).map((t) => {
              const s = status.get(t.week) ?? "not_started";
              const isDone = s === "completed";
              const current = s === "in_progress" || (s === "not_started" && t.week === firstOpen && done > 0);
              return (
                <li key={t.week} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${isDone ? "bg-accent text-white" : current || s === "in_progress" ? "bg-navy text-white" : "bg-white text-muted"}`}>{isDone ? "✓" : t.week}</span>
                  <span className="flex-1">{t.title}</span>
                  <span className="text-xs text-muted">{statusLabel[s]}</span>
                </li>
              );
            })}
          </ol>
        </section>

        {ats && (
          <section className="mt-6 rounded-[28px] bg-white p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">My resume</h2>
                <p className="mt-1 max-w-xl text-sm text-muted">Built from your workshop application, with the skills of your {track} track. Plain, single-column and ATS friendly.</p>
              </div>
              <a href="/documents/resume" className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-[#0077ed]">Download resume (PDF)</a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div className="grid size-24 shrink-0 place-items-center rounded-full border-[6px] border-accent/80 text-center">
                <div><p className="text-3xl font-semibold leading-none">{ats.score}</p><p className="text-xs text-muted">of 100</p></div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-brown">ATS score: {ats.label}</p>
                <p className="mt-1 text-sm text-muted">How well applicant tracking systems can read and rank this resume. It improves as you complete modules and fill in your profile.</p>
              </div>
            </div>
            <ul className="mt-6 divide-y divide-black/5">
              {ats.checks.map((c) => (
                <li key={c.name} className="flex items-start gap-3 py-3 text-sm">
                  <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-semibold ${c.got === c.max ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{c.got === c.max ? "✓" : "!"}</span>
                  <div className="flex-1"><p>{c.name}</p>{c.tip && <p className="text-muted">{c.tip}</p>}</div>
                  <span className="text-muted">{c.got}/{c.max}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6 rounded-[28px] bg-white p-8">
          <h2 className="text-xl font-semibold">Jobs you applied for</h2>
          <ul className="mt-4 divide-y divide-black/5">
            {(apps ?? []).map((a) => {
              const j = a.jobs as unknown as { title: string; is_special: boolean; companies: { name: string } | null };
              return (
                <li key={a.id} className="flex items-center justify-between py-4">
                  <div><p className="font-medium">{j.title}</p><p className="text-sm text-muted">{j.is_special ? "Scale to Thrive" : j.companies?.name}</p></div>
                  <div className="flex items-center gap-3"><a href={`/documents/job-application?id=${a.id}`} className="text-sm text-accent">Download application</a><span className="rounded-full bg-surface px-3 py-1 text-sm capitalize">{a.stage}</span></div>
                </li>
              );
            })}
            {!apps?.length && <li className="py-4 text-sm text-muted">You have not applied for any jobs yet. <Link href="/jobs" className="text-accent">Browse jobs</Link></li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
