// Education questions asked in the workshop application and used by the resume.
export const EDUCATION_LEVELS = [
  "B.E. / B.Tech",
  "M.E. / M.Tech",
  "Diploma in Engineering",
  "Integrated or dual degree (B.Tech + M.Tech)",
] as const;

export const EDUCATION_STATUS = [
  { value: "studying", label: "Currently studying" },
  { value: "completed", label: "Completed (passed out)" },
] as const;

// Year choices: past years for people who finished, upcoming years for people still studying.
export function passOutYears(status: string, now = new Date().getFullYear()): number[] {
  return status === "completed"
    ? Array.from({ length: 7 }, (_, i) => now - i)
    : Array.from({ length: 7 }, (_, i) => now + i);
}

export type EducationAnswers = { level: string; branch: string; status: "studying" | "completed"; year: string };

// Validates the education answers on the server. Returns an error message or null.
export function validateEducation(a: Partial<Record<keyof EducationAnswers, string | null>>): string | null {
  if (!a.level || !(EDUCATION_LEVELS as readonly string[]).includes(a.level)) return "Please choose your highest education.";
  if (!a.branch || a.branch.trim().length < 2) return "Please enter your branch or specialization.";
  if (a.status !== "studying" && a.status !== "completed") return "Please tell us whether you are studying or have completed your education.";
  const y = Number(a.year);
  const now = new Date().getFullYear();
  if (!Number.isInteger(y) || y < now - 8 || y > now + 8) return "Please choose a valid year of passing out.";
  return null;
}
