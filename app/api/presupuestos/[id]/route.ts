import { NextResponse, type NextRequest } from "next/server";
import { updatePresupuestoSchema } from "@/lib/schemas/presupuesto";
import {
  deletePresupuesto,
  getPresupuesto,
  updatePresupuesto,
} from "@/lib/repositories/presupuestos";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const presupuesto = await getPresupuesto(id);
    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(presupuesto);
  } catch (err) {
    console.error("GET /api/presupuestos/[id]", err);
    return NextResponse.json({ error: "Error al obtener presupuesto" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePresupuestoSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".") || "campo"}: ${firstIssue.message}`
        : "Datos inválidos";
      return NextResponse.json({ error: detail, issues: parsed.error.flatten() }, { status: 400 });
    }
    const presupuesto = await updatePresupuesto(id, parsed.data);
    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(presupuesto);
  } catch (err) {
    console.error("PATCH /api/presupuestos/[id]", err);
    return NextResponse.json({ error: "Error al actualizar presupuesto" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deletePresupuesto(id);
    if (!ok) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/presupuestos/[id]", err);
    return NextResponse.json({ error: "Error al eliminar presupuesto" }, { status: 500 });
  }
}
