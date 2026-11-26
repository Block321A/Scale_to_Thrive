import ExcelJS from "exceljs";

export type Col = { header: string; key: string; width?: number };
export type SheetSpec = { name: string; columns: Col[]; rows: Record<string, unknown>[] };

const NAVY = "FF1E3A5F";

// Builds a styled .xlsx: navy header row, frozen header, filters, sensible column widths, wrapped text.
export async function buildWorkbook(sheets: SheetSpec[], title = "Scale to Thrive"): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Scale to Thrive";
  wb.title = title;
  wb.created = new Date();

  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31), {
      views: [{ state: "frozen", ySplit: 1 }],
      properties: { tabColor: { argb: "FF8B4A2B" } },
    });
    ws.columns = s.columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 18 }));
    ws.addRows(s.rows);

    const header = ws.getRow(1);
    header.height = 24;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    });

    ws.columns.forEach((col, i) => {
      const spec = s.columns[i];
      if (!spec.width) {
        let max = spec.header.length;
        s.rows.forEach((r) => {
          const v = r[spec.key];
          const len = v instanceof Date ? 18 : String(v ?? "").length;
          if (len > max) max = len;
        });
        col.width = Math.min(Math.max(max + 2, 12), 48);
      }
      col.alignment = { vertical: "top", wrapText: true };
      if (s.rows.some((r) => r[spec.key] instanceof Date)) col.numFmt = "dd mmm yyyy hh:mm";
    });

    if (s.rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.columns.length } };
    // Light row banding makes long lists easier to read
    for (let r = 3; r <= s.rows.length + 1; r += 2) {
      ws.getRow(r).eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F7" } };
      });
    }
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
