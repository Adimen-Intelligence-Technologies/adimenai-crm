import { NextResponse, type NextRequest } from "next/server";
import { updateServiceSchema } from "@/lib/schemas/service";
import { deleteService, getService, updateService } from "@/lib/repositories/services";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const service = await getService(id);
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (err) {
    console.error("GET /api/services/[id]", err);
    return NextResponse.json({ error: "Error al obtener servicio" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".") || "campo"}: ${firstIssue.message}`
        : "Datos inválidos";
      return NextResponse.json(
        { error: detail, issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const patchData: Record<string, unknown> = {};
    for (const key of Object.keys(body)) {
      const val = parsed.data[key as keyof typeof parsed.data];
      if (val !== undefined) patchData[key] = val;
    }
    const service = await updateService(id, patchData);
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (err) {
    console.error("PATCH /api/services/[id]", err);
    return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteService(id);
    if (!ok) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/services/[id]", err);
    return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 });
  }
}
