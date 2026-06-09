"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import {
  taskColumnLabels,
  type TaskColumn,
} from "@/lib/schemas/task";
import type { Task } from "@/lib/repositories/tasks";
import { TaskCard } from "./task-card";

type Props = {
  column: TaskColumn;
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

const headerStyles: Record<TaskColumn, { dot: string; title: string }> = {
  backlog: { dot: "bg-zinc-400", title: "text-zinc-700" },
  in_progress: { dot: "bg-[#3B1E8A]", title: "text-zinc-900" },
  done: { dot: "bg-emerald-600", title: "text-zinc-500" },
};

export function KanbanColumn({ column, tasks, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column });
  const isDone = column === "done";
  const meta = headerStyles[column];

  return (
    <div className="flex min-h-[300px] flex-col rounded-lg border border-zinc-200 bg-zinc-50/50">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
          <h2 className={cn("text-sm font-semibold", meta.title)}>
            {taskColumnLabels[column]}
          </h2>
        </div>
        <span className="text-xs text-zinc-500">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 p-2 transition-colors",
          isOver && "bg-[#3B1E8A]/5"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div
              className={cn(
                "flex h-24 items-center justify-center rounded-md border border-dashed text-xs",
                isDone
                  ? "border-zinc-200 text-zinc-400"
                  : "border-zinc-200 text-zinc-400"
              )}
            >
              Arrastra una tarea aquí
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                isDoneColumn={isDone}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
