import { z } from "zod";
import { businessLineEnum, type BusinessLine } from "@/lib/schemas/client";

export const serviceBillingEnum = z.enum(["one_time", "monthly", "yearly"]);
export type ServiceBilling = z.infer<typeof serviceBillingEnum>;

export const serviceBillingLabels: Record<ServiceBilling, string> = {
  one_time: "Pago único",
  monthly: "Suscripción mensual",
  yearly: "Suscripción anual",
};

export const serviceBillingShort: Record<ServiceBilling, string> = {
  one_time: "/ ud.",
  monthly: "/ mes",
  yearly: "/ año",
};

export const serviceSchema = z.object({
  businessLine: businessLineEnum,
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().optional().default(""),
  price: z
    .number({ error: "Precio no válido" })
    .nonnegative("El precio no puede ser negativo"),
  billing: serviceBillingEnum.default("one_time"),
  profitMargin: z
    .number({ error: "Margen no válido" })
    .min(0, "El margen no puede ser negativo")
    .max(1000, "El margen no puede superar 1000%")
    .optional(),
});

export type Service = {
  _id: string;
  businessLine: BusinessLine;
  name: string;
  description: string;
  price: number;
  billing: ServiceBilling;
  profitMargin?: number;
  createdAt: string;
  updatedAt: string;
};

export const createServiceSchema = serviceSchema;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = serviceSchema.partial();
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
