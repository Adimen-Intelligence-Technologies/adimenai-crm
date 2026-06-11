import { z } from "zod";
import { businessLineEnum, type BusinessLine } from "@/lib/schemas/client";

export const serviceSchema = z.object({
  businessLine: businessLineEnum,
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().optional().default(""),
  price: z
    .number({ invalid_type_error: "Precio no válido" })
    .nonnegative("El precio no puede ser negativo"),
});

export type Service = {
  _id: string;
  businessLine: BusinessLine;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export const createServiceSchema = serviceSchema;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = serviceSchema.partial();
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
