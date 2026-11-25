"use client";

import { useState } from "react";
import type { Track } from "@/lib/content";

const input = "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-sm font-medium";

export default function ApplicationForm({ openTracks }: { openTracks: Track[] }) {
  const [trackId, setTrackId] = useState(openTracks[0]?.id ?? "it");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-3xl bg-surface p-10 text-center">
        <h3 className="text-2xl font-semibold">Thank you for applying</h3>
        <p className="mt-2 text-muted">We will email you once the admins review your application.</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-8 rounded-3xl bg-surface p-8 md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: POST to the API once the backend exists. Nothing is stored yet.
        setSent(true);
      }}
    >
      <fieldset>
        <legend className="text-lg font-semibold">1. Choose your workshop</legend>
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
        <div><label className={label}>Full name *</label><input required className={input} /></div>
        <div><label className={label}>Email *</label><input required type="email" className={input} /></div>
        <div><label className={label}>Phone / WhatsApp *</label><input required type="tel" className={input} /></div>
        <div><label className={label}>Date of birth</label><input type="date" className={input} /></div>
        <div><label className={label}>Gender (optional)</label><select className={input}><option>Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></div>
        <div><label className={label}>City / state</label><input className={input} /></div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-semibold">3. Education</legend>
        <label className={label}>College / institution *</label><input required className={input} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">4. About your experience</legend>
        {trackId === "it" ? (
          <>
            <div><label className={label}>Programming experience</label><select className={input}><option>None</option><option>Basic</option><option>Intermediate</option></select></div>
            <div><label className={label}>GitHub profile (optional)</label><input type="url" className={input} /></div>
            <div className="sm:col-span-2"><label className={label}>Languages or tools you have used (optional)</label><input className={input} /></div>
          </>
        ) : (
          <>
            <div><label className={label}>Prior Excel experience</label><select className={input}><option>None</option><option>Basic</option><option>Intermediate</option></select></div>
            <div><label className={label}>English communication</label><select className={input}><option>Basic</option><option>Good</option><option>Fluent</option></select></div>
            <div className="sm:col-span-2"><label className={label}>Preferred career area</label><select className={input}><option>MIS and reporting</option><option>Data and business analysis</option><option>HR / finance / sales / operations</option></select></div>
          </>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-lg font-semibold">5. About you</legend>
        <div><label className={label}>Why do you want to join? *</label><textarea required rows={3} className={input} /></div>
        <div><label className={label}>Career goal</label><textarea rows={2} className={input} /></div>
        <div><label className={label}>How did you hear about us?</label><select className={input}><option>Poster</option><option>College</option><option>Social media</option><option>Friend</option><option>Other</option></select></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Resume (PDF)</label><input type="file" accept="application/pdf" className={input} /></div>
          <div><label className={label}>Photo</label><input type="file" accept="image/*" className={input} /></div>
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

      <button className="rounded-full bg-accent px-8 py-3 text-base font-medium text-white hover:bg-[#0077ed]">Submit application</button>
    </form>
  );
}
