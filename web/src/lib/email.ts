import nodemailer from "nodemailer";
import { siteUrl } from "@/lib/supabase/env";
import * as T from "@/lib/email-templates";
import type { Mail } from "@/lib/email-templates";
import { getSmtpConfig, type SmtpConfig } from "@/lib/email-config";

export const makeTransport = (c: SmtpConfig) =>
  nodemailer.createTransport({ host: c.host, port: c.port, secure: c.port === 465, auth: { user: c.user, pass: c.pass } });

// Sends one email through the SMTP account saved in Admin -> Settings.
// Password-link emails (set / reset password) are sent by Supabase itself, not here.
export async function sendEmail(to: string, mail: Mail): Promise<boolean> {
  const cfg = await getSmtpConfig();
  if (!cfg) {
    console.log(`[email not sent: SMTP not configured in Admin -> Settings] to=${to} subject=${mail.subject}`);
    return false;
  }
  try {
    await makeTransport(cfg).sendMail({ from: `${cfg.fromName} <${cfg.user}>`, to, subject: mail.subject, html: mail.html, text: mail.text });
    return true;
  } catch (e) {
    console.error("Email error", (e as Error).message);
    return false;
  }
}

// Every email the website sends. Each returns { subject, html, text }.
export const mails = {
  received: (name: string, track: string) => T.applicationReceived(siteUrl, name, track),
  shortlisted: (name: string, track: string) => T.applicationShortlisted(siteUrl, name, track),
  rejected: (name: string, track: string) => T.applicationRejected(siteUrl, name, track),
  jobApplied: (name: string, job: string, company: string) => T.jobApplied(siteUrl, name, job, company),
  jobShortlisted: (name: string, job: string, company: string) => T.jobShortlisted(siteUrl, name, job, company),
  stage: (name: string, job: string, company: string, stage: string) => T.jobStage(siteUrl, name, job, company, stage),
  test: () => T.testEmail(siteUrl),
};
