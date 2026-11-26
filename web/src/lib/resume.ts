import { tracks } from "@/lib/content";

// Resume built from the student's workshop application. Plain, single column, standard fonts,
// no images or tables, so applicant tracking systems (ATS) can read it. No logos on purpose.

export type ResumeInput = {
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  college: string;
  track: "it" | "non-it";
  goal: string | null;
  github: string | null;
  details: Record<string, string | null>; // answers from the workshop application
  completedWeeks: number[];                // week numbers marked completed
};

export type Resume = {
  name: string;
  contact: string[];
  summary: string;
  skills: [string, string][];
  projects: [string, string][];
  education: string[];
  training: string[];
  additional: [string, string][];
};

const SKILL_GROUPS: Record<"it" | "non-it", [string, string][]> = {
  it: [
    ["Operating Systems and Scripting", "Linux administration, users and permissions, systemd services, SSH, Bash/Shell scripting, cron, grep, awk, sed"],
    ["Programming", "Python, object-oriented programming, file handling, CSV and JSON processing, exception handling, logging, automation"],
    ["Databases and APIs", "PostgreSQL, SQL, joins, CRUD operations, REST API, HTTP methods, JSON, Postman, Python Requests"],
    ["Tools and Cloud", "Git, GitHub, AWS S3, AWS CLI, Boto3, IAM basics, unit testing"],
    ["Productivity", "AI-assisted coding and debugging, technical documentation"],
  ],
  "non-it": [
    ["Spreadsheet Analysis", "Advanced Excel, formulas (IF, IFS, SUMIFS, COUNTIFS), lookups (VLOOKUP, XLOOKUP, INDEX MATCH), data cleaning, data validation"],
    ["Reporting and Dashboards", "MIS reporting, PivotTables, PivotCharts, slicers, KPI dashboards, conditional formatting"],
    ["Data Preparation and Automation", "Power Query, data consolidation, macros, VBA basics"],
    ["Business Communication", "Report explanation, presentations, professional email writing, meetings, interview skills"],
  ],
};

