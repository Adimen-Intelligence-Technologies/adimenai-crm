"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  taskAssigneeLabels,
  taskColumnLabels,
  type TaskAssignee,
  type TaskColumn,
} from "@/lib/schemas/task";
import type { Task } from "@/lib/repositories/tasks";
import { AssigneeAvatar } from "./assignee-avatar";
import { ScopeBadge } from "./scope-badge";

type Props = {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

function formatDueDate(dueDate: string): string | null {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

export function TaskList({ tasks, onEdit, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-4 py-12 text-center text-sm text-zinc-500">
        No hay tareas para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th className="px-4 py-2.5 w-16">Orden</th>
            <th className="px-4 py-2.5">Acción</th>
            <th className="px-4 py-2.5">Responsable</th>
            <th className="hidden px-4 py-2.5 md:table-cell">Estado</th>
            <th className="hidden px-4 py-2.5 lg:table-cell">Fecha</th>
            <th className="px-4 py-2.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {tasks.map((task, i) => (
            <Row
              key={task._id}
              task={task}
              order={i + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  task,
  order,
  onEdit,
  onDelete,
}: {
  task: Task;
  order: number;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}) {
  const isDone = task.column === "done";
  const due = formatDueDate(task.dueDate ?? "");

  return (
    <tr
      className={cn(
        "group relative border-l-4 transition-colors hover:bg-zinc-50/60",
        isDone
          ? "border-l-emerald-500 bg-emerald-50/30"
          : "border-l-transparent"
      )}
    >
      <td className="px-4 py-3 text-zinc-500 tabular-nums">{order}</td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "font-medium",
              isDone ? "text-zinc-600 line-through" : "text-zinc-900"
            )}
          >
            {task.title}
          </span>
          {task.description && (
            <span className="line-clamp-1 text-xs text-zinc-500">
              {task.description}
            </span>
          )}
          <div className="mt-0.5 flex items-center gap-1.5">
            <ScopeBadge scope={task.scope} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <AssigneeAvatar assignee={task.assignee} size="sm" showName />
      </td>
      <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">
        {taskColumnLabels[task.column as TaskColumn]}
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        {due ? (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <CalendarDays className="size-3" />
            {due}
          </span>
        ) : (
          <span className="text-zinc-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${taskAssigneeLabels[task.assignee as TaskAssignee]}`}
              className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              onClick={() => onEdit(task)}
            >
              <Pencil />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Eliminar tarea"
              className="text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
              onClick={() => onDelete(task)}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
