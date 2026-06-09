import ExcelJS from "exceljs";
import { google } from "googleapis";
import { listTasks } from "@/lib/repositories/tasks";
import { taskAssigneeLabels } from "@/lib/schemas/task";

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

export async function exportTasksToDrive() {
  const fileId = process.env.GOOGLE_DRIVE_FILE_ID;
  if (!fileId) {
    throw new Error("GOOGLE_DRIVE_FILE_ID no está configurado en .env.local");
  }

  // 1. Descargar el workbook existente para preservar todas las pestañas
  const url = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buf);

  // 2. Buscar o crear la hoja "comité administrativo adimenAI"
  const adminName = "comité administrativo adimenAI";
  let sheet = workbook.getWorksheet(adminName);
  if (!sheet) {
    const matching = workbook.worksheets.filter(
      (ws) => ws.name.toLowerCase().includes("comité") || ws.name.toLowerCase().includes("administrativo")
    );
    if (matching.length > 0) {
      sheet = matching[0];
      sheet.name = adminName;
      // Eliminar duplicados
      for (let i = 1; i < matching.length; i++) {
        workbook.removeWorksheet(matching[i].id);
      }
    }
  }
  if (!sheet) {
    sheet = workbook.addWorksheet(adminName, {
      properties: { tabColor: { argb: "FF3B1E8A" } },
    });
  }

  // 3. Limpiar todas las filas existentes (excepto las cabeceras, las reescribimos)
  const rowCount = sheet.rowCount;
  if (rowCount >= 1) {
    for (let r = 1; r <= rowCount; r++) {
      sheet.getRow(r).values = [];
    }
  }

  const tasks = await listTasks();
  const today = new Date();
  const dateStr = formatDate(today.toISOString());

  sheet.getColumn(1).width = 26;
  sheet.getColumn(2).width = 3;
  sheet.getColumn(3).width = 10;
  sheet.getColumn(4).width = 16;
  sheet.getColumn(5).width = 3;
  sheet.getColumn(6).width = 20;
  sheet.getColumn(7).width = 3;
  sheet.getColumn(8).width = 3;
  sheet.getColumn(9).width = 3;
  sheet.getColumn(10).width = 18;
  sheet.getColumn(11).width = 3;
  sheet.getColumn(12).width = 15;

  sheet.mergeCells("A1:L1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "comité administrativo adimenAI";
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  sheet.getCell("C2").value = "FECHA:";
  sheet.getCell("C2").font = { bold: true };
  sheet.getCell("D2").value = "ASISTENTES:";
  sheet.getCell("D2").font = { bold: true };
  sheet.getCell("F2").value = "Iñaki Gabilondo";
  sheet.getCell("F3").value = "Asier Karrara";
  sheet.getCell("J2").value = "Andrea";
  sheet.getCell("J3").value = "Joseba";

  sheet.getCell("C3").value = dateStr;
  sheet.getCell("C3").alignment = { horizontal: "left" };

  sheet.getCell("A6").value = "ORDEN DEL DÍA";
  sheet.getCell("A6").font = { bold: true, size: 10 };
  sheet.getCell("D6").value = "ACCIONES";
  sheet.getCell("D6").font = { bold: true, size: 10 };
  sheet.getCell("J6").value = "RESPONSABLE";
  sheet.getCell("J6").font = { bold: true, size: 10 };
  sheet.getCell("L6").value = "FECHA";
  sheet.getCell("L6").font = { bold: true, size: 10 };

  sheet.getCell("A7").value = "ÁMBITOS DE TRABAJO";
  sheet.getCell("A7").font = { bold: true, size: 10, color: { argb: "FF666666" } };

  let rowNum = 8;
  for (const task of tasks) {
    const row = sheet.getRow(rowNum);
    row.getCell(1).value = task.scope;
    row.getCell(4).value = task.title;
    row.getCell(10).value = getAssigneeName(task.assignee);
    row.getCell(12).value = formatDate(task.createdAt);

    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(4).font = { size: 10 };
    row.getCell(10).font = { size: 10 };
    row.getCell(12).font = { size: 10 };

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

  // 4. También pintar las tareas done en las hojas con fecha (para que el sync no las revierta)
  const dateSheets = workbook.worksheets
    .map((s) => s.name)
    .filter((n) => /^\d{8}$/.test(n))
    .sort((a, b) => {
      const toKey = (s: string) => s.substring(4, 8) + s.substring(2, 4) + s.substring(0, 2);
      return toKey(b).localeCompare(toKey(a));
    });

  const doneTasks = tasks.filter((t) => t.column === "done");

  for (const sheetName of dateSheets) {
    const dateSheet = workbook.getWorksheet(sheetName);
    if (!dateSheet) continue;

    let currentScope = "";

    for (let r = 8; r <= dateSheet.rowCount; r++) {
      const row = dateSheet.getRow(r);
      const scope = row.getCell(1).value;
      const action = row.getCell(4).value;

      if (!action) continue;
      const scopeStr = scope ? String(scope).trim() : "";
      if (scopeStr && scopeStr !== "ÁMBITOS DE TRABAJO") {
        currentScope = scopeStr;
      }

      const actionStr = String(action).trim();
      const matched = doneTasks.find(
        (t) =>
          t.title.trim().toLowerCase() === actionStr.toLowerCase() &&
          t.scope.trim().toLowerCase() === (currentScope || "general").toLowerCase()
      );

      if (matched) {
        row.getCell(4).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF6AA84F" },
        };
        const existingFont = row.getCell(4).font;
        row.getCell(4).font = { ...existingFont, underline: true };
      }
    }
  }

  const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;

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
      body: buffer,
    },
  });

  return { success: true, taskCount: tasks.length };
}
