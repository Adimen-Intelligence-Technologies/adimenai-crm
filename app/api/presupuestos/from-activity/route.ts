import { NextResponse, type NextRequest } from "next/server";
import { createPresupuestoFromActivity } from "@/lib/repositories/presupuestos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, businessLine } = body;
    if (!activityId) {
      return NextResponse.json({ error: "activityId es obligatorio" }, { status: 400 });
    }
    if (!businessLine) {
      return NextResponse.json({ error: "businessLine es obligatorio" }, { status: 400 });
    }

    const presupuesto = await createPresupuestoFromActivity(activityId, businessLine);
    return NextResponse.json({ presupuesto }, { status: 201 });
  } catch (err) {
    console.error("POST /api/presupuestos/from-activity", err);
    const message = err instanceof Error ? err.message : "Error al crear presupuesto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
