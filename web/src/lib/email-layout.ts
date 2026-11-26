// Branded HTML email layout for Scale to Thrive. No imports, so a build script can use it too.
// Table based with inline styles, which is what email apps (Gmail, Outlook, Apple Mail) render reliably.

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const BRAND = {
  navy: "#1e3a5f",
  brown: "#8b4a2b",
  blue: "#0071e3",
  text: "#1d1d1f",
  muted: "#6e6e73",
  surface: "#f5f5f7",
  website: "https://www.anvesana.co.in",
  supportEmail: "info@anvesana.co.in",
};

export const ABOUT =
  "Scale to Thrive is a job-oriented training program for engineering students and recent graduates, run by Anvesana TBI and PES Trust. " +
  "Two 12-week hybrid chariots, IT Skills and Advanced Excel with Corporate Readiness, combine hands-on labs, real projects and career preparation, " +
  "and connect trained students with hiring companies.";

export type EmailSpec = {
  baseUrl: string;      // public site address, used for images and links
  preheader: string;    // preview text shown next to the subject in the inbox
  eyebrow?: string;     // small label above the title
  title: string;
  paragraphs: string[]; // HTML strings. Escape dynamic values with esc().
  cta?: { label: string; url: string };
  note?: string;        // small print under the button (HTML)
  showAbout?: boolean;  // purpose box, shown by default
};

const font = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif";

export function renderEmail(s: EmailSpec): string {
  const base = s.baseUrl.replace(/\/$/, "");
  const p = s.paragraphs
    .map((x) => `<p style="margin:0 0 16px;font:400 16px/1.6 ${font};color:${BRAND.text}">${x}</p>`)
    .join("");
  const button = s.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px"><tr>
         <td bgcolor="${BRAND.blue}" style="border-radius:980px">
           <a href="${s.cta.url}" target="_blank" style="display:inline-block;padding:14px 30px;font:600 16px/1 ${font};color:#ffffff;text-decoration:none;border-radius:980px">${s.cta.label}</a>
         </td></tr></table>
       <p style="margin:0 0 20px;font:400 12px/1.5 ${font};color:${BRAND.muted}">Button not working? Copy this link into your browser:<br><a href="${s.cta.url}" style="color:${BRAND.blue};word-break:break-all">${s.cta.url}</a></p>`
    : "";
  const note = s.note
    ? `<p style="margin:0 0 8px;font:400 13px/1.6 ${font};color:${BRAND.muted}">${s.note}</p>`
    : "";
  const about =
    s.showAbout === false
      ? ""
      : `<tr><td style="padding:0 40px 32px">
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
             <td bgcolor="${BRAND.surface}" style="border-radius:14px;padding:20px 22px">
               <p style="margin:0 0 6px;font:700 12px/1 ${font};letter-spacing:1.2px;text-transform:uppercase;color:${BRAND.brown}">About Scale to Thrive</p>
               <p style="margin:0;font:400 14px/1.6 ${font};color:${BRAND.muted}">${ABOUT}</p>
             </td></tr></table>
         </td></tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(s.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(s.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.surface}">
<tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff;border-radius:20px">
    <tr><td style="padding:32px 40px 8px">
      <a href="${base}" target="_blank"><img src="${base}/email/logo.png" width="150" alt="Scale to Thrive" style="display:block;border:0;height:auto"></a>
    </td></tr>
    <tr><td style="padding:16px 40px 0"><div style="height:3px;width:56px;background:${BRAND.brown};border-radius:3px;font-size:0;line-height:0">&nbsp;</div></td></tr>
    <tr><td style="padding:24px 40px 8px">
      ${s.eyebrow ? `<p style="margin:0 0 8px;font:700 12px/1 ${font};letter-spacing:1.2px;text-transform:uppercase;color:${BRAND.brown}">${esc(s.eyebrow)}</p>` : ""}
      <h1 style="margin:0 0 18px;font:700 28px/1.2 ${font};letter-spacing:-0.5px;color:${BRAND.navy}">${esc(s.title)}</h1>
      ${p}
      ${button}
      ${note}
    </td></tr>
    ${about}
    <tr><td style="padding:0 40px"><div style="height:1px;background:#e8e8ed;font-size:0;line-height:0">&nbsp;</div></td></tr>
    <tr><td style="padding:24px 40px 8px">
      <p style="margin:0 0 12px;font:700 11px/1 ${font};letter-spacing:1.2px;text-transform:uppercase;color:${BRAND.muted}">An initiative of Anvesana TBI and PES Trust</p>
      <img src="${base}/email/partners.png" width="520" alt="Anvesana, K-tech, Government of Karnataka, Startup Karnataka, PES Trust" style="display:block;width:100%;max-width:520px;height:auto;border:0">
    </td></tr>
    <tr><td style="padding:12px 40px 32px">
      <p style="margin:0 0 6px;font:400 12px/1.6 ${font};color:${BRAND.muted}">Questions? Write to <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.muted}">${BRAND.supportEmail}</a> or visit <a href="${BRAND.website}" style="color:${BRAND.muted}">www.anvesana.co.in</a>.</p>
      <p style="margin:0;font:400 11px/1.6 ${font};color:#98989d">Open to engineering students and recent graduates. Target job roles are not guaranteed placements. You are receiving this email because of your activity on the Scale to Thrive platform.</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

// Plain-text twin of an email, for apps that do not show HTML.
export function renderText(s: EmailSpec): string {
  const strip = (h: string) => h.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
  return [
    "SCALE TO THRIVE",
    "",
    s.title,
    "",
    ...s.paragraphs.map(strip),
    ...(s.cta ? ["", `${strip(s.cta.label)}: ${s.cta.url}`] : []),
    ...(s.note ? ["", strip(s.note)] : []),
    "",
    "--",
    "Scale to Thrive, an initiative of Anvesana TBI and PES Trust",
    `${BRAND.supportEmail} | www.anvesana.co.in`,
  ].join("\n");
}
