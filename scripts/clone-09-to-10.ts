import ExcelJS from "exceljs";
import { google } from "googleapis";

const SOURCE = "09062026";
const TARGET = "10062026";
const BLUE = "FF0B769F";
const LIGHT_BLUE = "FF45B0E1";
const GREEN = "FF3A7D22";
const WHITE = "FFFFFFFF";

async function main() {
  const fileId = process.env.GOOGLE_DRIVE_FILE_ID!;

  const url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  const src = wb.getWorksheet(SOURCE);
  if (!src) { console.log(`Source ${SOURCE} not found`); return; }

  const rows: { scope: string; action: string; assignee: string; done: boolean }[] = [];
  for (let r = 8; r <= src.rowCount; r++) {
    const row = src.getRow(r);
    const action = row.getCell(4).value;
    if (!action) continue;
    const scopeCell = row.getCell(1).value;
    const scope = scopeCell ? String(scopeCell).trim() : "";
    if (scope === "ÁMBITOS DE TRABAJO") continue;
    let assignee = row.getCell(10).value;
    if (!assignee) assignee = row.getCell(9).value;
    const assigneeStr = assignee ? String(assignee).trim() : "";
    // Cualquier relleno explícito (con argb) = done
    const fill = row.getCell(4).fill as any;
    const done = !!(fill?.fgColor?.argb);
    rows.push({ scope, action: String(action).trim(), assignee: assigneeStr, done });
  }

  const doneCount = rows.filter(r => r.done).length;
  console.log(`Read ${rows.length} rows from ${SOURCE}, ${doneCount} done`);

  const existing = wb.getWorksheet(TARGET);
  if (existing) wb.removeWorksheet(existing.id);

  const ws = wb.addWorksheet(TARGET);
  for (let c = 1; c <= 10; c++) ws.getColumn(c).width = 12.57;

  const centerWrap = { horizontal: "center" as const, vertical: "middle" as const, wrapText: true as const };
  const labelStyle = { bold: true, size: 11, color: { argb: GREEN } };

  ws.mergeCells("C1:J1");
  ws.getCell("C1").value = "comité administrativo adimenAI";
  ws.getCell("C1").font = { bold: true, size: 14, color: { argb: WHITE } };
  ws.getCell("C1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
  ws.getCell("C1").alignment = { horizontal: "center", vertical: "middle", wrapText: true };

  ws.mergeCells("D2:E4");
  ws.getCell("D2").value = "ASISTENTES:    ";
  ws.getCell("D2").font = labelStyle;
  ws.getCell("D2").alignment = centerWrap;

  ws.getCell("C2").value = "FECHA:";
  ws.getCell("C2").font = labelStyle;
  ws.getCell("C2").alignment = centerWrap;

  ws.mergeCells("F2:G2");
  ws.getCell("F2").value = "Iñaki Gabilondo";
  ws.getCell("F2").font = { size: 11 };
  ws.getCell("F2").alignment = centerWrap;

  ws.mergeCells("F3:G3");
  ws.getCell("F3").value = "Asier Karrara";
  ws.getCell("F3").font = { size: 11 };
  ws.getCell("F3").alignment = centerWrap;

  ws.getCell("C3").value = new Date(2026, 5, 10);
  ws.getCell("C3").font = { size: 11 };
  ws.getCell("C3").alignment = centerWrap;
  ws.getCell("C3").numFmt = "dd/mm/yyyy";

  const headerStyle = { bold: true, size: 11 };
  const headerFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: BLUE } };

  ws.mergeCells("A6:C6");
  ws.getCell("A6").value = "ORDEN DEL DÍA";
  ws.getCell("A6").font = { ...headerStyle, color: { argb: WHITE } };
  ws.getCell("A6").fill = headerFill;
  ws.getCell("A6").alignment = { horizontal: "center", wrapText: true };

  ws.mergeCells("D6:H6");
  ws.getCell("D6").value = "ACCIONES";
  ws.getCell("D6").font = { ...headerStyle, color: { argb: WHITE } };
  ws.getCell("D6").fill = headerFill;
  ws.getCell("D6").alignment = { horizontal: "left", wrapText: true };

  ws.mergeCells("I6:J6");
  ws.getCell("I6").value = "RESPONSABLE";
  ws.getCell("I6").font = { ...headerStyle, color: { argb: WHITE } };
  ws.getCell("I6").fill = headerFill;
  ws.getCell("I6").alignment = { horizontal: "center", wrapText: true };

  ws.mergeCells("A7:J7");
  ws.getCell("A7").value = "ÁMBITOS DE TRABAJO";
  ws.getCell("A7").font = { bold: true, size: 11 };
  ws.getCell("A7").fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_BLUE } };
  ws.getCell("A7").alignment = { horizontal: "left", vertical: "middle", wrapText: true };
  for (let c = 2; c <= 10; c++)
    ws.getCell(7, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_BLUE } };

  const scopeFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: BLUE } };

  let rowNum = 8;
  let scopeStartRow = 8;

  for (let i = 0; i < rows.length; i++) {
    const { scope, action, assignee, done } = rows[i];

    ws.mergeCells(`D${rowNum}:H${rowNum}`);
    ws.mergeCells(`I${rowNum}:J${rowNum}`);

    const row = ws.getRow(rowNum);
    row.getCell(1).value = scope;
    row.getCell(4).value = action;
    row.getCell(9).value = assignee;

    row.getCell(1).font = { bold: true, size: 11, color: { argb: WHITE } };
    row.getCell(1).fill = scopeFill;
    row.getCell(1).alignment = { horizontal: "right", vertical: "top" };

    row.getCell(4).font = { size: 11 };
    row.getCell(4).alignment = { horizontal: "left", vertical: "middle", wrapText: true };

    row.getCell(9).font = { size: 11 };
    row.getCell(9).alignment = { horizontal: "right", vertical: "middle", wrapText: true };

    if (done) {
      row.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6AA84F" } };
      row.getCell(4).font = { size: 11, underline: true };
    }

    const nextScope = i < rows.length - 1 ? rows[i + 1].scope : null;
    if (nextScope !== scope) {
      ws.mergeCells(`A${scopeStartRow}:C${rowNum}`);
      scopeStartRow = rowNum + 1;
    }

    rowNum++;
  }

  const newBuf = (await wb.xlsx.writeBuffer()) as unknown as Buffer;

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  await drive.files.update({
    fileId,
    media: {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: newBuf,
    },
  });

  console.log(`Cloned ${rows.length} rows (${doneCount} done) to ${TARGET}`);
}

main().catch(console.error);
