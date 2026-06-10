import { z } from "zod";
import { businessLineEnum, businessLineLabels } from "./client";
export { businessLineEnum, businessLineLabels };
export type { BusinessLine } from "./client";

export const presupuestoStatusEnum = z.enum([
  "draft",
  "sent",
  "accepted",
  "rejected",
]);
export type PresupuestoStatus = z.infer<typeof presupuestoStatusEnum>;

export const presupuestoStatusLabels: Record<PresupuestoStatus, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const clientSnapshotSchema = z.object({
  name: z.string(),
  nif: z.string().optional().default(""),
  address: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
});
export type ClientSnapshot = z.infer<typeof clientSnapshotSchema>;

const lineItemSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  quantity: z.number().min(1, "La cantidad debe ser 1 o más"),
  unitPrice: z.number().min(0, "El precio no puede ser negativo"),
  total: z.number(),
});
export type LineItem = z.infer<typeof lineItemSchema>;

export function calculateLineTotal(item: { quantity: number; unitPrice: number }): number {
  return Math.round(item.quantity * item.unitPrice * 100) / 100;
}

export function calculateItemTotal(item: { quantity: number; unitPrice: number }): number {
  return Math.round(item.quantity * item.unitPrice * 100) / 100;
}

export const createPresupuestoSchema = z.object({
  businessLine: businessLineEnum,
  clientId: z.string().min(1, "El cliente es obligatorio"),
  clientSnapshot: clientSnapshotSchema,
  introduction: z.string().optional().default(""),
  items: z.array(lineItemSchema).min(1, "Debe haber al menos una línea"),
  taxRate: z.number().min(0).max(100).default(21),
  notes: z.string().optional().default(""),
});
export type CreatePresupuestoInput = z.infer<typeof createPresupuestoSchema>;

export const updatePresupuestoSchema = createPresupuestoSchema.partial();
export type UpdatePresupuestoInput = z.infer<typeof updatePresupuestoSchema>;

export const businessLinePrefix: Record<string, string> = {
  adimenai: "A",
  herrikonekt: "H",
  hiopos: "HI",
};
