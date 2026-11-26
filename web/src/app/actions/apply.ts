"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail, mails } from "@/lib/email";
import { supabaseConfigured } from "@/lib/supabase/env";
import { validateEducation } from "@/lib/education";

export type ApplyState = { ok: boolean; message: string };

const clean = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim() ? v.trim() : null);

export async function submitApplication(_: ApplyState, formData: FormData): Promise<ApplyState> {
  if (!supabaseConfigured) return { ok: false, message: "The database is not connected yet." };
  const supabase = await createClient();
  const id = crypto.randomUUID();
  const trackId = String(formData.get("track"));

  const upload = async (field: string, bucket: string, types: string[]) => {
    const file = formData.get(field);
    if (!(file instanceof File) || file.size === 0) return null;
    if (!types.includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error(`${field} must be ${types.join("/")} under 5 MB`);
    const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    const path = `applications/${id}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
    if (error) throw new Error("Could not upload " + field);
    return path;
  };

  const edu = {
    level: clean(formData.get("education_level")), branch: clean(formData.get("branch")),
    status: clean(formData.get("education_status")), year: clean(formData.get("passout_year")),
  };
  const eduError = validateEducation(edu);
  if (eduError) return { ok: false, message: eduError };

  let resume: string | null = null;
  let photo: string | null = null;
  try {
    resume = await upload("resume", "resumes", ["application/pdf"]);
    photo = await upload("photo", "photos", ["image/jpeg", "image/png", "image/webp"]);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }

  const answers: Record<string, string | null> = {};
  for (const k of ["experience", "github_url", "tools", "english", "career_area"]) answers[k] = clean(formData.get(k));
  answers.education_level = edu.level; answers.branch = edu.branch; answers.education_status = edu.status; answers.passout_year = edu.year;

  const name = String(formData.get("full_name")).trim();
  const email = String(formData.get("email")).trim();
  const { error } = await supabase.from("applications").insert({
    id,
    track_id: trackId,
    full_name: name,
    email,
    phone: String(formData.get("phone")).trim(),
    date_of_birth: clean(formData.get("dob")),
    gender: clean(formData.get("gender")),
    city_state: clean(formData.get("city")),
    college: String(formData.get("college")).trim(),
    answers,
    reason: String(formData.get("reason")).trim(),
    career_goal: clean(formData.get("career_goal")),
    heard_from: clean(formData.get("heard_from")),
    resume_path: resume,
    photo_path: photo,
    confirmed_eligibility: true,
    confirmed_attendance: true,
    confirmed_no_guarantee: true,
    consent_data_sharing: true,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, message: "An application with this email already exists for this chariot." };
    return { ok: false, message: "Applications are closed for this chariot, or something went wrong. Please try again." };
  }

  const trackName = trackId === "it" ? "IT" : "Non-IT";
  const m = mails.received(name, trackName);
  await sendEmail(email, m);
  return { ok: true, message: "Thank you for applying. We will email you once your application is reviewed." };
}
