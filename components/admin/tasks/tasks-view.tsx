"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import { ExternalLink, FileDown, FileSpreadsheet, LayoutGrid, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  taskColumnOrder,
  type TaskColumn,
} from "@/lib/schemas/task";
import type { Task } from "@/lib/repositories/tasks";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";


type ViewMode = "kanban" | "sheet";

type Props = {
  initialTasks: Task[];
};

export function TasksView({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [view, setView] = useState<ViewMode>("sheet");
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function runSync() {
    try {
      const res = await fetch("/api/tasks/sync-excel", { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        tasks?: Task[];
        created?: number;
        updated?: number;
        deleted?: number;
      };
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch {
      // Ignorar errores de polling silenciosamente
    }
  }

  // Crear hoja de hoy si no existe, luego cargar la hoja más reciente
  useEffect(() => {
    fetch("/api/tasks/create-daily-sheet", { method: "POST" })
      .then(() => fetch("/api/tasks/latest-sheet"))
      .then((r) => r.json())
      .then((data: { name?: string }) => {
        if (data.name) setSheetName(data.name);
      })
      .catch(() => {});
  }, []);

  // Sincronización inicial + polling cada 30s
  useEffect(() => {
    runSync();
    pollRef.current = setInterval(runSync, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.scope.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

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

    if (
      activeTask.column === targetColumn &&
      activeTask.order === targetOrder
    ) {
      return;
    }

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

  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/tasks/export", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Error al exportar");
      }
      alert("Excel exportado y subido a Drive correctamente.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al exportar a Drive"
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/tasks/sync-excel", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Error al sincronizar");
      }
      const result = (await res.json()) as {
        created?: number;
        updated?: number;
        deleted?: number;
        sheet?: string;
        tasks?: Task[];
      };
      if (result.tasks) setTasks(result.tasks);
      alert(
        `Sincronizado: ${result.created ?? 0} creadas, ${result.updated ?? 0} actualizadas, ${result.deleted ?? 0} eliminadas.`
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al sincronizar desde Excel"
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Gestión administrativa
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona el trabajo del equipo. Arrastra las tarjetas para
            cambiar su estado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Cambiar vista"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-1"
          >
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors",
                view === "kanban"
                  ? "bg-[#3B1E8A] text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
              aria-pressed={view === "kanban"}
            >
              <LayoutGrid className="size-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView("sheet")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors",
                view === "sheet"
                  ? "bg-[#3B1E8A] text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
              aria-pressed={view === "sheet"}
            >
              <FileSpreadsheet className="size-3.5" />
              Hoja
            </button>
          </div>
          <Button
            onClick={handleSync}
            variant="outline"
            disabled={syncing}
            className="gap-1.5"
          >
            <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} />
            {syncing ? "Sincronizando…" : "Sincronizar"}
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            disabled={exporting}
            className="gap-1.5"
          >
            <FileDown className="size-3.5" />
            {exporting ? "Exportando…" : "Exportar a Excel"}
          </Button>
          {view === "sheet" && (
            <a
              href="https://docs.google.com/spreadsheets/d/1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <ExternalLink className="size-3.5" />
              Editar en Drive
            </a>
          )}
          {view !== "sheet" && (
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
          )}
        </div>
      </header>

      {view === "sheet" ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <iframe
              key={sheetName ?? "default"}
              src={`https://docs.google.com/spreadsheets/d/1jX5yB2zOckIuU9x9l-dK5q2Q2dwPMzgq/edit?widget=true&headers=0${sheetName ? `&range=${sheetName}!A1` : ""}`}
              className="h-[90vh] w-full"
              title="Hoja de cálculo de comité"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar tareas por título o ámbito…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#3B1E8A] focus:outline-none focus:ring-1 focus:ring-[#3B1E8A]"
            />
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
        </div>
      )}

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
    next = next.map((t) => {
      if (t.column === fromColumn && t.order > fromOrder && t._id !== activeId) {
        return { ...t, order: t.order - 1 };
      }
      return t;
    });
    next = next.map((t) => {
      if (t._id === activeId) {
        return { ...t, column: targetColumn, order: targetOrder };
      }
      return t;
    });
    next = next.map((t) => {
      if (t.column === targetColumn && t.order >= targetOrder && t._id !== activeId) {
        return { ...t, order: t.order + 1 };
      }
      return t;
    });
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
