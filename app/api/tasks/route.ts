import { NextResponse, type NextRequest } from "next/server";
import {
  createTaskSchema,
  taskAssigneeEnum,
  taskColumnEnum,
  taskScopeEnum,
} from "@/lib/schemas/task";
import { createTask, listTasks } from "@/lib/repositories/tasks";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const assignee = searchParams.get("assignee");
    const column = searchParams.get("column");

    const filter: Parameters<typeof listTasks>[0] = {};
    if (scope) {
      const parsed = taskScopeEnum.safeParse(scope);
      if (!parsed.success) {
        return NextResponse.json({ error: "scope inválido" }, { status: 400 });
      }
      filter.scope = parsed.data;
    }
    if (assignee) {
      const parsed = taskAssigneeEnum.safeParse(assignee);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "assignee inválido" },
          { status: 400 }
        );
      }
      filter.assignee = parsed.data;
    }
    if (column) {
      const parsed = taskColumnEnum.safeParse(column);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "column inválido" },
          { status: 400 }
        );
      }
      filter.column = parsed.data;
    }

    const tasks = await listTasks(filter);
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks", err);
    return NextResponse.json(
      { error: "Error al listar tareas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
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
    const task = await createTask(parsed.data);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks", err);
    return NextResponse.json(
      { error: "Error al crear la tarea" },
      { status: 500 }
    );
  }
}
