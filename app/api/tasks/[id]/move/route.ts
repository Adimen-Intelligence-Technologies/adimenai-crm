import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { moveTask } from "@/lib/repositories/tasks";
import { taskColumnEnum } from "@/lib/schemas/task";

const moveSchema = z.object({
  column: taskColumnEnum,
  order: z.number().int().min(0),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = moveSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".") || "campo"}: ${firstIssue.message}`
        : "Datos inválidos";
      return NextResponse.json({ error: detail }, { status: 400 });
    }
    const result = await moveTask(id, parsed.data.column, parsed.data.order);
    if (!result) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("PATCH /api/tasks/[id]/move", err);
    return NextResponse.json(
      { error: "Error al mover la tarea" },
      { status: 500 }
    );
  }
}
