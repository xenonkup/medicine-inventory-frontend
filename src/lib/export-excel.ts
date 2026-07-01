import * as XLSX from "xlsx";

interface SheetDef {
  name: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

export function exportToExcel(sheets: SheetDef[], filename: string) {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const data = [sheet.headers, ...sheet.rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto column width
    const colWidths = sheet.headers.map((h, ci) => {
      const maxLen = Math.max(
        h.length,
        ...sheet.rows.map((r) => String(r[ci] ?? "").length),
      );
      return { wch: Math.min(maxLen + 4, 40) };
    });
    ws["!cols"] = colWidths;

    // Bold header row
    for (let ci = 0; ci < sheet.headers.length; ci++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
      if (ws[cellRef]) ws[cellRef].s = { font: { bold: true } };
    }

    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
