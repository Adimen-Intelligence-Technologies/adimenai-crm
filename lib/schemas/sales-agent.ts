import { z } from "zod";

export const salesAgentSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z
    .union([z.string().email("Email no válido"), z.literal("")])
    .optional()
    .default(""),
  phone: z.string().optional().default(""),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Color hexadecimal no válido")
    .default("#6D28D9"),
  isActive: z.boolean().default(true),
});

export const createSalesAgentSchema = salesAgentSchema;
export type CreateSalesAgentInput = z.infer<typeof createSalesAgentSchema>;

export const updateSalesAgentSchema = salesAgentSchema.partial();
export type UpdateSalesAgentInput = z.infer<typeof updateSalesAgentSchema>;

export const SALES_AGENT_DEFAULT_COLORS = [
  "#EC4899",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
] as const;

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}
