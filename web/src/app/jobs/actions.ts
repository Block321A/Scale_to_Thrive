"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, mails } from "@/lib/email";

export async function applyToJob(f: FormData) {
  const me = await requireRole("enrollee");
  const supabase = await createClient();
  const jobId = String(f.get("job_id"));
  const note = String(f.get("note") ?? "").trim() || null;
  const { error } = await supabase.from("job_applications").insert({ job_id: jobId, enrollee_id: me.id, note });
  if (error) redirect("/jobs?err=" + encodeURIComponent(error.code === "23505" ? "You already applied for this job." : "Could not apply. The job may be closed."));
  const { data: job } = await supabase.from("jobs").select("title, companies(name)").eq("id", jobId).single();
  const j = job as unknown as { title: string; companies: { name: string } | null } | null;
  const m = mails.jobApplied(me.full_name ?? "there", j?.title ?? "the job", j?.companies?.name ?? "Scale to Thrive");
  await sendEmail(me.email, m.subject, m.text);
  redirect("/jobs?ok=" + encodeURIComponent("Applied. A confirmation email is on its way."));
}
