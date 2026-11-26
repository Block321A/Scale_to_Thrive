import type { SupabaseClient } from "@supabase/supabase-js";
import type { SheetSpec } from "@/lib/xlsx";

const trackName = (id: string | null | undefined) => (id === "it" ? "IT" : id === "non-it" ? "Non-IT" : "Both tracks");
const d = (v: string | null | undefined) => (v ? new Date(v) : "");
type Row = Record<string, unknown>;

export async function applicationsSheet(supabase: SupabaseClient, f: { track?: string; status?: string; q?: string }): Promise<SheetSpec> {
  let q = supabase.from("applications").select("*").order("created_at", { ascending: false });
  if (f.track) q = q.eq("track_id", f.track);
  if (f.status) q = q.eq("status", f.status);
  if (f.q) {
    const t = f.q.replace(/[,()%]/g, " ");
    q = q.or(`full_name.ilike.%${t}%,email.ilike.%${t}%`);
  }
  const { data } = await q;
  const rows = ((data ?? []) as Row[]).map((a) => {
    const ans = (a.answers ?? {}) as Record<string, string | null>;
    return {
      applied: d(a.created_at as string), track: trackName(a.track_id as string), status: a.status,
      name: a.full_name, email: a.email, phone: a.phone, gender: a.gender ?? "", dob: d(a.date_of_birth as string),
      city: a.city_state ?? "", college: a.college, experience: ans.experience ?? "", github: ans.github_url ?? "",
      tools: ans.tools ?? "", english: ans.english ?? "", area: ans.career_area ?? "",
      reason: a.reason, goal: a.career_goal ?? "", heard: a.heard_from ?? "",
      resume: a.resume_path ? "Yes" : "No", reviewed: d(a.reviewed_at as string),
    };
  });
  return {
    name: "Applications",
    columns: [
      { header: "Applied on", key: "applied" }, { header: "Track", key: "track", width: 10 }, { header: "Status", key: "status", width: 12 },
      { header: "Full name", key: "name" }, { header: "Email", key: "email" }, { header: "Phone", key: "phone", width: 16 },
      { header: "Gender", key: "gender", width: 12 }, { header: "Date of birth", key: "dob", width: 14 }, { header: "City / state", key: "city" },
      { header: "College", key: "college" }, { header: "Experience level", key: "experience", width: 16 }, { header: "GitHub", key: "github" },
      { header: "Languages / tools", key: "tools" }, { header: "English level", key: "english", width: 14 }, { header: "Career area", key: "area" },
      { header: "Why they want to join", key: "reason", width: 48 }, { header: "Career goal", key: "goal", width: 36 },
      { header: "Heard about us from", key: "heard", width: 18 }, { header: "Resume uploaded", key: "resume", width: 12 }, { header: "Reviewed on", key: "reviewed" },
    ],
    rows,
  };
}

export async function enrolleesSheet(supabase: SupabaseClient): Promise<SheetSpec> {
  const { data } = await supabase
    .from("enrollees")
    .select("id, track_id, college, city_state, date_of_birth, gender, career_goal, github_url, created_at, profiles(full_name, email, phone), enrollee_milestones(status)")
    .order("created_at", { ascending: false });
  const rows = ((data ?? []) as unknown as Row[]).map((e) => {
    const p = (e.profiles ?? {}) as Record<string, string | null>;
    const ms = (e.enrollee_milestones ?? []) as { status: string }[];
    return {
      name: p.full_name ?? "", email: p.email ?? "", phone: p.phone ?? "", track: trackName(e.track_id as string),
      college: e.college, city: e.city_state ?? "", dob: d(e.date_of_birth as string), gender: e.gender ?? "",
      goal: e.career_goal ?? "", github: e.github_url ?? "", done: `${ms.filter((m) => m.status === "completed").length} of 12`,
      joined: d(e.created_at as string),
    };
  });
  return {
    name: "Enrollees",
    columns: [
      { header: "Full name", key: "name" }, { header: "Email", key: "email" }, { header: "Phone", key: "phone", width: 16 },
      { header: "Track", key: "track", width: 10 }, { header: "College", key: "college" }, { header: "City / state", key: "city" },
      { header: "Date of birth", key: "dob", width: 14 }, { header: "Gender", key: "gender", width: 12 },
      { header: "Career goal", key: "goal", width: 36 }, { header: "GitHub", key: "github" },
      { header: "Milestones completed", key: "done", width: 20 }, { header: "Joined on", key: "joined" },
    ],
    rows,
  };
}

export async function companiesSheet(supabase: SupabaseClient): Promise<SheetSpec> {
  const { data } = await supabase
    .from("companies")
    .select("name, email, description, created_at, jobs(status, job_applications(stage))")
    .order("created_at", { ascending: false });
  const rows = ((data ?? []) as unknown as Row[]).map((c) => {
    const jobs = (c.jobs ?? []) as { status: string; job_applications: { stage: string }[] }[];
    const apps = jobs.flatMap((j) => j.job_applications ?? []);
    return {
      name: c.name, email: c.email, description: c.description ?? "", jobs: jobs.length,
      open: jobs.filter((j) => j.status === "open").length, applicants: apps.length,
      selected: apps.filter((a) => a.stage === "selected").length, created: d(c.created_at as string),
    };
  });
  return {
    name: "Companies",
    columns: [
      { header: "Company", key: "name" }, { header: "Login email", key: "email" }, { header: "Description", key: "description", width: 48 },
      { header: "Jobs posted", key: "jobs", width: 12 }, { header: "Open jobs", key: "open", width: 12 },
      { header: "Applicants", key: "applicants", width: 12 }, { header: "Selected", key: "selected", width: 12 }, { header: "Added on", key: "created" },
    ],
    rows,
  };
}

