"use client";

import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/repositories/tasks";
import { AssigneeAvatar } from "./assignee-avatar";
import { ScopeBadge } from "./scope-badge";

type Props = {
  task: Task;
  isDoneColumn?: boolean;
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

export const TaskCard = forwardRef<HTMLDivElement, Props>(function TaskCard(
  { task, isDoneColumn = false, onEdit, onDelete },
  ref
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = formatDueDate(task.dueDate ?? "");

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      style={style}
      className={cn(
        "group relative rounded-lg border p-3 shadow-xs transition-colors",
        isDoneColumn
          ? "border-green-200 bg-green-50 opacity-70"
          : "border-zinc-200 bg-white hover:border-zinc-300",
        isDragging && "cursor-grabbing border-[#3B1E8A] shadow-lg opacity-50",
        !isDragging && "cursor-grab"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <ScopeBadge scope={task.scope} />
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Editar tarea"
              className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
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
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <h3 className={cn("mt-2 text-sm font-semibold", isDoneColumn ? "text-zinc-500 line-through" : "text-zinc-900")}>{task.title}</h3>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <AssigneeAvatar assignee={task.assignee} size="sm" />
        {due && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <CalendarDays className="size-3" />
            {due}
          </span>
        )}
      </div>

      <GripVertical
        className="absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </div>
  );
});
