"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  suggestedScopes,
  taskAssigneeEnum,
  taskAssigneeLabels,
  taskColumnEnum,
  taskColumnLabels,
  type TaskAssignee,
  type TaskColumn,
} from "@/lib/schemas/task";
import { businessLineTheme } from "@/lib/theme";
import type { Task } from "@/lib/repositories/tasks";
import { AssigneeAvatar } from "./assignee-avatar";

type InitialTask = Partial<Task> & { _id?: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InitialTask;
  onSaved: (task: Task) => void;
};

type FormValues = {
  title: string;
  description: string;
  scope: string;
  column: TaskColumn;
  assignee: TaskAssignee;
  dueDate: string;
};

function defaultValues(initial?: InitialTask): FormValues {
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    scope: initial?.scope ?? "General",
    column: (initial?.column as TaskColumn) ?? "backlog",
    assignee: (initial?.assignee as TaskAssignee) ?? "andrea",
    dueDate: initial?.dueDate ?? "",
  };
}

export function TaskForm({ open, onOpenChange, initial, onSaved }: Props) {
  const [values, setValues] = useState<FormValues>(() => defaultValues(initial));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const mode: "create" | "edit" = initial?._id ? "edit" : "create";
  const initialRef = useRef(initial);

  // Re-sincronizar solo cuando cambia la referencia de `initial` (al abrir una tarea distinta)
  useEffect(() => {
    if (initial !== initialRef.current) {
      initialRef.current = initial;
      setValues(defaultValues(initial));
      setError(null);
    }
  }, [initial]);

  // Reset al abrir el Sheet (open pasa de false a true)
  const prevOpen = useRef(open);
  useEffect(() => {
    if (open && !prevOpen.current) {
      setValues(defaultValues(initial));
      setError(null);
    }
    prevOpen.current = open;
  }, [open, initial]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      scope: values.scope,
      column: values.column,
      assignee: values.assignee,
      dueDate: values.dueDate.trim(),
    };

    startTransition(async () => {
      try {
        const url =
          initial?._id && mode === "edit"
            ? `/api/tasks/${initial._id}`
            : "/api/tasks";
        const method = initial?._id && mode === "edit" ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "No se pudo guardar la tarea");
        }
        const task = (await res.json()) as Task;
        onSaved(task);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setValues(defaultValues(initial));
        onOpenChange(o);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-zinc-200 p-5">
            <SheetTitle>
              {mode === "create" ? "Nueva tarea" : "Editar tarea"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Crea una tarea y asígnala a un miembro del equipo."
                : "Modifica los datos de la tarea."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <Field label="Título" required>
              <Input
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ej. Llamar a ACME para seguimiento"
                required
                autoFocus
              />
            </Field>

            <Field label="Descripción">
              <Textarea
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Detalles de la tarea"
                rows={3}
              />
            </Field>

            <Field label="Ámbito" required>
              <Input
                value={values.scope}
                onChange={(e) => set("scope", e.target.value)}
                placeholder="Ej. Herrikonekt, AdimenAi, General..."
              />
              <div className="flex flex-wrap gap-1.5">
                {suggestedScopes.map((s) => {
                  const theme = businessLineTheme[s.toLowerCase() as keyof typeof businessLineTheme];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("scope", s)}
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                        values.scope === s
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : theme
                            ? `${theme.badge} border-transparent`
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Estado">
              <NativeSelect
                value={values.column}
                onChange={(e) => set("column", e.target.value as TaskColumn)}
              >
                {taskColumnEnum.options.map((c) => (
                  <option key={c} value={c}>
                    {taskColumnLabels[c]}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label="Responsable" required>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {taskAssigneeEnum.options.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set("assignee", a)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-md border px-2.5 py-2 transition-colors",
                      values.assignee === a
                        ? "border-[#3B1E8A] bg-[#3B1E8A]/5"
                        : "border-zinc-200 bg-white hover:bg-zinc-50"
                    )}
                  >
                    <AssigneeAvatar assignee={a} size="md" />
                    <span className="text-xs text-zinc-700">
                      {taskAssigneeLabels[a]}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Fecha límite">
              <Input
                type="date"
                value={values.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </Field>
          </div>

          <SheetFooter className="border-t border-zinc-200 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
            >
              {isPending
                ? "Guardando…"
                : mode === "create"
                  ? "Crear tarea"
                  : "Guardar cambios"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
        "placeholder:text-zinc-400",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        props.className
      )}
    />
  );
}

function NativeSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        props.className
      )}
    />
  );
}