const track = (id: "it" | "non-it") => tracks.find((t) => t.id === id)!;
const cap = (s: string | null | undefined) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const nice = (a: string[]) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} or ${a[a.length - 1]}` : a[0] ?? "");

export function buildResume(i: ResumeInput): Resume {
  const t = track(i.track);
  const it = i.track === "it";
  const roles = nice(t.roles.slice(0, 3));
  const exp = i.details.experience ? `${cap(i.details.experience)} ${it ? "programming" : "Excel"} foundation. ` : "";
  const lvl = i.details.education_level ?? "";
  const branch = i.details.branch ?? "";
  const status = i.details.education_status ?? "";
  const year = i.details.passout_year ?? "";
  const who = status === "completed" ? "Engineering graduate" : status === "studying" ? "Engineering student" : "Engineering candidate";
  const goal = i.goal && i.goal.trim().length >= 3 ? ` Career objective: ${i.goal.trim().replace(/\.$/, "")}.` : "";
  const area = !it && i.details.career_area ? ` Interested in ${i.details.career_area} roles.` : "";
  const summary = it
    ? `${who} and Scale to Thrive IT-track trainee with hands-on training in Linux administration, Shell scripting, Python automation, REST APIs and PostgreSQL. ${exp}Seeking an entry-level role such as ${roles}.${goal}`
    : `${who} and Scale to Thrive Non-IT-track trainee with hands-on training in Advanced Excel, MIS reporting, dashboards, Power Query and business communication. ${exp}Seeking an entry-level role such as ${roles}.${area}${goal}`;

  const skills = [...SKILL_GROUPS[i.track]];
  if (it && i.details.tools?.trim()) skills.push(["Additional tools (self-reported)", i.details.tools.trim()]);

  const done = t.weeks.filter((w) => i.completedWeeks.includes(w.week)).map((w) => w.title);
  const training = [
    `Scale to Thrive ${it ? "IT Skills Development Program" : "Advanced Excel and Corporate Readiness Program"}. 12-week hybrid program, ${t.hours} guided hours.`,
    `Progress: ${done.length} of 12 weekly modules completed${done.length ? "" : " (in progress)"}.`,
    ...(done.length ? [`Modules completed: ${done.join(", ")}.`] : []),
  ];

  const github = (i.github ?? i.details.github_url ?? "").trim();
  const contact = [i.city, i.email, i.phone, github ? `GitHub: ${github}` : null].filter(Boolean) as string[];
  const additional: [string, string][] = [];
  if (!it && i.details.english) additional.push(["Languages", `English (${cap(i.details.english)})`]);

  return {
    name: i.name,
    contact,
    summary,
    skills,
    projects: t.projects.map((p) => [p.title, p.text]),
    education: [
      lvl ? `${lvl}${branch ? ` in ${branch}` : ""}` : "Bachelor of Engineering / Technology (B.E. / B.Tech)",
      `${i.college}${i.city ? `, ${i.city}` : ""}`,
      ...(year ? [status === "completed" ? `Graduated: ${year}` : `Expected graduation: ${year}`] : []),
    ],
    training,
    additional,
  };
}

export type AtsCheck = { name: string; got: number; max: number; tip?: string };

export function scoreResume(i: ResumeInput, r: Resume): { score: number; label: string; checks: AtsCheck[] } {
  const it = i.track === "it";
  const skillCount = r.skills.reduce((n, [, v]) => n + v.split(",").length, 0);
  const done = i.completedWeeks.length;
  const hasGoal = !!i.goal && i.goal.trim().length >= 10;
  const github = (i.github ?? i.details.github_url ?? "").trim();
  const contactPts = (i.name ? 5 : 0) + (i.email ? 5 : 0) + (i.phone ? 5 : 0);

  const checks: AtsCheck[] = [
    { name: "Contact details (name, email, phone)", got: contactPts, max: 15, tip: contactPts < 15 ? "Add your phone number to your profile." : undefined },
    { name: "Location", got: i.city ? 5 : 0, max: 5, tip: i.city ? undefined : "Add your city and state." },
    { name: "Professional summary", got: 10, max: 10 },
    { name: "Career objective in your own words", got: hasGoal ? 5 : 0, max: 5, tip: hasGoal ? undefined : "Write a clear career goal (at least one full sentence)." },
    { name: "Skills section with relevant keywords", got: Math.round(20 * Math.min(skillCount, 25) / 25), max: 20, tip: skillCount < 25 ? "Add the languages and tools you know in your profile." : undefined },
    {
      name: "Education (college, degree, branch, passing-out year)",
      got: (i.college ? 4 : 0) + (i.details.education_level && i.details.branch ? 3 : 0) + (i.details.passout_year ? 3 : 0),
      max: 10,
      tip: i.details.education_level && i.details.passout_year ? undefined : "Your application did not include your highest education and passing-out year. Ask the Scale to Thrive team to add them.",
    },
    { name: "Projects", got: Math.round(10 * Math.min(r.projects.length, 3) / 3), max: 10 },
    { name: "Training progress", got: Math.round(10 * done / 12), max: 10, tip: done < 12 ? `Complete more weekly modules (${done} of 12 done). Your resume lists every module you complete.` : undefined },
    it
      ? { name: "Online profile (GitHub)", got: github ? 5 : 0, max: 5, tip: github ? undefined : "Add your GitHub link. Recruiters check it for IT roles." }
      : { name: "Communication level stated", got: i.details.english ? 5 : 0, max: 5, tip: i.details.english ? undefined : "State your English communication level." },
    { name: "ATS-friendly format (single column, standard fonts, no images)", got: 10, max: 10 },
  ];
  const score = checks.reduce((n, c) => n + c.got, 0);
  return { score, label: score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs work", checks };
}
