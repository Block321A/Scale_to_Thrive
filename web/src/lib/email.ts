// Sends mail through Resend if RESEND_API_KEY is set. Otherwise logs it (useful in development).
// Set-password / invite emails are sent by Supabase itself, not here.
export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Scale to Thrive <onboarding@resend.dev>";
  if (!key) {
    console.log(`[email not sent: RESEND_API_KEY missing] to=${to} subject=${subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) console.error("Email failed", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("Email error", e);
    return false;
  }
}

const sign = "\n\nScale to Thrive\nAnvesana TBI and PES Trust";
export const mails = {
  received: (name: string, track: string) => ({
    subject: "We received your application",
    text: `Hi ${name},\n\nThank you for applying to the Scale to Thrive ${track} workshop. We will email you once your application is reviewed.${sign}`,
  }),
  rejected: (name: string, track: string) => ({
    subject: "Your Scale to Thrive application",
    text: `Hi ${name},\n\nThank you for applying to the ${track} workshop. We are sorry to say you were not selected for this batch. You are welcome to apply again when the next batch opens.${sign}`,
  }),
  jobApplied: (name: string, job: string, company: string) => ({
    subject: `Application received: ${job}`,
    text: `Hi ${name},\n\nYour application for "${job}" at ${company} was submitted. Your complete profile has been shared with the company. We will email you when your status changes.${sign}`,
  }),
  stage: (name: string, job: string, company: string, stage: string) => ({
    subject: `Update on your application: ${job}`,
    text: `Hi ${name},\n\nYour application for "${job}" at ${company} is now: ${stage.toUpperCase()}.${sign}`,
  }),
};
