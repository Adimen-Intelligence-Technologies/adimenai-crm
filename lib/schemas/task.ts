import { z } from "zod";

/**
 * Ámbito ahora es texto libre. Mantenemos un set de "ámbitos sugeridos" que
 * se ofrecen como quick-pickers en el formulario, pero el usuario puede
 * escribir el que quiera.
 */
export const suggestedScopes = [
  "Todos",
  "AdimenAi",
  "Herrikonekt",
  "Hiopos",
  "General",
] as const;

export type TaskScope = string;

export function normalizeScope(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "General";
  return trimmed;
}

export const taskColumnEnum = z.enum(["backlog", "in_progress", "done"]);
export type TaskColumn = z.infer<typeof taskColumnEnum>;

export const taskColumnLabels: Record<TaskColumn, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  done: "Done",
};

export const taskColumnOrder: TaskColumn[] = ["backlog", "in_progress", "done"];

const objectIdSchema = z
  .string()
  .refine((v) => /^[a-f\d]{24}$/i.test(v), "Identificador no válido");

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z.string().optional().default(""),
  scope: z
    .string()
    .trim()
    .min(1, "El ámbito es obligatorio")
    .default("General"),
  column: taskColumnEnum.default("backlog"),
  salesAgentId: objectIdSchema.optional().default(""),
  dueDate: z.string().optional().default(""),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
