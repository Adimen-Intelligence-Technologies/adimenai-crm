import { NextResponse } from "next/server";
import { syncTasksFromExcel } from "@/lib/excel-sync";

export async function POST() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      return NextResponse.json(
        { error: "GOOGLE_SERVICE_ACCOUNT no está configurado" },
        { status: 500 }
      );
    }

    const { tasks, ...result } = await syncTasksFromExcel();
    return NextResponse.json({ ...result, tasks });
  } catch (err) {
    console.error("Error sincronizando desde Excel:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al sincronizar",
      },
      { status: 500 }
    );
  }
}
