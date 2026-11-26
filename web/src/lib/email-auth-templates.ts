import { renderEmail, type EmailSpec } from "./email-layout.ts";

// Templates for Supabase's own emails (invite, reset, and so on). Paste into
// Supabase: Authentication -> Emails. {{ ... }} are Supabase placeholders.
// Build the files with: npm run build:emails

const BASE = "{{ .SiteURL }}";
const hello = "{{ if .Data.full_name }}Hi {{ .Data.full_name }},{{ else }}Hello,{{ end }}";

export const AUTH_TEMPLATES: { file: string; subject: string; where: string; spec: EmailSpec }[] = [
  {
    file: "invite",
    where: "Invite user",
    subject: "You are invited to Scale to Thrive",
    spec: {
      baseUrl: BASE,
      preheader: "Set your password to activate your Scale to Thrive account.",
      eyebrow: "Welcome",
      title: "You are invited to Scale to Thrive",
      paragraphs: [
        hello,
        "You have been added to the <strong>Scale to Thrive</strong> platform. Set your password to activate your account and sign in.",
        "Depending on your role, you will be able to follow your workshop progress and apply for jobs, post jobs and review applicants, or manage the program.",
      ],
      cta: { label: "Set my password", url: "{{ .ConfirmationURL }}" },
      note: "This link can be used once and expires after a short time. If it has expired, ask the Scale to Thrive team to send a new one. If you were not expecting this invitation, you can ignore this email.",
    },
  },
  {
    file: "recovery",
    where: "Reset password",
    subject: "Reset your Scale to Thrive password",
    spec: {
      baseUrl: BASE,
      preheader: "Use this link to choose a new password.",
      eyebrow: "Password reset",
      title: "Choose a new password",
      paragraphs: [
        hello,
        "We received a request to set a new password for your Scale to Thrive account. Click the button below to choose one.",
      ],
      cta: { label: "Set a new password", url: "{{ .ConfirmationURL }}" },
      note: "If you did not ask for this, you can safely ignore this email. Your password will not change.",
      showAbout: false,
    },
  },
  {
    file: "confirmation",
    where: "Confirm sign up",
    subject: "Confirm your email for Scale to Thrive",
    spec: {
      baseUrl: BASE,
      preheader: "Confirm your email address to finish setting up your account.",
      eyebrow: "Confirm your email",
      title: "Confirm your email address",
      paragraphs: [hello, "Please confirm your email address to finish setting up your Scale to Thrive account."],
      cta: { label: "Confirm my email", url: "{{ .ConfirmationURL }}" },
      note: "If you did not create this account, you can ignore this email.",
    },
  },
  {
    file: "magic-link",
    where: "Magic link",
    subject: "Your Scale to Thrive sign-in link",
    spec: {
      baseUrl: BASE,
      preheader: "Use this one-time link to sign in.",
      eyebrow: "Sign in",
      title: "Your sign-in link",
      paragraphs: [hello, "Use the button below to sign in to Scale to Thrive. The link works once."],
      cta: { label: "Sign in", url: "{{ .ConfirmationURL }}" },
      note: "If you did not request this, you can ignore this email.",
      showAbout: false,
    },
  },
  {
    file: "email-change",
    where: "Change email address",
    subject: "Confirm your new email address",
    spec: {
      baseUrl: BASE,
      preheader: "Confirm the change of your Scale to Thrive email address.",
      eyebrow: "Account security",
      title: "Confirm your new email address",
      paragraphs: [
        hello,
        "We received a request to change the email address on your Scale to Thrive account from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>.",
      ],
      cta: { label: "Confirm the change", url: "{{ .ConfirmationURL }}" },
      note: "If you did not make this request, please contact info@anvesana.co.in right away.",
      showAbout: false,
    },
  },
  {
    file: "reauthentication",
    where: "Reauthentication",
    subject: "Your Scale to Thrive verification code",
    spec: {
      baseUrl: BASE,
      preheader: "Your one-time verification code.",
      eyebrow: "Account security",
      title: "Your verification code",
      paragraphs: [
        hello,
        "Enter this code to confirm it is you:",
        '<span style="display:inline-block;padding:14px 22px;background:#f5f5f7;border-radius:12px;font:700 28px/1 monospace;letter-spacing:6px;color:#1e3a5f">{{ .Token }}</span>',
        "The code expires shortly. Never share it with anyone.",
      ],
      showAbout: false,
    },
  },
];

export const renderAuthTemplate = (t: (typeof AUTH_TEMPLATES)[number]) => renderEmail(t.spec);
