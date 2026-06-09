import { NextResponse } from "next/server";
import { exportTasksToDrive } from "@/lib/excel-export";

export async function POST() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
      return NextResponse.json(
        { error: "GOOGLE_SERVICE_ACCOUNT no está configurado" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_DRIVE_FILE_ID) {
      return NextResponse.json(
        { error: "GOOGLE_DRIVE_FILE_ID no está configurado" },
        { status: 500 }
      );
    }

    const result = await exportTasksToDrive();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error al exportar a Drive:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al exportar a Drive",
      },
      { status: 500 }
    );
  }
}
