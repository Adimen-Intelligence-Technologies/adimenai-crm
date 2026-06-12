import { NextResponse, type NextRequest } from "next/server";
import { markNextActionDone } from "@/lib/repositories/activities";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const activity = await markNextActionDone(id, true);
    if (!activity) {
      return NextResponse.json(
        { error: "Actividad no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(activity);
  } catch (err) {
    console.error("POST /api/activities/[id]/done", err);
    return NextResponse.json(
      { error: "Error al marcar como hecho" },
      { status: 500 }
    );
  }
}
