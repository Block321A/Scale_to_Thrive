import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { tracks } from "@/lib/content";
import { clean, wrap, textWidth } from "@/lib/pdf";

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

export async function renderResumePdf(r: Resume): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(clean(`${r.name} - Resume`));
  pdf.setAuthor(clean(r.name));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Layout: one column, real text only (no tables, images or icons), so ATS software reads it correctly.
  const W = 595.28, H = 841.89, M = 50, TOP = 48, BOTTOM = 46, textW = W - 2 * M;
  const SIZE = 10, LEAD = 15;            // body text and line height (1.5)
  const NAVY = rgb(0.118, 0.227, 0.373), INK = rgb(0.13, 0.13, 0.15), GREY = rgb(0.4, 0.4, 0.43), RULE = rgb(0.84, 0.85, 0.88);

  let page = pdf.addPage([W, H]);
  let y = H - TOP;
  const need = (h: number) => { if (y - h < BOTTOM) { page = pdf.addPage([W, H]); y = H - TOP; } };
  const text = (t: string, x: number, size: number, f = font, color = INK) => page.drawText(t, { x, y, size, font: f, color });

  // ---- Name and contact ----
  y -= 22;
  text(clean(r.name), M, 25, bold, NAVY);
  y -= 19;
  for (const l of wrap(r.contact.join("   |   "), font, 9.5, textW)) { text(l, M, 9.5, font, GREY); y -= 14; }
  y -= 4;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.6, color: NAVY });
  y -= 6;

  const heading = (t: string) => {
    need(46);
    y -= 26;
    text(t.toUpperCase(), M, 10.5, bold, NAVY);
    y -= 7;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.7, color: RULE });
    page.drawLine({ start: { x: M, y }, end: { x: M + 30, y }, thickness: 2, color: NAVY });
    y -= 6;
  };
  const gap = (n = 4) => { y -= n; };

  const para = (t: string, f = font, color = INK) => {
    for (const l of wrap(t, f, SIZE, textW)) { need(LEAD); y -= LEAD; text(l, M, SIZE, f, color); }
  };
  // "Label: value". The label is bold; wrapped lines return to the left margin (or a hanging indent for bullets).
  const labelled = (label: string, value: string, bullet = false) => {
    const x0 = bullet ? M + 12 : M;
    const lab = `${clean(label)}: `;
    const lw = textWidth(bold, lab, SIZE);
    const words = wrap(value, font, SIZE, textW - (x0 - M) - lw - 3);
    const firstLine = words[0] ?? "";
    const rest = wrap(words.slice(1).join(" "), font, SIZE, textW - (x0 - M)).filter(Boolean);
    need(LEAD);
    y -= LEAD;
    if (bullet) page.drawCircle({ x: M + 3, y: y + 3.4, size: 1.8, color: NAVY });
    text(lab, x0, SIZE, bold);
    page.drawText(firstLine, { x: x0 + lw + 3, y, size: SIZE, font, color: INK });
    for (const l of rest) { need(LEAD); y -= LEAD; text(l, x0, SIZE); }
    gap(3);
  };
  const bullet = (t: string) => {
    wrap(t, font, SIZE, textW - 12).forEach((l, i) => { need(LEAD); y -= LEAD; if (i === 0) page.drawCircle({ x: M + 3, y: y + 3.4, size: 1.8, color: NAVY }); text(l, M + 12, SIZE); });
    gap(2);
  };

  heading("Professional Summary");
  gap(2);
  para(r.summary);

  heading("Technical Skills");
  gap(2);
  r.skills.forEach(([a, b]) => labelled(a, b));

  heading("Projects");
  gap(2);
  r.projects.forEach(([a, b]) => labelled(a, b, true));

  heading("Education");
  gap(2);
  r.education.forEach((e, i) => { need(LEAD); y -= LEAD; wrap(e, i === 0 ? bold : font, SIZE + (i === 0 ? 0.5 : 0), textW).forEach((l, k) => { if (k) y -= LEAD; text(l, M, SIZE + (i === 0 ? 0.5 : 0), i === 0 ? bold : font, i === 2 ? GREY : INK); }); });

  heading("Training");
  gap(2);
  r.training.forEach((t) => bullet(t));

  if (r.additional.length) {
    heading("Additional Information");
    gap(2);
    r.additional.forEach(([a, b]) => labelled(a, b));
  }
  return pdf.save();
}
