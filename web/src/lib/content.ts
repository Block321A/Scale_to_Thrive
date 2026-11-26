// Content from the two proposals (docs/program-reference.md).
// TODO: move to the database so admins can edit dates, seats and handlers.

export type TrackId = "it" | "non-it";

export type Handler = { name: string; designation: string; org: string; photo: string };

export type Track = {
  id: TrackId;
  name: string;
  tagline: string;
  summary: string;
  hours: number;
  hoursPerWeek: number;
  delivery: string;
  image: string;
  skills: string[];
  roles: string[];
  projects: { title: string; text: string }[];
  weeks: { week: number; title: string; text: string }[];
  assessment: { area: string; weight: number }[];
  // Admin-controlled (placeholder values until the admin panel exists)
  openingDate: string;
  seatsTotal: number;
  seatsFilled: number;
  applicationsOpen: boolean;
  handlers: Handler[];
};

const handlers: Handler[] = [
  { name: "Dr. Arjun U", designation: "HOD of CE · Principal VGST Project Handler", org: "PES ITM and PES Center of Excellence", photo: "" },
  { name: "Prajwal A", designation: "VGST Project Assistant · SDE Research Analyst", org: "PES Center of Excellence", photo: "" },
];

export const tracks: Track[] = [
  {
    id: "it",
    name: "IT",
    tagline: "Master the skills. Build your future.",
    summary:
      "Linux administration, Python automation and junior Python development, with REST API, PostgreSQL, Git, AWS S3 and AI productivity skills.",
    hours: 96,
    hoursPerWeek: 8,
    delivery: "2 online sessions × 2 hours + 1 offline lab × 4 hours, every week",
    image: "/images/code-screen.jpg",
    skills: ["Linux", "Shell scripting", "Python", "REST API", "PostgreSQL", "Git & GitHub", "AWS S3", "AI productivity"],
    roles: ["Junior Linux Administrator", "Linux Support Engineer – L1", "Python Automation Engineer – Trainee", "Junior Automation Engineer", "Junior Python Developer", "Python Developer – Trainee"],
    projects: [
      { title: "Linux Server Monitoring", text: "A toolkit that checks CPU, memory and disk usage, inspects processes and logs, and produces a health report." },
      { title: "Python Automation Toolkit", text: "Scripts for file organisation, CSV/JSON processing, API data extraction, logging and optional S3 transfer." },
      { title: "Employee Data Application", text: "A Python and PostgreSQL application with validation, error handling and REST API practice." },
    ],
    weeks: [
      { week: 1, title: "Linux Fundamentals", text: "Distributions, lab setup, terminal, commands, file-system navigation." },
      { week: 2, title: "Linux Administration", text: "Users, groups, sudo, permissions, ownership, package management." },
      { week: 3, title: "Advanced Linux Administration", text: "Processes, services, systemd, SSH, networking, storage, logs." },
      { week: 4, title: "Shell Scripting", text: "Bash variables, input/output, conditions, loops, functions." },
      { week: 5, title: "Shell Automation", text: "grep, awk, sed, find, cron, backups, monitoring scripts." },
      { week: 6, title: "Python Fundamentals", text: "Data types, conditions, loops, functions, collections." },
      { week: 7, title: "Intermediate Python", text: "OOP, modules, exceptions, files, CSV, JSON, Git basics." },
      { week: 8, title: "Python Automation", text: "pathlib, shutil, subprocess, regex, logging, task automation." },
      { week: 9, title: "PostgreSQL & REST API", text: "SQL, CRUD, joins, HTTP methods, status codes, Postman, Requests." },
      { week: 10, title: "Python Integration & Testing", text: "Database connectivity, API integration, reusable code, testing." },
      { week: 11, title: "AWS S3 & Integration Projects", text: "S3, IAM basics, AWS CLI, Boto3, integrated project." },
      { week: 12, title: "AI for IT Professionals", text: "AI-assisted workflows, debugging, test generation, safe validation." },
    ],
    assessment: [
      { area: "Technical quizzes", weight: 10 },
      { area: "Weekly hands-on assignments", weight: 20 },
      { area: "Module practical assessments", weight: 20 },
      { area: "Project implementation and demo", weight: 30 },
      { area: "Technical interview and project explanation", weight: 20 },
    ],
    openingDate: "2026-12-15",
    seatsTotal: 60,
    seatsFilled: 0,
    applicationsOpen: true,
    handlers,
  },
  {
    id: "non-it",
    name: "Non-IT",
    tagline: "Turn spreadsheet skills into career opportunities.",
    summary:
      "Advanced Excel, MIS reporting and business data analysis, combined with a weekly communication module, for business and corporate roles.",
    hours: 60,
    hoursPerWeek: 5,
    delivery: "1 hour hybrid communication + 1 hour online Excel + 3 hours offline lab, every week",
    image: "/images/laptop-analytics.jpg",
    skills: ["Advanced formulas", "Lookups", "PivotTables", "Dashboards", "Power Query", "Macros & VBA", "Data cleaning", "Communication"],
    roles: ["MIS Executive", "Reporting Analyst – Trainee", "Data Analyst – Trainee", "Operations Executive", "HR Operations Executive", "Sales Reporting Executive"],
    projects: [
      { title: "MIS Reporting Dashboard", text: "A monthly performance report with KPIs, PivotTables, charts and slicers." },
      { title: "Sales Analysis & Target Tracker", text: "Targets vs actuals by region and product, with trends." },
      { title: "HR Attendance & Payroll Tracker", text: "Attendance, leave summaries, lookups and payroll-support calculations." },
      { title: "Inventory & Purchase Report", text: "Stock tracker with reorder indicators and purchase summaries." },
      { title: "Power Query Data Consolidation", text: "Combine and refresh multiple monthly files into one report." },
    ],
    weeks: [
      { week: 1, title: "Excel Foundations", text: "Workbooks, tables, references, formatting, shortcuts." },
      { week: 2, title: "Data Entry & Cleaning", text: "Sorting, filtering, duplicates, Text to Columns, Flash Fill." },
      { week: 3, title: "Formula Fundamentals", text: "References, IF, IFS, AND, OR, error handling." },
      { week: 4, title: "Conditional & Summary Formulas", text: "SUMIFS, COUNTIFS, AVERAGEIFS, SUBTOTAL." },
      { week: 5, title: "Lookup Functions", text: "VLOOKUP, HLOOKUP, XLOOKUP, INDEX, MATCH." },
      { week: 6, title: "Text, Date & Logical Functions", text: "LEFT, MID, TEXTJOIN, EOMONTH, NETWORKDAYS." },
      { week: 7, title: "Data Validation & Conditional Formatting", text: "Dropdowns, input rules, highlighting exceptions." },
      { week: 8, title: "PivotTables & PivotCharts", text: "Summaries, grouping, slicers, refreshable reports." },
      { week: 9, title: "Dashboard Development", text: "KPIs, charts, layouts, communicating findings." },
      { week: 10, title: "Power Query", text: "Import, clean, merge and append, refresh." },
      { week: 11, title: "Macros & VBA Introduction", text: "Record macros, the VBA editor, safe automation." },
      { week: 12, title: "Integrated Projects & Assessment", text: "Business reporting project, presentation, assessment." },
    ],
    assessment: [
      { area: "Concept checks and weekly quizzes", weight: 10 },
      { area: "Weekly Excel exercises", weight: 20 },
      { area: "Module practical assessments", weight: 20 },
      { area: "Project implementation and demo", weight: 30 },
      { area: "Communication, presentation and project explanation", weight: 20 },
    ],
    openingDate: "2026-12-15",
    seatsTotal: 60,
    seatsFilled: 0,
    applicationsOpen: false,
    handlers,
  },
];

export const partners = [
  { name: "Anvesana", file: "/logos/poster-crop-anvesana.png" },
  { name: "K-tech", file: "/logos/poster-crop-k-tech.png" },
  { name: "Government of Karnataka", file: "/logos/poster-crop-govt-karnataka.png" },
  { name: "Startup Karnataka", file: "/logos/startup-karnataka.png" },
  { name: "PES Trust", file: "/logos/poster-crop-pes-trust.png" },
];

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
