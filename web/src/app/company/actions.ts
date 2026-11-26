"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, mails } from "@/lib/email";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function postJob(f: FormData) {
  const me = await requireRole("company");
  const supabase = await createClient();
  const { data: company } = await supabase.from("companies").select("id").eq("user_id", me.id).single();
  if (!company) redirect("/company?err=" + encodeURIComponent("Company profile not found"));
  const { error } = await supabase.from("jobs").insert({
    company_id: company.id, is_special: false, posted_by: me.id,
    title: str(f, "title"), description: str(f, "description"), location: str(f, "location") || null,
    track_id: str(f, "track_id") || null, apply_by: str(f, "apply_by") || null, external_url: str(f, "external_url") || null,
  });
  redirect(error ? `/company?err=${encodeURIComponent(error.message)}` : "/company?ok=" + encodeURIComponent("Job posted"));
}

export async function toggleJob(f: FormData) {
  await requireRole("company");
  const supabase = await createClient();
  await supabase.from("jobs").update({ status: str(f, "status") }).eq("id", str(f, "id"));
  revalidatePath("/company");
}

// Moves an applicant to a new stage and emails them.
export async function moveStage(f: FormData) {
  await requireRole("company");
  const supabase = await createClient();
  const id = str(f, "id");
  const stage = str(f, "stage");
  const { error } = await supabase.from("job_applications").update({ stage }).eq("id", id);
  if (error) redirect("/company/applicants?err=" + encodeURIComponent(error.message));
  const { data: ja } = await supabase
    .from("job_applications")
    .select("jobs(title, companies(name)), enrollees(profiles(full_name, email))")
    .eq("id", id).single();
  const row = ja as unknown as { jobs: { title: string; companies: { name: string } | null }; enrollees: { profiles: { full_name: string | null; email: string } } } | null;
  if (row) {
    const m = mails.stage(row.enrollees.profiles.full_name ?? "there", row.jobs.title, row.jobs.companies?.name ?? "the company", stage);
    await sendEmail(row.enrollees.profiles.email, m);
  }
  revalidatePath("/company/applicants");
  redirect("/company/applicants?ok=" + encodeURIComponent("Stage updated and applicant emailed"));
}
