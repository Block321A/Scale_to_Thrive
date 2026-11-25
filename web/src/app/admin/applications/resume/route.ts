import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

// Admin-only: redirects to a short-lived signed link for a private resume.
export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (me?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const path = request.nextUrl.searchParams.get("path") ?? "";
  const { data } = await createAdminClient().storage.from("resumes").createSignedUrl(path, 60);
  return data ? NextResponse.redirect(data.signedUrl) : new NextResponse("Not found", { status: 404 });
}
