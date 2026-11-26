import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { LOGO_B64, PARTNERS_B64 } from "@/lib/pdf-assets";

export type PdfSection = { heading: string; rows: [string, string][] };
export type PdfSpec = {
  docType: string;      // small label top right, e.g. "WORKSHOP APPLICATION"
  title: string;
  subtitle?: string;
  badge?: string;       // status pill
  sections: PdfSection[];
};

const NAVY = rgb(0.118, 0.227, 0.373);
const BROWN = rgb(0.545, 0.29, 0.169);
const TEXT = rgb(0.114, 0.114, 0.122);
const MUTED = rgb(0.431, 0.431, 0.451);
const LINE = rgb(0.91, 0.91, 0.93);
const SURFACE = rgb(0.96, 0.96, 0.969);

const W = 595.28, H = 841.89, M = 48;
const FOOTER_H = 90;

// Standard PDF fonts only cover Latin characters; anything else becomes "?".
const clean = (s: string) =>
  (s ?? "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/•/g, "-").replace(/\r/g, "")
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "?");

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      let w = word;
      // break very long words (links, emails) so they never overflow
      while (font.widthOfTextAtSize(w, size) > width) {
        let i = w.length;
        while (i > 1 && font.widthOfTextAtSize(w.slice(0, i), size) > width) i--;
        if (line) { out.push(line); line = ""; }
        out.push(w.slice(0, i));
        w = w.slice(i);
      }
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) <= width) line = test;
      else { out.push(line); line = w; }
    }
    out.push(line);
  }
  return out;
}

export async function renderPdf(spec: PdfSpec): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(clean(spec.title));
  pdf.setAuthor("Scale to Thrive");
  pdf.setCreator("Scale to Thrive platform");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(Buffer.from(LOGO_B64, "base64"));
  const partners = await pdf.embedPng(Buffer.from(PARTNERS_B64, "base64"));

  let page!: PDFPage;
  let y = 0;

  const newPage = (first: boolean) => {
    page = pdf.addPage([W, H]);
    const lw = first ? 104 : 70;
    const lh = (logo.height / logo.width) * lw;
    page.drawImage(logo, { x: M, y: H - M - lh, width: lw, height: lh });
    page.drawText(clean(spec.docType.toUpperCase()), { x: W - M - bold.widthOfTextAtSize(clean(spec.docType.toUpperCase()), 8.5), y: H - M - 10, size: 8.5, font: bold, color: BROWN });
    page.drawRectangle({ x: M, y: H - M - lh - 14, width: 54, height: 3, color: BROWN });
    y = H - M - lh - 34;
  };

  const need = (h: number) => { if (y - h < M + FOOTER_H) newPage(false); };

  newPage(true);

  // Title block
  for (const l of wrap(spec.title, bold, 22, W - 2 * M)) { page.drawText(l, { x: M, y: y - 22, size: 22, font: bold, color: NAVY }); y -= 28; }
  if (spec.subtitle) {
    for (const l of wrap(spec.subtitle, regular, 11, W - 2 * M - 110)) { page.drawText(l, { x: M, y: y - 11, size: 11, font: regular, color: MUTED }); y -= 16; }
  }
  if (spec.badge) {
    const label = clean(spec.badge.toUpperCase());
    const bw = bold.widthOfTextAtSize(label, 8.5) + 22;
    // pill: a rectangle capped with two circles
    page.drawRectangle({ x: W - M - bw + 10, y: y + 2, width: bw - 20, height: 20, color: NAVY });
    page.drawCircle({ x: W - M - bw + 10, y: y + 12, size: 10, color: NAVY });
    page.drawCircle({ x: W - M - 10, y: y + 12, size: 10, color: NAVY });
    page.drawText(label, { x: W - M - bw + 11, y: y + 9, size: 8.5, font: bold, color: rgb(1, 1, 1) });
  }
  y -= 14;

  const labelW = 138;
  const valueW = W - 2 * M - labelW - 16;
  for (const sec of spec.sections) {
    need(60);
    page.drawText(clean(sec.heading.toUpperCase()), { x: M, y: y - 9, size: 9, font: bold, color: BROWN });
    y -= 16;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: LINE });
    y -= 6;
    let shade = false;
    for (const [label, value] of sec.rows) {
      const v = value && value.trim() ? value : "-";
      const lines = wrap(v, regular, 10.5, valueW);
      const labelLines = wrap(label, regular, 9, labelW);
      const h = Math.max(lines.length * 13.5, labelLines.length * 12) + 6;
      need(h);
      if (shade) page.drawRectangle({ x: M - 6, y: y - h + 2, width: W - 2 * M + 12, height: h, color: SURFACE });
      labelLines.forEach((l, i) => page.drawText(l, { x: M, y: y - 13 - i * 12, size: 9, font: regular, color: MUTED }));
      lines.forEach((l, i) => page.drawText(l, { x: M + labelW + 16, y: y - 13 - i * 13.5, size: 10.5, font: regular, color: TEXT }));
      y -= h;
      shade = !shade;
    }
    y -= 10;
  }

  // Footer on every page
  const pages = pdf.getPages();
  const stamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: M + 74 }, end: { x: W - M, y: M + 74 }, thickness: 0.8, color: LINE });
    p.drawText("AN INITIATIVE OF ANVESANA TBI AND PES TRUST", { x: M, y: M + 60, size: 7, font: bold, color: MUTED });
    const pw = 330, ph = (partners.height / partners.width) * pw;
    p.drawImage(partners, { x: M - 4, y: M + 46 - ph + 8, width: pw, height: ph });
    p.drawText("Scale to Thrive  |  info@anvesana.co.in  |  www.anvesana.co.in", { x: M, y: M + 14, size: 8, font: regular, color: MUTED });
    p.drawText(`Generated ${clean(stamp)}`, { x: M, y: M + 3, size: 7.5, font: regular, color: rgb(0.6, 0.6, 0.62) });
    const pn = `Page ${i + 1} of ${pages.length}`;
    p.drawText(pn, { x: W - M - regular.widthOfTextAtSize(pn, 8), y: M + 3, size: 8, font: regular, color: MUTED });
  });

  return pdf.save();
}

export const safeFile = (s: string) => clean(s).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "document";
