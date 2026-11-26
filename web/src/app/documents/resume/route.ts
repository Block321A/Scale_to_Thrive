import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildResume, type ResumeInput } from "@/lib/resume";
import { renderResumePdf } from "@/lib/resume-pdf";
import { safeFile } from "@/lib/pdf";
import { loadResumeInput } from "@/lib/resume-data";

// An enrolled student downloads their own resume, built from their workshop application.
export async function GET() {
  const me = await getProfile();
  if (me?.role !== "enrollee") return new NextResponse("Forbidden", { status: 403 });
  const supabase = await createClient();
  const input: ResumeInput | null = await loadResumeInput(supabase, me);
  if (!input) return new NextResponse("Profile not found", { status: 404 });
  const pdf = await renderResumePdf(buildResume(input));
  return new NextResponse(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Resume-${safeFile(input.name)}.pdf"`, "Cache-Control": "no-store" },
  });
}
