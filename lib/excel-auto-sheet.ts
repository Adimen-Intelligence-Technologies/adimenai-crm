import ExcelJS from "exceljs";
import { google } from "googleapis";
import { listTasks } from "@/lib/repositories/tasks";
import { taskAssigneeLabels } from "@/lib/schemas/task";

function sheetDateName(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

function getAssigneeName(assignee: string): string {
  return (
    taskAssigneeLabels[assignee as keyof typeof taskAssigneeLabels] ?? assignee
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export async function createDailySheetIfMissing() {
  const fileId = process.env.GOOGLE_DRIVE_FILE_ID;

  const url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;

  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  const today = new Date();
  const sheetName = sheetDateName(today);

  if (wb.worksheets.find((s) => s.name === sheetName)) {
    return { created: false, sheet: sheetName };
  }

  const tasks = await listTasks();
  if (tasks.length === 0) {
    return { created: false, sheet: sheetName, reason: "no tasks" };
  }

  const ws = wb.addWorksheet(sheetName);

  ws.getColumn(1).width = 26;
  ws.getColumn(2).width = 3;
  ws.getColumn(3).width = 10;
  ws.getColumn(4).width = 16;
  ws.getColumn(5).width = 3;
  ws.getColumn(6).width = 20;
  ws.getColumn(7).width = 3;
  ws.getColumn(8).width = 3;
  ws.getColumn(9).width = 18;
  ws.getColumn(10).width = 3;
  ws.getColumn(11).width = 15;
  ws.getColumn(12).width = 3;

  ws.mergeCells("A1:L1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "comité administrativo adimenAI";
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  ws.getCell("C2").value = "FECHA:";
  ws.getCell("C2").font = { bold: true };
  ws.getCell("D2").value = "ASISTENTES:";
  ws.getCell("D2").font = { bold: true };

  ws.getCell("F2").value = "I\u00F1aki Gabilondo";
  ws.getCell("F3").value = "Asier Karrara";
  ws.getCell("J2").value = "Andrea";
  ws.getCell("J3").value = "Joseba";

  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  ws.getCell("C3").value = dateStr;
  ws.getCell("C3").alignment = { horizontal: "left" };

  ws.getCell("A6").value = "ORDEN DEL D\u00CDA";
  ws.getCell("A6").font = { bold: true, size: 10 };
  ws.getCell("D6").value = "ACCIONES";
  ws.getCell("D6").font = { bold: true, size: 10 };
  ws.getCell("I6").value = "RESPONSABLE";
  ws.getCell("I6").font = { bold: true, size: 10 };
  ws.getCell("K6").value = "FECHA";
  ws.getCell("K6").font = { bold: true, size: 10 };

  ws.getCell("A7").value = "\u00C1MBITOS DE TRABAJO";
  ws.getCell("A7").font = { bold: true, size: 10, color: { argb: "FF666666" } };

  let rowNum = 8;
  for (const task of tasks) {
    const row = ws.getRow(rowNum);
    row.getCell(1).value = task.scope;
    row.getCell(4).value = task.title;
    row.getCell(9).value = getAssigneeName(task.assignee);
    row.getCell(11).value = formatDate(task.createdAt);

    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(4).font = { size: 10 };
    row.getCell(9).font = { size: 10 };
    row.getCell(11).font = { size: 10 };

    if (task.column === "done") {
      row.getCell(4).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6AA84F" },
      };
      row.getCell(4).font = { size: 10, underline: true };
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
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: newBuf,
    },
  });

  return { created: true, sheet: sheetName };
}