export async function adminsSheet(supabase: SupabaseClient): Promise<SheetSpec> {
  const { data } = await supabase.from("profiles").select("full_name, email, created_at").eq("role", "admin").order("created_at");
  return {
    name: "Admins",
    columns: [{ header: "Name", key: "name" }, { header: "Email", key: "email" }, { header: "Added on", key: "created" }],
    rows: ((data ?? []) as Row[]).map((a) => ({ name: a.full_name ?? "", email: a.email, created: d(a.created_at as string) })),
  };
}

export async function jobsSheets(supabase: SupabaseClient): Promise<SheetSpec[]> {
  const [{ data: jobs }, { data: apps }] = await Promise.all([
    supabase.from("jobs").select("title, status, is_special, track_id, location, created_at, apply_by, companies(name), job_applications(stage)").order("created_at", { ascending: false }),
    supabase.from("job_applications").select("stage, note, created_at, jobs(title, companies(name)), enrollees(track_id, college, city_state, profiles(full_name, email, phone))").order("created_at", { ascending: false }),
  ]);
  return [
    {
      name: "Jobs",
      columns: [
        { header: "Job title", key: "title", width: 32 }, { header: "Company", key: "company" }, { header: "Track", key: "track", width: 12 },
        { header: "Location", key: "location" }, { header: "Status", key: "status", width: 10 }, { header: "Posted on", key: "posted" },
        { header: "Apply by", key: "applyBy", width: 14 }, { header: "Applicants", key: "applicants", width: 12 }, { header: "Selected", key: "selected", width: 10 },
      ],
      rows: ((jobs ?? []) as unknown as Row[]).map((j) => {
        const a = (j.job_applications ?? []) as { stage: string }[];
        return {
          title: j.title, company: j.is_special ? "Special (admin)" : ((j.companies ?? {}) as { name?: string }).name ?? "", track: trackName(j.track_id as string),
          location: j.location ?? "", status: j.status, posted: d(j.created_at as string), applyBy: d(j.apply_by as string),
          applicants: a.length, selected: a.filter((x) => x.stage === "selected").length,
        };
      }),
    },
    {
      name: "Job applications",
      columns: [
        { header: "Applied on", key: "applied" }, { header: "Job", key: "job", width: 32 }, { header: "Company", key: "company" },
        { header: "Applicant", key: "name" }, { header: "Email", key: "email" }, { header: "Phone", key: "phone", width: 16 },
        { header: "Track", key: "track", width: 10 }, { header: "College", key: "college" }, { header: "City / state", key: "city" },
        { header: "Stage", key: "stage", width: 12 }, { header: "Note from applicant", key: "note", width: 36 },
      ],
      rows: ((apps ?? []) as unknown as Row[]).map((a) => {
        const j = (a.jobs ?? {}) as { title?: string; companies?: { name?: string } | null };
        const e = (a.enrollees ?? {}) as { track_id?: string; college?: string; city_state?: string; profiles?: Record<string, string | null> };
        const p = e.profiles ?? {};
        return {
          applied: d(a.created_at as string), job: j.title ?? "", company: j.companies?.name ?? "Special (admin)", name: p.full_name ?? "",
          email: p.email ?? "", phone: p.phone ?? "", track: trackName(e.track_id), college: e.college ?? "", city: e.city_state ?? "",
          stage: a.stage, note: a.note ?? "",
        };
      }),
    },
  ];
}

// A company's own applicants (row level security limits the query to what the company may see).
export async function companyApplicantsSheet(supabase: SupabaseClient, companyId: string): Promise<SheetSpec> {
  const { data } = await supabase
    .from("job_applications")
    .select("stage, note, created_at, jobs(title, company_id), enrollees(track_id, college, city_state, career_goal, github_url, profiles(full_name, email, phone))")
    .order("created_at", { ascending: false });
  const rows = ((data ?? []) as unknown as Row[])
    .filter((a) => ((a.jobs ?? {}) as { company_id?: string }).company_id === companyId)
    .map((a) => {
      const e = (a.enrollees ?? {}) as { track_id?: string; college?: string; city_state?: string; career_goal?: string; github_url?: string; profiles?: Record<string, string | null> };
      const p = e.profiles ?? {};
      return {
        applied: d(a.created_at as string), job: ((a.jobs ?? {}) as { title?: string }).title ?? "", name: p.full_name ?? "", email: p.email ?? "",
        phone: p.phone ?? "", track: trackName(e.track_id), college: e.college ?? "", city: e.city_state ?? "", goal: e.career_goal ?? "",
        github: e.github_url ?? "", stage: a.stage, note: a.note ?? "",
      };
    });
  return {
    name: "Applicants",
    columns: [
      { header: "Applied on", key: "applied" }, { header: "Job", key: "job", width: 32 }, { header: "Applicant", key: "name" },
      { header: "Email", key: "email" }, { header: "Phone", key: "phone", width: 16 }, { header: "Track", key: "track", width: 10 },
      { header: "College", key: "college" }, { header: "City / state", key: "city" }, { header: "Career goal", key: "goal", width: 36 },
      { header: "GitHub", key: "github" }, { header: "Stage", key: "stage", width: 12 }, { header: "Note from applicant", key: "note", width: 36 },
    ],
    rows,
  };
}
