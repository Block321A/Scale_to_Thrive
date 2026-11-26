import { renderEmail, renderText, esc, type EmailSpec } from "./email-layout";

export type Mail = { subject: string; html: string; text: string };

const build = (subject: string, spec: EmailSpec): Mail => ({ subject, html: renderEmail(spec), text: renderText(spec) });

// ---------- Emails the website sends ----------

export function applicationReceived(baseUrl: string, name: string, track: string): Mail {
  return build("We received your Scale to Thrive application", {
    baseUrl,
    preheader: `Thanks for applying to the ${track} workshop. Here is what happens next.`,
    eyebrow: "Application received",
    title: `Thank you for applying, ${name.split(" ")[0]}`,
    paragraphs: [
      `We have received your application for the <strong>${esc(track)} track</strong> of the Scale to Thrive workshop.`,
      "<strong>What happens next</strong><br>1. Our team reviews every application.<br>2. If you are selected, you will receive an email with a link to set your password and open your student profile.<br>3. If this batch is full, we will let you know and you can apply again for the next one.",
      "Seats are limited, so please keep an eye on your inbox, including the spam folder.",
    ],
    cta: { label: "About the workshop", url: baseUrl },
    note: "You do not need to do anything else right now.",
  });
}

export function applicationRejected(baseUrl: string, name: string, track: string): Mail {
  return build("An update on your Scale to Thrive application", {
    baseUrl,
    preheader: `Your application for the ${track} workshop.`,
    eyebrow: "Application update",
    title: `Thank you for applying, ${name.split(" ")[0]}`,
    paragraphs: [
      `After careful review, we are not able to offer you a seat in the <strong>${esc(track)} track</strong> for this batch.`,
      "This is not a reflection of your potential. Seats are limited and many strong applications arrive for every batch. You are very welcome to apply again when the next batch opens.",
      "We wish you every success in your learning and career.",
    ],
    cta: { label: "See upcoming workshops", url: baseUrl },
  });
}

export function jobApplied(baseUrl: string, name: string, job: string, company: string): Mail {
  return build(`Application received: ${job}`, {
    baseUrl,
    preheader: `Your application for ${job} at ${company} was submitted.`,
    eyebrow: "Job application",
    title: "Your application is in",
    paragraphs: [
      `Hi ${esc(name.split(" ")[0])}, you applied for <strong>${esc(job)}</strong> at <strong>${esc(company)}</strong>.`,
      "As you agreed when applying, your complete Scale to Thrive profile has been shared with the company so they can review it.",
      "We will email you every time the company updates your status, for example when you are shortlisted or invited to interview. You can also check your status any time in your profile.",
    ],
    cta: { label: "View my applications", url: `${baseUrl}/profile` },
  });
}

const STAGES: Record<string, { subject: string; eyebrow: string; title: string; body: string }> = {
  applied: { subject: "Application received", eyebrow: "Status: Applied", title: "Your application is with the company", body: "The company has your application and will review it soon." },
  shortlisted: { subject: "You have been shortlisted", eyebrow: "Status: Shortlisted", title: "You have been shortlisted", body: "Good news. The company liked your profile and moved you to the shortlist. They may contact you soon, so keep your phone and email handy." },
  interview: { subject: "Interview stage", eyebrow: "Status: Interview", title: "You are moving to the interview stage", body: "The company would like to interview you. Prepare by revisiting your workshop projects and being ready to explain your problem, approach, code and outcome." },
  offered: { subject: "You have received an offer", eyebrow: "Status: Offered", title: "You have received an offer", body: "Congratulations. The company has made you an offer. Please read it carefully and respond to the company directly." },
  selected: { subject: "Congratulations, you are selected", eyebrow: "Status: Selected", title: "Congratulations, you are selected", body: "The company has selected you for this role. Well done, this is the result of your hard work in the workshop." },
  rejected: { subject: "An update on your application", eyebrow: "Status: Not selected", title: "An update on your application", body: "The company has decided not to move forward with your application for this role. Please do not be discouraged. Keep building projects, and apply to other openings on the platform." },
};

export function jobStage(baseUrl: string, name: string, job: string, company: string, stage: string): Mail {
  const s = STAGES[stage] ?? { subject: "Application update", eyebrow: `Status: ${stage}`, title: "Your application status changed", body: `Your status is now ${stage}.` };
  return build(`${s.subject}: ${job}`, {
    baseUrl,
    preheader: `${job} at ${company}: ${s.title}.`,
    eyebrow: s.eyebrow,
    title: s.title,
    paragraphs: [
      `Hi ${esc(name.split(" ")[0])}, here is an update on <strong>${esc(job)}</strong> at <strong>${esc(company)}</strong>.`,
      s.body,
    ],
    cta: { label: "View my applications", url: `${baseUrl}/profile` },
  });
}

