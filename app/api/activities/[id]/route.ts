import { NextResponse, type NextRequest } from "next/server";
import { updateActivitySchema } from "@/lib/schemas/activity";
import {
  deleteActivity,
  getActivity,
  updateActivity,
} from "@/lib/repositories/activities";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const activity = await getActivity(id);
    if (!activity) {
      return NextResponse.json(
        { error: "Actividad no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(activity);
  } catch (err) {
    console.error("GET /api/activities/[id]", err);
    return NextResponse.json(
      { error: "Error al obtener la actividad" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateActivitySchema.safeParse(body);
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
    const activity = await updateActivity(id, parsed.data);
    if (!activity) {
      return NextResponse.json(
        { error: "Actividad no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(activity);
  } catch (err) {
    console.error("PATCH /api/activities/[id]", err);
    return NextResponse.json(
      { error: "Error al actualizar la actividad" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteActivity(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Actividad no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/activities/[id]", err);
    return NextResponse.json(
      { error: "Error al eliminar la actividad" },
      { status: 500 }
    );
  }
}
