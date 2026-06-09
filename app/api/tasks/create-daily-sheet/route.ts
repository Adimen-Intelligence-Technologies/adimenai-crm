import { NextResponse } from "next/server";
import { createDailySheetIfMissing } from "@/lib/excel-auto-sheet";

export async function POST() {
  try {
    const result = await createDailySheetIfMissing();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error creando hoja diaria:", err);
    return NextResponse.json(
      { created: false },
      { status: 200 }
    );
  }
}
