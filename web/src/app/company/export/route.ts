import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, XLSX_TYPE } from "@/lib/xlsx";
import { companyApplicantsSheet, normTrack } from "@/lib/exports";

// A company downloads its own applicants as an Excel file.
export async function GET(request: NextRequest) {
  const track = normTrack(request.nextUrl.searchParams.get("track"));
  const me = await getProfile();
  if (me?.role !== "company") return new NextResponse("Forbidden", { status: 403 });
  const supabase = await createClient();
  const companyId = (await supabase.rpc("my_company_id")).data as string | null;
  if (!companyId) return new NextResponse("Company not found", { status: 404 });
  const file = await buildWorkbook([await companyApplicantsSheet(supabase, companyId, track)]);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(file), {
    headers: { "Content-Type": XLSX_TYPE, "Content-Disposition": `attachment; filename="Applicants${track ? "-" + (track === "it" ? "IT" : "Non-IT") : ""}-${stamp}.xlsx"`, "Cache-Control": "no-store" },
  });
}
