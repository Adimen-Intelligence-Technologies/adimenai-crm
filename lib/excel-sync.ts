import ExcelJS from "exceljs";
import { listTasks, createTask, updateTask, deleteTask } from "@/lib/repositories/tasks";
import type { Task } from "@/lib/repositories/tasks";

const ASSIGNEE_MAP: Record<string, string> = {
  iñaki: "inaki",
  "iñaki&karra": "inaki",
  "iñaki&asier": "inaki",
  karra: "asier",
  asier: "asier",
  andrea: "andrea",
  joseba: "joseba",
};

function normalizeKey(scope: string, title: string): string {
  return `${scope.trim().toLowerCase()}||${title.trim().toLowerCase()}`;
}

export async function syncTasksFromExcel() {
  const syncStart = new Date().toISOString();

  const url =
    "https://docs.google.com/spreadsheets/d/1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq/export?format=xlsx";

  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  // Find the most recent sheet by date name (DDMMYYYY) that has actual data
  const sortedSheets = wb.worksheets
    .map((s) => s.name)
    .filter((n) => /^\d{8}$/.test(n))
    .sort((a, b) => {
      const toKey = (s: string) => s.substring(4, 8) + s.substring(2, 4) + s.substring(0, 2);
      return toKey(b).localeCompare(toKey(a));
    });

  if (sortedSheets.length === 0) {
    throw new Error("No se encontró ninguna hoja con formato fecha");
  }

  // Probar hojas desde la más reciente hasta la más antigua, saltando las vacías
  let latestSheetName: string | null = null;
  let ws: ExcelJS.Worksheet | null = null;

  for (const name of sortedSheets) {
    const sheet = wb.getWorksheet(name)!;
    const hasData = Array.from({ length: sheet.rowCount - 7 }, (_, i) => i + 8)
      .some((r) => {
        const val = sheet.getRow(r).getCell(4).value;
        return val && String(val).trim().length > 0;
      });
    if (hasData) {
      latestSheetName = name;
      ws = sheet;
      break;
    }
  }

  // Si todas están vacías, usar la primera
  if (!latestSheetName) {
    latestSheetName = sortedSheets[0];
    ws = wb.getWorksheet(latestSheetName)!;
  }

  if (!ws || !latestSheetName) {
    throw new Error("No se encontró ninguna hoja con datos");
  }

  // Read Excel rows
  const excelTasks: Array<{
    scope: string;
    title: string;
    column: "backlog" | "done";
    assignee: Task["assignee"];
  }> = [];

  let currentScope = "";

  for (let r = 8; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const scope = row.getCell(1).value;
    const action = row.getCell(4).value;
    const responsible = row.getCell(9).value;

    if (!action) continue;
    const actionStr = String(action).trim();
    const scopeStr = scope ? String(scope).trim() : "";

    if (scopeStr && scopeStr !== "ÁMBITOS DE TRABAJO") {
      currentScope = scopeStr;
    }

    const lowerAction = actionStr.toLowerCase();
    if (
      scopeStr === "ÁMBITOS DE TRABAJO" ||
      lowerAction.includes("próximo comité") ||
      lowerAction.includes("proximo comité")
    )
      continue;

    const cell = row.getCell(4);
    const cellFill = cell.fill as { fgColor?: { argb?: string } } | null | undefined;
    const isGreen = cellFill?.fgColor?.argb === "FF6AA84F";
    const isUnderlined = !!(cell.font as { underline?: boolean | string } | null | undefined)?.underline;
    const isDone = isGreen || isUnderlined;

    const respStr = responsible
      ? String(responsible).trim().toLowerCase().replace(/\s+/g, "")
      : "";
    const assignee =
      (ASSIGNEE_MAP[respStr] as Task["assignee"]) ?? ("inaki" as Task["assignee"]);

    excelTasks.push({
      scope: currentScope || "General",
      title: actionStr,
      column: isDone ? "done" : "backlog",
      assignee,
    });
  }

  // Build lookup by key from existing DB tasks
  const dbTasks = await listTasks();
  const dbByKey = new Map<string, Task>();
  for (const t of dbTasks) {
    const key = normalizeKey(t.scope, t.title);
    dbByKey.set(key, t);
  }

  let created = 0;
  let updated = 0;
  let deleted = 0;

  for (const ex of excelTasks) {
    const key = normalizeKey(ex.scope, ex.title);
    const existing = dbByKey.get(key);

    if (existing) {
      // Si la tarea se modificó en CRM después de que este sync empezara, no la sobrescribimos
      if (existing.updatedAt > syncStart) continue;

      const isPending = existing.column === "backlog" || existing.column === "in_progress";
      const shouldBePending = ex.column === "backlog";

      if (isPending !== shouldBePending) {
        await updateTask(existing._id, {
          column: shouldBePending ? "backlog" : "done",
          assignee: ex.assignee,
        });
        updated++;
      } else if (existing.assignee !== ex.assignee) {
        await updateTask(existing._id, { assignee: ex.assignee });
        updated++;
      }
    } else {
      await createTask({
        title: ex.title,
        description: "",
        scope: ex.scope,
        column: "backlog",
        assignee: ex.assignee,
        dueDate: "",
      });
      created++;
    }
  }

  // Delete done tasks that no longer appear in Excel
  const excelKeys = new Set(excelTasks.map((ex) => normalizeKey(ex.scope, ex.title)));
  for (const dbTask of dbTasks) {
    if (dbTask.column !== "done") continue;
    const key = normalizeKey(dbTask.scope, dbTask.title);
    if (!excelKeys.has(key)) {
      await deleteTask(dbTask._id);
      deleted++;
    }
  }

  const allTasks = await listTasks();

  return {
    created,
    updated,
    deleted,
    total: excelTasks.length,
    sheet: latestSheetName,
    tasks: allTasks,
  };
}
