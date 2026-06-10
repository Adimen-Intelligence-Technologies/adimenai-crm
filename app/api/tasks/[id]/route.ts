import { NextResponse, type NextRequest } from "next/server";
import { updateTaskSchema } from "@/lib/schemas/task";
import { deleteTask, getTask, updateTask } from "@/lib/repositories/tasks";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(task);
  } catch (err) {
    console.error("GET /api/tasks/[id]", err);
    return NextResponse.json(
      { error: "Error al obtener la tarea" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
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
    const task = await updateTask(id, parsed.data);
    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(task);
  } catch (err) {
    console.error("PATCH /api/tasks/[id]", err);
    return NextResponse.json(
      { error: "Error al actualizar la tarea" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteTask(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/tasks/[id]", err);
    return NextResponse.json(
      { error: "Error al eliminar la tarea" },
      { status: 500 }
    );
  }
}
