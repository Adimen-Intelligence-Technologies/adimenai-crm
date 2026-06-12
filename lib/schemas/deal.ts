import { z } from "zod";
import { businessLineEnum } from "@/lib/schemas/client";

export const dealStageEnum = z.enum([
  "prospect",
  "contacted",
  "quoted",
  "accepted",
  "contracted",
  "invoiced",
  "paid",
  "lost",
]);
export type DealStage = z.infer<typeof dealStageEnum>;

export const DEAL_STAGES: DealStage[] = [
  "prospect",
  "contacted",
  "quoted",
  "accepted",
  "contracted",
  "invoiced",
  "paid",
  "lost",
];

export const dealStageLabels: Record<DealStage, string> = {
  prospect: "Prospecto",
  contacted: "Contactado",
  quoted: "Cotizado",
  accepted: "Aceptado",
  contracted: "Contratado",
  invoiced: "Facturado",
  paid: "Cobrado",
  lost: "Perdido",
};

export const dealStageColors: Record<DealStage, string> = {
  prospect: "bg-zinc-100 text-zinc-700 border-zinc-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  quoted: "bg-amber-50 text-amber-800 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  contracted: "bg-violet-50 text-violet-700 border-violet-200",
  invoiced: "bg-cyan-50 text-cyan-700 border-cyan-200",
  paid: "bg-emerald-600 text-white border-emerald-600",
  lost: "bg-rose-50 text-rose-700 border-rose-200",
};

const TRANSITIONS: Record<DealStage, DealStage[]> = {
  prospect: ["contacted", "quoted", "lost"],
  contacted: ["quoted", "prospect", "lost"],
  quoted: ["accepted", "contacted", "lost"],
  accepted: ["contracted", "lost"],
  contracted: ["invoiced", "lost"],
  invoiced: ["paid", "lost"],
  paid: [],
  lost: ["contacted", "quoted"],
};

export function canTransition(from: DealStage, to: DealStage): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStages(from: DealStage): DealStage[] {
  return TRANSITIONS[from] ?? [];
}

const objectIdSchema = z
  .string()
  .refine((v) => /^[a-f\d]{24}$/i.test(v), "Identificador no válido");

export const createDealSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  clientId: objectIdSchema,
  salesAgentId: objectIdSchema.optional().default(""),
  businessLine: businessLineEnum,
  sourceActivityId: objectIdSchema.optional().default(""),
  sourcePresupuestoId: objectIdSchema.optional().default(""),
  estimatedValue: z.number().nonnegative().default(0),
  currency: z.string().default("EUR"),
  stage: dealStageEnum.default("prospect"),
  expectedCloseDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});
export type CreateDealInput = z.infer<typeof createDealSchema>;

export const updateDealSchema = z.object({
  title: z.string().trim().min(1).optional(),
  salesAgentId: objectIdSchema.optional(),
  estimatedValue: z.number().nonnegative().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
  stage: dealStageEnum.optional(),
  lostReason: z.string().optional(),
});
export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export const moveStageSchema = z.object({
  stage: dealStageEnum,
  lostReason: z.string().optional(),
});
export type MoveStageInput = z.infer<typeof moveStageSchema>;
