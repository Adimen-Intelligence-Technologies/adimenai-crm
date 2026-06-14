import { z } from "zod";
import { businessLineEnum } from "./client";
import { activityTypeEnum } from "./activity";

export const visitPlanStatusEnum = z.enum([
  "programada",
  "confirmada",
  "realizada",
  "no_disponible",
  "reprogramar",
]);
export type VisitPlanStatus = z.infer<typeof visitPlanStatusEnum>;

export const visitPlanStatusLabels: Record<VisitPlanStatus, string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  no_disponible: "No disponible",
  reprogramar: "Reprogramar",
};

export const visitPlanStatusColors: Record<VisitPlanStatus, string> = {
  programada: "bg-blue-100 text-blue-800 border-blue-300",
  confirmada: "bg-emerald-100 text-emerald-800 border-emerald-300",
  realizada: "bg-zinc-200 text-zinc-700 border-zinc-300",
  no_disponible: "bg-rose-100 text-rose-800 border-rose-300",
  reprogramar: "bg-amber-100 text-amber-800 border-amber-300",
};

export const visitPlanStatusDots: Record<VisitPlanStatus, string> = {
  programada: "bg-blue-500",
  confirmada: "bg-emerald-500",
  realizada: "bg-zinc-400",
  no_disponible: "bg-rose-500",
  reprogramar: "bg-amber-500",
};

export const createVisitPlanSchema = z.object({
  clientId: z.string().min(1, "El cliente es obligatorio"),
  salesAgentId: z.string().optional().default(""),
  date: z.string().min(1, "La fecha es obligatoria"),
  contactName: z.string().optional().default(""),
  address: z.string().optional().default(""),
  type: activityTypeEnum,
  status: visitPlanStatusEnum.default("programada"),
  observations: z.string().optional().default(""),
  businessLine: businessLineEnum.optional(),
});

const nextActionSchema = z.object({
  type: z.enum(["callback", "send_quote", "send_info", "meeting", "follow_up", "other"]),
  dueDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  done: z.boolean().default(false),
});

export const updateVisitPlanSchema = z.object({
  clientId: z.string().min(1).optional(),
  salesAgentId: z.string().optional(),
  date: z.string().min(1).optional(),
  contactName: z.string().optional(),
  address: z.string().optional(),
  type: activityTypeEnum.optional(),
  status: visitPlanStatusEnum.optional(),
  observations: z.string().optional(),
  businessLine: businessLineEnum.optional(),
  // Activity fields synced to linked activity
  outcome: z.enum(["positive", "neutral", "negative", "pending"]).optional(),
  requestQuote: z.boolean().optional(),
  requestedBusinessLines: z.array(businessLineEnum).optional(),
  nextAction: nextActionSchema.nullable().optional(),
});

export type CreateVisitPlanInput = z.infer<typeof createVisitPlanSchema>;
export type UpdateVisitPlanInput = z.infer<typeof updateVisitPlanSchema>;
