"use client";

import { useActionState, useState } from "react";
import type { Track } from "@/lib/content";
import { submitApplication, type ApplyState } from "@/app/actions/apply";
import { EDUCATION_LEVELS, EDUCATION_STATUS, passOutYears } from "@/lib/education";

const input = "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-sm font-medium";

export default function ApplicationForm({ openTracks }: { openTracks: Track[] }) {
  const [trackId, setTrackId] = useState(openTracks[0]?.id ?? "it");
  const [eduStatus, setEduStatus] = useState<string>("studying");
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitApplication, { ok: false, message: "" });

  if (state.ok) {
    return (
      <div className="rounded-3xl bg-surface p-10 text-center">
        <h3 className="text-2xl font-semibold">Thank you for applying</h3>
        <p className="mt-2 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-8 rounded-3xl bg-surface p-8 md:p-10"
      action={action}
      data-own-progress=""
    >
      <fieldset>
        <legend className="text-lg font-semibold">1. Choose your chariot</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {openTracks.map((t) => (
            <label key={t.id} className={`cursor-pointer rounded-2xl border p-4 ${trackId === t.id ? "border-accent bg-white" : "border-black/10 bg-white/60"}`}>
              <input type="radio" name="track" value={t.id} checked={trackId === t.id} onChange={() => setTrackId(t.id)} className="mr-2" />
              <span className="font-medium">{t.name} track</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">2. Personal details</legend>
        <div><label className={label}>Full name * <span className="font-normal text-muted">(type in English letters)</span></label><input name="full_name" required className={input} /></div>
        <div><label className={label}>Email *</label><input name="email" required type="email" className={input} /></div>
        <div><label className={label}>Phone / WhatsApp *</label><input name="phone" required type="tel" className={input} /></div>
        <div><label className={label}>Date of birth</label><input name="dob" type="date" className={input} /></div>
        <div><label className={label}>Gender (optional)</label><select name="gender" className={input}><option>Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></div>
        <div><label className={label}>City / state</label><input name="city" className={input} /></div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">3. Education</legend>
        <div className="sm:col-span-2"><label className={label}>College / institution *</label><input name="college" required className={input} /></div>
        <div>
          <label className={label}>Highest education *</label>
          <select name="education_level" required defaultValue="" className={input}>
            <option value="" disabled>Select</option>
            {EDUCATION_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div><label className={label}>Branch / specialization *</label><input name="branch" required placeholder="e.g. Computer Science" className={input} /></div>
        <div className="sm:col-span-2">
          <span className={label}>Education status *</span>
          <div className="flex flex-wrap gap-3">
            {EDUCATION_STATUS.map((s) => (
              <label key={s.value} className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm ${eduStatus === s.value ? "border-accent bg-white" : "border-black/10 bg-white/60"}`}>
                <input type="radio" name="education_status" value={s.value} required checked={eduStatus === s.value} onChange={() => setEduStatus(s.value)} className="mr-2" />{s.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={label}>{eduStatus === "completed" ? "Year you passed out *" : "Expected year of passing out *"}</label>
          <select key={eduStatus} name="passout_year" required defaultValue="" className={input}>
            <option value="" disabled>Select year</option>
            {passOutYears(eduStatus).map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">4. About your experience</legend>
        {trackId === "it" ? (
          <>
            <div><label className={label}>Programming experience</label><select name="experience" className={input}><option>None</option><option>Basic</option><option>Intermediate</option></select></div>
            <div><label className={label}>GitHub profile (optional)</label><input name="github_url" type="url" className={input} /></div>
            <div className="sm:col-span-2"><label className={label}>Languages or tools you have used (optional)</label><input name="tools" className={input} /></div>
          </>
        ) : (
          <>
            <div><label className={label}>Prior Excel experience</label><select name="experience" className={input}><option>None</option><option>Basic</option><option>Intermediate</option></select></div>
            <div><label className={label}>English communication</label><select name="english" className={input}><option>Basic</option><option>Good</option><option>Fluent</option></select></div>
            <div className="sm:col-span-2"><label className={label}>Preferred career area</label><select name="career_area" className={input}><option>MIS and reporting</option><option>Data and business analysis</option><option>HR / finance / sales / operations</option></select></div>
          </>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-lg font-semibold">5. About you</legend>
        <div><label className={label}>Why do you want to join? *</label><textarea name="reason" required rows={3} className={input} /></div>
        <div><label className={label}>Career goal</label><textarea name="career_goal" rows={2} className={input} /></div>
        <div><label className={label}>How did you hear about us?</label><select name="heard_from" className={input}><option>Poster</option><option>College</option><option>Social media</option><option>Friend</option><option>Other</option></select></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Resume (PDF)</label><input name="resume" type="file" accept="application/pdf" className={input} /></div>
          <div><label className={label}>Photo</label><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className={input} /></div>
        </div>
      </fieldset>

      <fieldset className="space-y-3 text-sm">
        <legend className="mb-2 text-lg font-semibold">6. Confirmations</legend>
        {[
          "I am currently studying, or have recently completed, an engineering degree (B.E. / B.Tech).",
          "I can attend all sessions (8 hours a week for IT, 5 hours a week for Non-IT), online and offline.",
          "I understand the program does not guarantee placement.",
          "I agree to my details being used for the application process and shared with hiring companies when I apply for jobs.",
        ].map((t) => (
          <label key={t} className="flex gap-3"><input required type="checkbox" className="mt-1 size-4" /><span>{t} *</span></label>
        ))}
      </fieldset>

      {state.message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.message}</p>}
      <button disabled={pending} aria-busy={pending} className="rounded-full bg-accent px-8 py-3 text-base font-medium text-white hover:bg-[#0077ed] disabled:opacity-60">{pending ? "Submitting..." : "Submit application"}</button>
    </form>
  );
}
