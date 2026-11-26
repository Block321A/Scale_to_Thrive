import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, XLSX_TYPE, type SheetSpec } from "@/lib/xlsx";
import { adminsSheet, applicationsSheet, companiesSheet, enrolleesSheet, jobApplicationsSheet, jobsSheets, normTrack } from "@/lib/exports";

// Admin-only Excel exports. /admin/export?type=applications|enrollees|companies|admins|jobs|members
export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (me?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const sp = request.nextUrl.searchParams;
  const type = sp.get("type") ?? "applications";
  const track = normTrack(sp.get("track"));
  const supabase = await createClient();

  let sheets: SheetSpec[];
  if (type === "applications") sheets = [await applicationsSheet(supabase, { track: sp.get("track") ?? "", status: sp.get("status") ?? "", q: sp.get("q") ?? "" })];
  else if (type === "enrollees") sheets = [await enrolleesSheet(supabase, track)];
  else if (type === "job-applications") sheets = [await jobApplicationsSheet(supabase, track)];
  else if (type === "companies") sheets = [await companiesSheet(supabase)];
  else if (type === "admins") sheets = [await adminsSheet(supabase)];
  else if (type === "jobs") sheets = await jobsSheets(supabase);
  else if (type === "members") sheets = [await enrolleesSheet(supabase), await companiesSheet(supabase), await adminsSheet(supabase)];
  else return new NextResponse("Unknown export", { status: 400 });

  const file = await buildWorkbook(sheets);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(file), {
    headers: { "Content-Type": XLSX_TYPE, "Content-Disposition": `attachment; filename="Scale-to-Thrive-${type}${track ? "-" + (track === "it" ? "IT" : "Non-IT") : ""}-${stamp}.xlsx"`, "Cache-Control": "no-store" },
  });
}
