import type { PdfSpec } from "@/lib/pdf";

const trackName = (id: string | null | undefined) => (id === "it" ? "IT" : id === "non-it" ? "Non-IT" : "Both tracks");
const when = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
const day = (v: string | null | undefined) => (v ? new Date(v + (v.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "");
const yes = (b: unknown) => (b ? "Yes" : "No");
const cap = (s: string | null | undefined) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

type A = Record<string, unknown>;

export function workshopApplicationSpec(a: A): PdfSpec {
  const ans = (a.answers ?? {}) as Record<string, string | null>;
  const it = a.track_id === "it";
  return {
    docType: "Chariot application",
    title: String(a.full_name ?? "Applicant"),
    subtitle: `${trackName(a.track_id as string)} track chariot. Submitted on ${when(a.created_at as string)}`,
    badge: String(a.status ?? ""),
    sections: [
      { heading: "Applicant", rows: [
        ["Full name", String(a.full_name ?? "")], ["Email", String(a.email ?? "")], ["Phone / WhatsApp", String(a.phone ?? "")],
        ["Date of birth", day(a.date_of_birth as string)], ["Gender", String(a.gender ?? "")], ["City / state", String(a.city_state ?? "")],
      ] },
      { heading: "Education", rows: [
        ["College / institution", String(a.college ?? "")], ["Highest education", ans.education_level ?? ""], ["Branch / specialization", ans.branch ?? ""],
        ["Education status", ans.education_status === "completed" ? "Completed (passed out)" : ans.education_status === "studying" ? "Currently studying" : ""],
        [ans.education_status === "completed" ? "Year of passing out" : "Expected year of passing out", ans.passout_year ?? ""],
      ] },
      { heading: "Experience", rows: it
        ? [["Programming experience", cap(ans.experience)], ["Languages and tools", ans.tools ?? ""], ["GitHub profile", ans.github_url ?? ""]]
        : [["Excel experience", cap(ans.experience)], ["English communication", cap(ans.english)], ["Preferred career area", ans.career_area ?? ""]] },
      { heading: "About the applicant", rows: [
        ["Why they want to join", String(a.reason ?? "")], ["Career goal", String(a.career_goal ?? "")], ["Heard about us from", String(a.heard_from ?? "")],
      ] },
      { heading: "Documents", rows: [["Resume", a.resume_path ? "Uploaded" : "Not uploaded"], ["Photo", a.photo_path ? "Uploaded" : "Not uploaded"]] },
      { heading: "Declarations", rows: [
        ["Engineering student or recent graduate", yes(a.confirmed_eligibility)], ["Can attend all sessions", yes(a.confirmed_attendance)],
        ["Understands placement is not guaranteed", yes(a.confirmed_no_guarantee)], ["Consent to data use and sharing with hiring companies", yes(a.consent_data_sharing)],
      ] },
      { heading: "Review", rows: [["Status", cap(String(a.status ?? ""))], ["Reviewed on", when(a.reviewed_at as string)]] },
    ],
  };
}

export function jobApplicationSpec(a: A): PdfSpec {
  const j = (a.jobs ?? {}) as { title?: string; location?: string; track_id?: string; is_special?: boolean; companies?: { name?: string } | null };
  const e = (a.enrollees ?? {}) as { track_id?: string; college?: string; city_state?: string; date_of_birth?: string; gender?: string; career_goal?: string; github_url?: string; profiles?: Record<string, string | null> };
  const p = e.profiles ?? {};
  const company = j.is_special ? "Scale to Thrive" : j.companies?.name ?? "";
  return {
    docType: "Job application",
    title: String(p.full_name ?? "Applicant"),
    subtitle: `Applied for ${j.title ?? ""} at ${company} on ${when(a.created_at as string)}`,
    badge: String(a.stage ?? ""),
    sections: [
      { heading: "Job", rows: [
        ["Job title", j.title ?? ""], ["Company", company], ["Location", j.location ?? ""], ["Open to", trackName(j.track_id)],
        ["Applied on", when(a.created_at as string)], ["Current status", cap(String(a.stage ?? ""))],
      ] },
      { heading: "Applicant", rows: [
        ["Full name", p.full_name ?? ""], ["Email", p.email ?? ""], ["Phone", p.phone ?? ""], ["Chariot track", trackName(e.track_id)],
        ["College / institution", e.college ?? ""], ["City / state", e.city_state ?? ""], ["Date of birth", day(e.date_of_birth)], ["Gender", e.gender ?? ""],
        ["Career goal", e.career_goal ?? ""], ["GitHub profile", e.github_url ?? ""],
      ] },
      { heading: "Note from the applicant", rows: [["Note", String(a.note ?? "")]] },
      { heading: "Consent", rows: [["Profile sharing", "The applicant agreed that their complete Scale to Thrive profile is shared with the company for this application."]] },
    ],
  };
}
