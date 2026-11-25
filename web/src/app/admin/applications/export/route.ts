import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const cell = (v: unknown) => {
  let s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (me?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  const sp = request.nextUrl.searchParams;
  const supabase = await createClient();
  let q = supabase.from("applications").select("*").order("created_at", { ascending: false });
  if (sp.get("track")) q = q.eq("track_id", sp.get("track")!);
  if (sp.get("status")) q = q.eq("status", sp.get("status")!);
  const { data } = await q;
  const cols = ["created_at", "track_id", "status", "full_name", "email", "phone", "gender", "city_state", "college", "reason", "career_goal", "heard_from", "answers"];
  const csv = [cols.join(","), ...(data ?? []).map((r) => cols.map((c) => cell((r as Record<string, unknown>)[c])).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="applications.csv"' } });
}
