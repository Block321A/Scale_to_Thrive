import nodemailer from "nodemailer";
import { siteUrl } from "@/lib/supabase/env";
import * as T from "@/lib/email-templates";
import type { Mail } from "@/lib/email-templates";

// Sends through SMTP (e.g. Gmail) if SMTP_HOST is set, else through Resend if RESEND_API_KEY is set.
// With neither, the email is only logged. Set-password / invite emails are sent by Supabase itself.
export async function sendEmail(to: string, mail: Mail): Promise<boolean> {
  const smtpUser = process.env.SMTP_USER;
  const from = process.env.EMAIL_FROM ?? `Scale to Thrive <${smtpUser ?? "onboarding@resend.dev"}>`;

  try {
    if (process.env.SMTP_HOST && smtpUser && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT ?? 465);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({ from, to, subject: mail.subject, html: mail.html, text: mail.text });
      return true;
    }
    const key = process.env.RESEND_API_KEY;
    if (key) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject: mail.subject, html: mail.html, text: mail.text }),
      });
      if (!res.ok) console.error("Email failed", res.status, await res.text());
      return res.ok;
    }
    console.log(`[email not sent: no SMTP_* or RESEND_API_KEY configured] to=${to} subject=${mail.subject}`);
    return false;
  } catch (e) {
    console.error("Email error", e);
    return false;
  }
}

// Every email the website sends. Each returns { subject, html, text }.
export const mails = {
  received: (name: string, track: string) => T.applicationReceived(siteUrl, name, track),
  shortlisted: (name: string, track: string) => T.applicationShortlisted(siteUrl, name, track),
  rejected: (name: string, track: string) => T.applicationRejected(siteUrl, name, track),
  jobShortlisted: (name: string, job: string, company: string) => T.jobShortlisted(siteUrl, name, job, company),
  jobApplied: (name: string, job: string, company: string) => T.jobApplied(siteUrl, name, job, company),
  stage: (name: string, job: string, company: string, stage: string) => T.jobStage(siteUrl, name, job, company, stage),
};
