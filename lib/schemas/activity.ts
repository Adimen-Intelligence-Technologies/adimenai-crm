import { z } from "zod";
import { businessLineEnum } from "./client";

export const activityTypeEnum = z.enum([
  "visit",
  "call",
  "email",
  "meeting",
  "whatsapp",
  "note",
]);
export type ActivityType = z.infer<typeof activityTypeEnum>;

export const activityTypeLabels: Record<ActivityType, string> = {
  visit: "Visita",
  call: "Llamada",
  email: "Email",
  meeting: "Reunión",
  whatsapp: "WhatsApp",
  note: "Nota",
};

export const activityOutcomeEnum = z.enum([
  "positive",
  "neutral",
  "negative",
  "pending",
]);
export type ActivityOutcome = z.infer<typeof activityOutcomeEnum>;

export const activityOutcomeLabels: Record<ActivityOutcome, string> = {
  positive: "Positivo",
  neutral: "Neutro",
  negative: "Negativo",
  pending: "Pendiente",
};

export const nextActionTypeEnum = z.enum([
  "callback",
  "send_quote",
  "send_info",
  "meeting",
  "follow_up",
  "other",
]);
export type NextActionType = z.infer<typeof nextActionTypeEnum>;

export const nextActionTypeLabels: Record<NextActionType, string> = {
  callback: "Volver a llamar",
  send_quote: "Enviar presupuesto",
  send_info: "Enviar información",
  meeting: "Agendar reunión",
  follow_up: "Hacer seguimiento",
  other: "Otra",
};

const objectIdSchema = z
  .string()
  .refine((v) => /^[a-f\d]{24}$/i.test(v), "Identificador no válido");

const nextActionSchema = z.object({
  type: nextActionTypeEnum,
  dueDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  done: z.boolean().default(false),
});

export const createActivitySchema = z.object({
  clientId: objectIdSchema,
  salesAgentId: objectIdSchema.optional().default(""),
  type: activityTypeEnum.default("visit"),
  occurredAt: z.string().min(1, "La fecha es obligatoria"),
  subject: z.string().trim().min(1, "El asunto es obligatorio"),
  description: z.string().optional().default(""),
  outcome: activityOutcomeEnum.default("pending"),
  nextAction: nextActionSchema.optional(),
  linkedPresupuestoId: objectIdSchema.optional().default(""),
  linkedPresupuestoIds: z.array(objectIdSchema).optional().default([]),
  linkedDealId: objectIdSchema.optional().default(""),
  requestQuote: z.boolean().default(false),
  requestedBusinessLines: z.array(businessLineEnum).optional(),
});
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = z.object({
  type: activityTypeEnum.optional(),
  occurredAt: z.string().optional(),
  subject: z.string().trim().min(1, "El asunto es obligatorio").optional(),
  description: z.string().optional(),
  outcome: activityOutcomeEnum.optional(),
  nextAction: nextActionSchema.optional(),
  linkedPresupuestoId: objectIdSchema.optional(),
  linkedPresupuestoIds: z.array(objectIdSchema).optional(),
  linkedDealId: objectIdSchema.optional(),
  salesAgentId: objectIdSchema.optional(),
  requestQuote: z.boolean().optional(),
  requestedBusinessLines: z.array(businessLineEnum).optional(),
  quoteInProgress: z.boolean().optional(),
});
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
