import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// A company may open a resume only if that enrollee applied to one of its jobs (row level security enforces it).
export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (me?.role !== "company") return new NextResponse("Forbidden", { status: 403 });
  const path = request.nextUrl.searchParams.get("path") ?? "";
  const supabase = await createClient();
  const { data: allowed } = await supabase.from("enrollees").select("id").eq("resume_path", path).limit(1);
  if (!allowed?.length) return new NextResponse("Forbidden", { status: 403 });
  const { data } = await createAdminClient().storage.from("resumes").createSignedUrl(path, 60);
  return data ? NextResponse.redirect(data.signedUrl) : new NextResponse("Not found", { status: 404 });
}
