import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, XLSX_TYPE } from "@/lib/xlsx";
import { companyApplicantsSheet } from "@/lib/exports";

// A company downloads its own applicants as an Excel file.
export async function GET() {
  const me = await getProfile();
  if (me?.role !== "company") return new NextResponse("Forbidden", { status: 403 });
  const supabase = await createClient();
  const companyId = (await supabase.rpc("my_company_id")).data as string | null;
  if (!companyId) return new NextResponse("Company not found", { status: 404 });
  const file = await buildWorkbook([await companyApplicantsSheet(supabase, companyId)]);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(file), {
    headers: { "Content-Type": XLSX_TYPE, "Content-Disposition": `attachment; filename="Applicants-${stamp}.xlsx"`, "Cache-Control": "no-store" },
  });
}
