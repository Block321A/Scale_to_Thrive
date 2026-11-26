"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, mails } from "@/lib/email";
import { inviteUser, sendPasswordLink } from "@/lib/invite";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const back = (path: string, msg: string, ok = true) => redirect(`${path}?${ok ? "ok" : "err"}=${encodeURIComponent(msg)}`);

// ---- Tracks and handlers -------------------------------------------------
export async function updateTrack(f: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("tracks").update({
    opening_date: str(f, "opening_date") || null,
    seats_total: Number(f.get("seats_total")) || 0,
    applications_open: f.get("applications_open") === "on",
  }).eq("id", str(f, "id"));
  revalidatePath("/", "layout");
  back("/admin/tracks", error ? error.message : "Saved", !error);
}

export async function saveHandler(f: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const row = { track_id: str(f, "track_id"), name: str(f, "name"), designation: str(f, "designation") || null, org: str(f, "org") || null, sort_order: Number(f.get("sort_order")) || 0 };
  const id = str(f, "id");
  const { error } = id ? await supabase.from("handlers").update(row).eq("id", id) : await supabase.from("handlers").insert(row);
  revalidatePath("/", "layout");
  back("/admin/tracks", error ? error.message : "Handler saved", !error);
}

export async function deleteHandler(f: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("handlers").delete().eq("id", str(f, "id"));
  revalidatePath("/", "layout");
  back("/admin/tracks", "Handler removed");
}

// ---- Applications --------------------------------------------------------
export async function setApplicationStatus(f: FormData) {
  const me = await requireRole("admin");
  const supabase = await createClient();
  const id = str(f, "id");
  const status = str(f, "status");
  const { data: app, error } = await supabase.from("applications")
    .update({ status, reviewed_by: me.id, reviewed_at: new Date().toISOString() })
    .eq("id", id).select("full_name, email, track_id").single();
  if (error || !app) return back("/admin/applications", error?.message ?? "Failed", false);
  if (status === "rejected") {
    const m = mails.rejected(app.full_name, app.track_id === "it" ? "IT" : "Non-IT");
    await sendEmail(app.email, m);
  }
  revalidatePath("/admin/applications");
  back("/admin/applications", status === "rejected" ? "Rejected and emailed" : "Updated");
}

// One click: finalize (checks seats), email the set-password link, build the enrollee profile.
export async function finalizeApplication(f: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = str(f, "id");
  const { error } = await supabase.rpc("finalize_application", { app_id: id });
  if (error) return back("/admin/applications", error.message, false);

  const admin = createAdminClient();
  const { data: app } = await admin.from("applications").select("full_name, email, photo_path, track_id").eq("id", id).single();
  if (!app) return back("/admin/applications", "Application not found", false);

  const invited = await inviteUser(app.email, app.full_name, { kind: "enrollee", track: app.track_id === "it" ? "IT" : "Non-IT" });
  if (!invited.ok) {
    await admin.from("applications").update({ status: "shortlisted" }).eq("id", id);
    return back("/admin/applications", "Invite failed: " + invited.error, false);
  }
  const uid = invited.userId;
  const created = await admin.rpc("create_enrollee", { app_id: id, uid });
  if (created.error) return back("/admin/applications", "Profile setup failed: " + created.error.message, false);
  if (app.photo_path) {
    const { data } = admin.storage.from("photos").getPublicUrl(app.photo_path);
    await admin.from("profiles").update({ photo_url: data.publicUrl }).eq("id", uid);
  }
  revalidatePath("/admin", "layout");
  back("/admin/applications", invited.emailed ? "Finalized. Set-password email sent." : "Finalized, but the email could not be sent. Use Resend on the Enrollees page.", invited.emailed);
}

// ---- Enrollees -----------------------------------------------------------
export async function setMilestone(f: FormData) {
  const me = await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("enrollee_milestones")
    .update({ status: str(f, "status"), updated_by: me.id, updated_at: new Date().toISOString() })
    .eq("enrollee_id", str(f, "enrollee_id")).eq("week", Number(f.get("week")));
  revalidatePath("/admin/enrollees");
  redirect(`/admin/enrollees?open=${str(f, "enrollee_id")}`);
}

export async function resendLink(f: FormData) {
  await requireRole("admin");
  await sendPasswordLink(str(f, "email"));
  back(str(f, "from") || "/admin/enrollees", "Set-password email sent");
}

// ---- Companies -----------------------------------------------------------
export async function createCompany(f: FormData) {
  const me = await requireRole("admin");
  const admin = createAdminClient();
  const name = str(f, "name");
  const email = str(f, "email");
  const invited = await inviteUser(email, name, { kind: "company" });
  if (!invited.ok) return back("/admin/companies", invited.error, false);
  const uid = invited.userId;
  await admin.from("profiles").update({ role: "company", full_name: name }).eq("id", uid);

  let logo_path: string | null = null;
  const file = f.get("logo");
  if (file instanceof File && file.size > 0) {
    const ext = (file.type.split("/")[1] ?? "png").replace("svg+xml", "svg");
    logo_path = `${uid}.${ext}`;
    const up = await admin.storage.from("logos").upload(logo_path, file, { contentType: file.type, upsert: true });
    if (up.error) logo_path = null;
  }
  const { error } = await admin.from("companies").insert({ user_id: uid, name, email, description: str(f, "description") || null, logo_path, created_by: me.id });
  if (error) return back("/admin/companies", error.message, false);
  back("/admin/companies", invited.emailed ? "Company created. Set-password email sent." : "Company created, but the email could not be sent. Use Resend on its card.", invited.emailed);
}

// ---- Admin-posted "Special" jobs ----------------------------------------
export async function createSpecialJob(f: FormData) {
  const me = await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").insert({
    is_special: true, company_id: null, posted_by: me.id,
    title: str(f, "title"), description: str(f, "description"), location: str(f, "location") || null,
    track_id: str(f, "track_id") || null, apply_by: str(f, "apply_by") || null, external_url: str(f, "external_url") || null,
  });
  back("/admin/jobs", error ? error.message : "Special job posted", !error);
}

export async function setJobStatus(f: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("jobs").update({ status: str(f, "status") }).eq("id", str(f, "id"));
  revalidatePath("/admin/jobs");
  back("/admin/jobs", "Job updated");
}

export async function deleteJob(f: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("jobs").delete().eq("id", str(f, "id"));
  back("/admin/jobs", "Job removed");
}

// ---- Admin accounts ------------------------------------------------------
export async function inviteAdmin(f: FormData) {
  await requireRole("admin");
  const admin = createAdminClient();
  const email = str(f, "email");
  const invited = await inviteUser(email, "", { kind: "admin" });
  if (!invited.ok) return back("/admin/admins", invited.error, false);
  await admin.from("profiles").update({ role: "admin" }).eq("id", invited.userId);
  back("/admin/admins", invited.emailed ? "Admin invited" : "Admin created, but the email could not be sent.", invited.emailed);
}

export async function removeAdmin(f: FormData) {
  const me = await requireRole("admin");
  const id = str(f, "id");
  if (id === me.id) return back("/admin/admins", "You cannot remove yourself", false);
  const admin = createAdminClient();
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if ((count ?? 0) <= 1) return back("/admin/admins", "Cannot remove the last admin", false);
  await admin.auth.admin.deleteUser(id);
  back("/admin/admins", "Admin removed");
}
