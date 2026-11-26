import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { renderPdf, safeFile } from "@/lib/pdf";
import { roundPhotoFromUrl } from "@/lib/photo";
import { jobApplicationSpec } from "@/lib/documents";

// A job application as a branded PDF. Row level security decides who may read it:
// the applicant, the company that owns the job, and admins.
export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (!me) return new NextResponse("Forbidden", { status: 403 });
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_applications")
    .select("id, stage, note, created_at, jobs(title, location, track_id, is_special, companies(name)), enrollees(track_id, college, city_state, date_of_birth, gender, career_goal, github_url, profiles(full_name, email, phone, photo_url))")
    .eq("id", id)
    .single();
  if (!data) return new NextResponse("Not found", { status: 404 });
  const rec = data as unknown as { jobs?: { title?: string }; enrollees?: { profiles?: { full_name?: string; photo_url?: string | null } } };
  const photo = await roundPhotoFromUrl(rec.enrollees?.profiles?.photo_url);
  const pdf = await renderPdf({ ...jobApplicationSpec(data as unknown as Record<string, unknown>), photo: photo ?? undefined });
  const name = `${safeFile(rec.enrollees?.profiles?.full_name ?? "Applicant")}-${safeFile(rec.jobs?.title ?? "Job")}`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Job-Application-${name}.pdf"`, "Cache-Control": "no-store" },
  });
}