// ---------- Account emails (set-password links the website generates itself) ----------

const linkNote = "This link works once and expires after a short time. If it has expired, ask the Scale to Thrive team to send a new one, or use &quot;Forgot your password?&quot; on the sign-in page. Please do not forward this email.";

// The set-password link itself arrives in a separate email from Supabase (subject "You've been invited").
const passwordSteps =
  "<strong>Important: set your password to sign in</strong><br>" +
  "1. Open the <strong>separate email</strong> from Scale To Thrive with the subject <strong>&ldquo;You&rsquo;ve been invited&rdquo;</strong>. If you cannot find it, check your Spam or Promotions folder.<br>" +
  "2. Click <strong>Accept invitation</strong> in that email and choose your password.<br>" +
  "3. Come back to the sign-in page and sign in with this email address and your new password.";

export function enrolleeSelected(baseUrl: string, name: string, track: string): Mail {
  const it = track === "IT";
  return build("Congratulations, you are selected for Scale to Thrive", {
    baseUrl,
    preheader: `You have a seat in the ${track} workshop. One more step: set your password to sign in.`,
    eyebrow: "You are in",
    title: `Congratulations ${name.split(" ")[0]}, you are selected`,
    paragraphs: [
      `Your application was successful. You have a seat in the <strong>${esc(track)} track</strong> of the Scale to Thrive workshop, a practical, job-oriented program for engineering students and graduates.`,
      `<strong>What to expect</strong><br>&bull; 12 weeks of hybrid learning, ${it ? "96" : "60"} guided hours (${it ? "2 online sessions of 2 hours plus one 4-hour offline lab every week" : "1 hour of communication, 1 hour online and a 3-hour offline lab every week"}).<br>&bull; Hands-on labs and real projects you can show in interviews.<br>&bull; Your student profile, where you follow weekly milestones and apply for jobs posted by partner companies.`,
      passwordSteps,
    ],
    cta: { label: "Go to the sign-in page", url: `${baseUrl}/login` },
    note: "We are glad to have you with us. Please keep your account details private.",
  });
}

export function companyWelcome(baseUrl: string, company: string): Mail {
  return build("Welcome to Scale to Thrive", {
    baseUrl,
    preheader: `Your hiring account for ${company} is ready. One more step: set your password to sign in.`,
    eyebrow: "Hiring partner",
    title: `Welcome, ${company}`,
    paragraphs: [
      `A hiring account for <strong>${esc(company)}</strong> has been created on the Scale to Thrive platform. We are pleased to have you as a hiring partner.`,
      "<strong>What you can do</strong><br>&bull; Post job openings for our trained engineering students and recent graduates.<br>&bull; Review applicants and their complete profiles, which students share with you when they apply.<br>&bull; Move candidates through shortlisted, interview, offered and selected. Each student is emailed automatically at every step.",
      passwordSteps,
    ],
    cta: { label: "Go to the sign-in page", url: `${baseUrl}/login` },
    note: "Need help? Write to info@anvesana.co.in.",
  });
}

export function adminInvite(baseUrl: string, link: string): Mail {
  return build("You are invited as a Scale to Thrive admin", {
    baseUrl,
    preheader: "Set your password to start managing the Scale to Thrive program.",
    eyebrow: "Admin invitation",
    title: "You are invited as an admin",
    paragraphs: [
      "You have been added as an administrator of the <strong>Scale to Thrive</strong> platform.",
      "As an admin you can manage workshop tracks, review and finalize applications, track enrollees, post jobs and add hiring companies. All admins have the same access.",
    ],
    cta: { label: "Set my password", url: link },
    note: linkNote,
  });
}

export function passwordReset(baseUrl: string, name: string, link: string): Mail {
  return build("Reset your Scale to Thrive password", {
    baseUrl,
    preheader: "Use this link to choose a new password.",
    eyebrow: "Password reset",
    title: "Choose a new password",
    paragraphs: [
      `${name ? `Hi ${esc(name.split(" ")[0])}, w` : "W"}e received a request to set a new password for your Scale to Thrive account. Use the button below to choose one.`,
    ],
    cta: { label: "Set a new password", url: link },
    note: "If you did not ask for this, you can safely ignore this email. Your password will not change.",
    showAbout: false,
  });
}
