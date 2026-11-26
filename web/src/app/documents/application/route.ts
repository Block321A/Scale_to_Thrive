import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { renderPdf, safeFile } from "@/lib/pdf";
import { workshopApplicationSpec } from "@/lib/documents";

// Admin-only: a workshop application as a branded PDF.
export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (me?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const supabase = await createClient();
  const { data } = await supabase.from("applications").select("*").eq("id", id).single();
  if (!data) return new NextResponse("Not found", { status: 404 });
  const pdf = await renderPdf(workshopApplicationSpec(data));
  return new NextResponse(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Application-${safeFile(data.full_name)}-${safeFile(data.track_id)}.pdf"`, "Cache-Control": "no-store" },
  });
}
