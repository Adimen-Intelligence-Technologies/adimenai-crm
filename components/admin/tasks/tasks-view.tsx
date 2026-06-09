"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  taskAssigneeEnum,
  taskAssigneeLabels,
  taskColumnOrder,
  type TaskAssignee,
  type TaskColumn,
  type TaskScope,
} from "@/lib/schemas/task";
import type { Task } from "@/lib/repositories/tasks";
import { AssigneeAvatar } from "./assignee-avatar";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";

type ScopeFilter = "all" | TaskScope;

const scopeFilters: Array<{ id: ScopeFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "adimenai", label: "AdimenAi" },
  { id: "herrikonekt", label: "Herrikonekt" },
  { id: "hiopos", label: "Hiopos" },
  { id: "general", label: "General" },
];

type Props = {
  initialTasks: Task[];
};

export function TasksView({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [assignee, setAssignee] = useState<TaskAssignee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (scope !== "all" && t.scope !== scope) return false;
      if (assignee && t.assignee !== assignee) return false;
      return true;
    });
  }, [tasks, scope, assignee]);

  const tasksByColumn: Record<TaskColumn, Task[]> = {
    backlog: [],
    in_progress: [],
    done: [],
  };
  for (const t of filtered) {
    tasksByColumn[t.column].push(t);
  }

  const activeTask = useMemo(
    () => (activeId ? tasks.find((t) => t._id === activeId) ?? null : null),
    [activeId, tasks]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeTask = tasks.find((t) => t._id === activeIdStr);
    if (!activeTask) return;

    // Determinar columna destino:
    // - si se suelta sobre otra tarjeta, la columna destino es la de esa tarjeta
    // - si se suelta sobre una columna vacía (drop zone), la columna destino es la del over.id
    let targetColumn: TaskColumn;
    let targetOrder: number;

    if (taskColumnOrder.includes(overIdStr as TaskColumn)) {
      targetColumn = overIdStr as TaskColumn;
      targetOrder = tasksByColumn[targetColumn].length;
    } else {
      const overTask = tasks.find((t) => t._id === overIdStr);
      if (!overTask) return;
      targetColumn = overTask.column;
      const overIndex = tasksByColumn[targetColumn].findIndex(
        (t) => t._id === overIdStr
      );
      targetOrder = overIndex >= 0 ? overIndex : 0;
    }

    // Sin cambios
    if (
      activeTask.column === targetColumn &&
      activeTask.order === targetOrder
    ) {
      return;
    }

    // Update optimista
    const previous = tasks;
    const optimistic = computeOptimistic(
      tasks,
      activeIdStr,
      targetColumn,
      targetOrder
    );
    setTasks(optimistic);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks/${activeIdStr}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ column: targetColumn, order: targetOrder }),
        });
        if (!res.ok) throw new Error("Error al mover");
        const data = (await res.json()) as { moved: Task; affected: Task[] };
        // Reemplaza por la respuesta del backend
        setTasks((current) => mergeAffected(current, data.affected, activeIdStr));
      } catch (err) {
        console.error(err);
        setTasks(previous);
      }
    });
  }

  function handleSaved(task: Task) {
    setTasks((prev) => upsertTask(prev, task));
    setFormOpen(false);
    setEditing(null);
  }

  function handleEdit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
    try {
      const res = await fetch(`/api/tasks/${task._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
    } catch (err) {
      console.error(err);
      setTasks(previous);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Tareas
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona el trabajo del equipo. Arrastra las tarjetas para
            cambiar su estado.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
        >
          <Plus />
          Nueva tarea
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          className="inline-flex w-fit flex-wrap items-center gap-1 rounded-md border border-zinc-200 bg-white p-1"
          aria-label="Filtrar por ámbito"
        >
          {scopeFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setScope(f.id)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                scope === f.id
                  ? "bg-[#3B1E8A] text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              {f.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {assignee && (
            <button
              type="button"
              onClick={() => setAssignee(null)}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Filtrando por {taskAssigneeLabels[assignee]}
              <X className="size-3.5 text-zinc-400" />
            </button>
          )}
          <div className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-1">
            {taskAssigneeEnum.options.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAssignee(assignee === a ? null : a)}
                className={cn(
                  "rounded-sm p-1 transition-colors",
                  assignee === a
                    ? "ring-2 ring-[#3B1E8A] ring-offset-1"
                    : "opacity-50 hover:opacity-100"
                )}
                aria-label={`Filtrar por ${taskAssigneeLabels[a]}`}
              >
                <AssigneeAvatar assignee={a} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {taskColumnOrder.map((col) => (
            <KanbanColumn
              key={col}
              column={col}
              tasks={tasksByColumn[col]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskForm
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing ?? undefined}
        onSaved={handleSaved}
      />
    </div>
  );
}

function computeOptimistic(
  tasks: Task[],
  activeId: string,
  targetColumn: TaskColumn,
  targetOrder: number
): Task[] {
  const active = tasks.find((t) => t._id === activeId);
  if (!active) return tasks;

  const fromColumn = active.column;
  const fromOrder = active.order;

  let next = tasks.map((t) => ({ ...t }));

  if (fromColumn === targetColumn) {
    const colTasks = next
      .filter((t) => t.column === targetColumn && t._id !== activeId)
      .sort((a, b) => a.order - b.order);
    colTasks.splice(targetOrder, 0, { ...active, column: targetColumn });
    colTasks.forEach((t, i) => (t.order = i));
    next = next.map(
      (t) => colTasks.find((c) => c._id === t._id) ?? t
    );
  } else {
    next = next
      .filter((t) => t.column !== fromColumn || t._id === activeId)
      .map((t) =>
        t.column === fromColumn && t.order > fromOrder
          ? { ...t, order: t.order - 1 }
          : t
      );
    next = next
      .filter((t) => t.column !== targetColumn || t._id === activeId)
      .map((t) =>
        t.column === targetColumn && t.order >= targetOrder
          ? { ...t, order: t.order + 1 }
          : t
      );
    next = next.map((t) =>
      t._id === activeId
        ? { ...t, column: targetColumn, order: targetOrder }
        : t
    );
  }

  return next;
}

function mergeAffected(
  current: Task[],
  affected: Task[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _activeId: string
): Task[] {
  const byId = new Map(affected.map((t) => [t._id, t]));
  return current.map((t) => byId.get(t._id) ?? t);
}

function upsertTask(current: Task[], task: Task): Task[] {
  const idx = current.findIndex((t) => t._id === task._id);
  if (idx >= 0) {
    const next = [...current];
    next[idx] = task;
    return next;
  }
  return [...current, task];
}
