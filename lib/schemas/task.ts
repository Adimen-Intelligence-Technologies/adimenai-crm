import { z } from "zod";

export const taskScopeEnum = z.enum([
  "adimenai",
  "herrikonekt",
  "hiopos",
  "general",
]);
export type TaskScope = z.infer<typeof taskScopeEnum>;

export const taskScopeLabels: Record<TaskScope, string> = {
  adimenai: "AdimenAi",
  herrikonekt: "Herrikonekt",
  hiopos: "Hiopos",
  general: "General",
};

export const taskColumnEnum = z.enum(["backlog", "in_progress", "done"]);
export type TaskColumn = z.infer<typeof taskColumnEnum>;

export const taskColumnLabels: Record<TaskColumn, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  done: "Done",
};

export const taskColumnOrder: TaskColumn[] = ["backlog", "in_progress", "done"];

export const taskAssigneeEnum = z.enum(["andrea", "asier", "joseba", "inaki"]);
export type TaskAssignee = z.infer<typeof taskAssigneeEnum>;

export const taskAssigneeLabels: Record<TaskAssignee, string> = {
  andrea: "Andrea",
  asier: "Asier",
  joseba: "Joseba",
  inaki: "Iñaki",
};

export const taskAssigneeInitials: Record<TaskAssignee, string> = {
  andrea: "AN",
  asier: "AS",
  joseba: "JB",
  inaki: "IK",
};

export const taskAssigneeColors: Record<TaskAssignee, string> = {
  andrea: "#EC4899", // pink
  asier: "#3B82F6", // blue
  joseba: "#10B981", // emerald
  inaki: "#F59E0B", // amber
};

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z.string().optional().default(""),
  scope: taskScopeEnum.default("general"),
  column: taskColumnEnum.default("backlog"),
  assignee: taskAssigneeEnum,
  dueDate: z.string().optional().default(""),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
