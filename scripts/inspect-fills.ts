import ExcelJS from "exceljs";

async function main() {
  const fileId = process.env.GOOGLE_DRIVE_FILE_ID!;
  const url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  const ws = wb.getWorksheet("09062026");
  if (!ws) { console.log("Not found"); return; }

  const fills = new Set<string>();
  for (let r = 8; r <= ws.rowCount; r++) {
    const action = ws.getRow(r).getCell(4).value;
    if (!action) continue;
    const fill = ws.getRow(r).getCell(4).fill as any;
    if (fill?.fgColor?.argb) {
      fills.add(fill.fgColor.argb);
      console.log(`Row ${r}: argb="${fill.fgColor.argb}" type="${fill.type}" pattern="${fill.pattern}" action="${String(action).substring(0, 50)}"`);
    } else {
      console.log(`Row ${r}: NO FILL, raw fill=`, JSON.stringify(fill));
    }
  }
  console.log("Unique fills:", [...fills]);
}

main().catch(console.error);
