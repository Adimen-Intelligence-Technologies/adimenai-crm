import { exportTasksToDrive } from "./excel-export";

export function scheduleAutoExport() {
  exportTasksToDrive().catch((err) =>
    console.error("Auto-export failed:", err)
  );
}
