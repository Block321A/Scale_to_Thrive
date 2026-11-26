import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { tracks } from "@/lib/content";
import { clean, wrap } from "@/lib/pdf";

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
  const goal = i.goal && i.goal.trim().length >= 3 ? ` Career objective: ${i.goal.trim().replace(/\.$/, "")}.` : "";
  const area = !it && i.details.career_area ? ` Interested in ${i.details.career_area} roles.` : "";
  const summary = it
    ? `Engineering graduate and Scale to Thrive IT-track trainee with hands-on training in Linux administration, Shell scripting, Python automation, REST APIs and PostgreSQL. ${exp}Seeking an entry-level role such as ${roles}.${goal}`
    : `Engineering graduate and Scale to Thrive Non-IT-track trainee with hands-on training in Advanced Excel, MIS reporting, dashboards, Power Query and business communication. ${exp}Seeking an entry-level role such as ${roles}.${area}${goal}`;

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
    education: ["Bachelor of Engineering / Technology (B.E. / B.Tech)", `${i.college}${i.city ? `, ${i.city}` : ""}`],
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
    { name: "Education", got: i.college ? 10 : 0, max: 10, tip: i.college ? undefined : "Add your college name." },
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

export async function renderResumePdf(r: Resume): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(clean(`${r.name} - Resume`));
  pdf.setAuthor(clean(r.name));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, M = 50, textW = W - 2 * M;
  const INK = rgb(0.1, 0.1, 0.1), GREY = rgb(0.35, 0.35, 0.35);
  let page = pdf.addPage([W, H]);
  let y = H - M;

  const need = (h: number) => { if (y - h < M) { page = pdf.addPage([W, H]); y = H - M; } };
  const line = (text: string, x: number, size: number, f = font, color = INK) => { page.drawText(text, { x, y, size, font: f, color }); };

  // Name and contact
  need(40);
  y -= 20;
  line(clean(r.name), M, 20, bold);
  y -= 16;
  for (const l of wrap(r.contact.join("  |  "), font, 10, textW)) { need(14); line(l, M, 10, font, GREY); y -= 13; }
  y -= 6;

  const heading = (t: string) => {
    need(40);
    y -= 8;
    line(t.toUpperCase(), M, 11, bold);
    y -= 4;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
  };
  const para = (t: string) => { for (const l of wrap(t, font, 10.5, textW)) { need(15); line(l, M, 10.5); y -= 14.5; } };
  // "Label: text" with the label in bold and the text wrapped under it
  const labelled = (label: string, text: string, bullet = false) => {
    const prefix = bullet ? "- " : "";
    const lab = `${prefix}${clean(label)}: `;
    const lw = bold.widthOfTextAtSize(lab, 10.5);
    const first = wrap(text, font, 10.5, textW - lw - 3);
    need(15);
    line(lab, M, 10.5, bold);
    page.drawText(first[0] ?? "", { x: M + lw + 3, y, size: 10.5, font, color: INK });
    y -= 14.5;
    const rest = first.slice(1).join(" ");
    if (rest) for (const l of wrap(rest, font, 10.5, textW - 12)) { need(15); line(l, M + 12, 10.5); y -= 14.5; }
  };
  const bullet = (t: string) => {
    const ls = wrap(t, font, 10.5, textW - 12);
    ls.forEach((l, i) => { need(15); if (i === 0) line("-", M, 10.5); line(l, M + 12, 10.5); y -= 14.5; });
  };

  heading("Professional Summary");
  para(r.summary);
  heading("Technical Skills");
  r.skills.forEach(([a, b]) => labelled(a, b));
  heading("Projects");
  r.projects.forEach(([a, b]) => labelled(a, b, true));
  heading("Education");
  r.education.forEach((e) => para(e));
  heading("Training");
  r.training.forEach((t) => bullet(t));
  if (r.additional.length) { heading("Additional Information"); r.additional.forEach(([a, b]) => labelled(a, b)); }

  return pdf.save();
}
