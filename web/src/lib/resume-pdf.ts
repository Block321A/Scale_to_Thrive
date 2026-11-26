import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { clean, wrap, textWidth } from "@/lib/pdf";
import type { Resume } from "@/lib/resume";

// The resume PDF itself. Kept apart from resume.ts so pages that only show the ATS score stay light.
export async function renderResumePdf(r: Resume): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(clean(`${r.name} - Resume`));
  pdf.setAuthor(clean(r.name));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Layout: one column, real text only (no tables, images or icons), so ATS software reads it correctly.
  const W = 595.28, H = 841.89, M = 50, TOP = 48, BOTTOM = 46, textW = W - 2 * M;
  const SIZE = 10, LEAD = 15;            // body text and line height (1.5)
  const NAVY = rgb(0.118, 0.227, 0.373), INK = rgb(0.13, 0.13, 0.15), GREY = rgb(0.4, 0.4, 0.43), RULE = rgb(0.84, 0.85, 0.88);

  let page = pdf.addPage([W, H]);
  let y = H - TOP;
  const need = (h: number) => { if (y - h < BOTTOM) { page = pdf.addPage([W, H]); y = H - TOP; } };
  const text = (t: string, x: number, size: number, f = font, color = INK) => page.drawText(t, { x, y, size, font: f, color });

  // ---- Name and contact ----
  y -= 22;
  text(clean(r.name), M, 25, bold, NAVY);
  y -= 19;
  for (const l of wrap(r.contact.join("   |   "), font, 9.5, textW)) { text(l, M, 9.5, font, GREY); y -= 14; }
  y -= 4;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.6, color: NAVY });
  y -= 6;

  const heading = (t: string) => {
    need(46);
    y -= 26;
    text(t.toUpperCase(), M, 10.5, bold, NAVY);
    y -= 7;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.7, color: RULE });
    page.drawLine({ start: { x: M, y }, end: { x: M + 30, y }, thickness: 2, color: NAVY });
    y -= 6;
  };
  const gap = (n = 4) => { y -= n; };

  const para = (t: string, f = font, color = INK) => {
    for (const l of wrap(t, f, SIZE, textW)) { need(LEAD); y -= LEAD; text(l, M, SIZE, f, color); }
  };
  // "Label: value". The label is bold; wrapped lines return to the left margin (or a hanging indent for bullets).
  const labelled = (label: string, value: string, bullet = false) => {
    const x0 = bullet ? M + 12 : M;
    const lab = `${clean(label)}: `;
    const lw = textWidth(bold, lab, SIZE);
    const words = wrap(value, font, SIZE, textW - (x0 - M) - lw - 3);
    const firstLine = words[0] ?? "";
    const rest = wrap(words.slice(1).join(" "), font, SIZE, textW - (x0 - M)).filter(Boolean);
    need(LEAD);
    y -= LEAD;
    if (bullet) page.drawCircle({ x: M + 3, y: y + 3.4, size: 1.8, color: NAVY });
    text(lab, x0, SIZE, bold);
    page.drawText(firstLine, { x: x0 + lw + 3, y, size: SIZE, font, color: INK });
    for (const l of rest) { need(LEAD); y -= LEAD; text(l, x0, SIZE); }
    gap(3);
  };
  const bullet = (t: string) => {
    wrap(t, font, SIZE, textW - 12).forEach((l, i) => { need(LEAD); y -= LEAD; if (i === 0) page.drawCircle({ x: M + 3, y: y + 3.4, size: 1.8, color: NAVY }); text(l, M + 12, SIZE); });
    gap(2);
  };

  heading("Professional Summary");
  gap(2);
  para(r.summary);

  heading("Technical Skills");
  gap(2);
  r.skills.forEach(([a, b]) => labelled(a, b));

  heading("Projects");
  gap(2);
  r.projects.forEach(([a, b]) => labelled(a, b, true));

  heading("Education");
  gap(2);
  r.education.forEach((e, i) => { need(LEAD); y -= LEAD; wrap(e, i === 0 ? bold : font, SIZE + (i === 0 ? 0.5 : 0), textW).forEach((l, k) => { if (k) y -= LEAD; text(l, M, SIZE + (i === 0 ? 0.5 : 0), i === 0 ? bold : font, i === 2 ? GREY : INK); }); });

  heading("Training");
  gap(2);
  r.training.forEach((t) => bullet(t));

  if (r.additional.length) {
    heading("Additional Information");
    gap(2);
    r.additional.forEach(([a, b]) => labelled(a, b));
  }
  return pdf.save();
}
