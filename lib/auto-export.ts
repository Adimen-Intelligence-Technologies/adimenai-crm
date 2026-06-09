import { exportTasksToDrive } from "./excel-export";

let timer: ReturnType<typeof setTimeout> | null = null;

export function scheduleAutoExport() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    exportTasksToDrive().catch((err) =>
      console.error("Auto-export failed:", err)
    );
  }, 3000);
}
