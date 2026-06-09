import fs from "fs";
import { google } from "googleapis";
import ExcelJS from "exceljs";

const env = fs.readFileSync(".env.local", "utf8");
const start = env.indexOf("'{\n");
const end = env.indexOf("\n}'");
const json = env.slice(start + 1, end + 2);
const creds = JSON.parse(json);

const auth = new google.auth.JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

const res = await drive.files.get(
  { fileId: "1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq", alt: "media" },
  { responseType: "arraybuffer" }
);

const wb = new ExcelJS.Workbook();
await wb.xlsx.load(Buffer.from(res.data));

function inspect(sheet, name) {
  console.log(`\n=== ${name} ===`);
  
  console.log("Column widths:");
  for (let c = 1; c <= 12; c++) {
    const col = sheet.getColumn(c);
    console.log(`  Col ${c}: width=${col.width}, hidden=${col.hidden}`);
  }

  console.log("Row heights:");
  for (let r = 1; r <= Math.min(12, sheet.rowCount); r++) {
    const row = sheet.getRow(r);
    console.log(`  Row ${r}: height=${row.height}`);
  }
}

const s1 = wb.getWorksheet("09062026");
const s2 = wb.getWorksheet("10062026");

if (s1 && s2) {
  inspect(s1, "09062026");
  inspect(s2, "10062026");

  // Compare more properties
  console.log("\n=== CELL BY CELL COMPARISON ===");
  for (let r = 1; r <= 12; r++) {
    console.log(`\nRow ${r}:`);
    for (let c = 1; c <= 12; c++) {
      const cell1 = s1.getRow(r).getCell(c);
      const cell2 = s2.getRow(r).getCell(c);
      const v1 = cell1.value;
      const v2 = cell2.value;
      if (v1 !== undefined || v2 !== undefined) {
        const f1 = cell1.font || {};
        const f2 = cell2.font || {};
        const fill1 = cell1.fill?.fgColor?.argb;
        const fill2 = cell2.fill?.fgColor?.argb;
        const a1 = cell1.alignment || {};
        const a2 = cell2.alignment || {};
        const diff = [];
        if (JSON.stringify(v1) !== JSON.stringify(v2)) diff.push(`val: ${JSON.stringify(v1).slice(0,30)} vs ${JSON.stringify(v2).slice(0,30)}`);
        if (f1.bold !== f2.bold || f1.size !== f2.size || f1.color?.argb !== f2.color?.argb) diff.push(`font: ${JSON.stringify({bold:f1.bold,size:f1.size,color:f1.color?.argb})} vs ${JSON.stringify({bold:f2.bold,size:f2.size,color:f2.color?.argb})}`);
        if (fill1 !== fill2) diff.push(`fill: ${fill1} vs ${fill2}`);
        if (a1.horizontal !== a2.horizontal || a1.vertical !== a2.vertical || a1.wrapText !== a2.wrapText) diff.push(`align: ${JSON.stringify(a1)} vs ${JSON.stringify(a2)}`);
        if (diff.length > 0) {
          console.log(`  Cell (${r},${c}): ${diff.join(" | ")}`);
        }
      }
    }
  }

// Print merges
console.log("\nMerges in 09062026:");
(s1.model.merges || []).forEach(m => console.log(" ", JSON.stringify(m?.range || m)));

console.log("\nMerges in 10062026:");
(s2.model.merges || []).forEach(m => console.log(" ", JSON.stringify(m?.range || m)));
} else {
  console.log("Sheets not found");
}
