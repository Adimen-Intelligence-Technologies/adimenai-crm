import { z } from "zod";
import {
  Banknote,
  Briefcase,
  Building2,
  Building,
  Car,
  Cross,
  Fuel,
  Hammer,
  HardHat,
  HeartPulse,
  Hotel,
  Landmark,
  Pill,
  Scale,
  Cigarette,
  Dumbbell,
  ShoppingBag,
  Stethoscope,
  Store,
  Syringe,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const businessLineEnum = z.enum(["adimenai", "herrikonekt", "hiopos"]);
export type BusinessLine = z.infer<typeof businessLineEnum>;

export const herrikonektTypeEnum = z.enum([
  "bares_y_restaurantes",
  "comercios",
  "servicios_profesionales",
  "servicios_municipales",
  "sanidad_y_servicios_sociales",
  "farmacias",
  "taxis",
  "centros_medicos",
  "veterinarios",
  "gestorias_y_asesorias",
  "abogados",
  "inmobiliarias",
  "bancos",
  "talleres",
  "ferreterias",
  "gasolineras",
  "hoteles_y_alojamientos",
  "asociaciones",
  "funerarias",
  "supermercados",
  "gimnasios",
  "estancos",
  "dentistas",
]);
export type HerrikonektType = z.infer<typeof herrikonektTypeEnum>;

export const herrikonektTypeLabels: Record<HerrikonektType, string> = {
  bares_y_restaurantes: "Bares y Restaurantes",
  comercios: "Comercios",
  servicios_profesionales: "Servicios Profesionales",
  servicios_municipales: "Servicios Municipales",
  sanidad_y_servicios_sociales: "Sanidad y Servicios Sociales",
  farmacias: "Farmacias",
  taxis: "Taxis",
  centros_medicos: "Centros Médicos",
  veterinarios: "Veterinarios",
  gestorias_y_asesorias: "Gestorías y Asesorías",
  abogados: "Abogados",
  inmobiliarias: "Inmobiliarias",
  bancos: "Bancos",
  talleres: "Talleres",
  ferreterias: "Ferreterías",
  gasolineras: "Gasolineras",
  hoteles_y_alojamientos: "Hoteles y Alojamientos",
  asociaciones: "Asociaciones",
  funerarias: "Funerarias",
  supermercados: "Supermercados",
  gimnasios: "Gimnasios",
  estancos: "Estancos",
  dentistas: "Dentistas",
};

export const herrikonektTypeIcons: Record<HerrikonektType, LucideIcon> = {
  bares_y_restaurantes: Store,
  comercios: ShoppingBag,
  servicios_profesionales: Briefcase,
  servicios_municipales: Building,
  sanidad_y_servicios_sociales: HeartPulse,
  farmacias: Pill,
  taxis: Car,
  centros_medicos: Stethoscope,
  veterinarios: HardHat,
  gestorias_y_asesorias: Landmark,
  abogados: Scale,
  inmobiliarias: Building2,
  bancos: Banknote,
  talleres: Wrench,
  ferreterias: Hammer,
  gasolineras: Fuel,
  hoteles_y_alojamientos: Hotel,
  asociaciones: Users,
  funerarias: Cross,
  supermercados: ShoppingBag,
  gimnasios: Dumbbell,
  estancos: Cigarette,
  dentistas: Syringe,
};

export const herrikonektSubTypeByType: Record<HerrikonektType, string[]> = {} as Record<HerrikonektType, string[]>;

export const businessLineLabels: Record<BusinessLine, string> = {
  adimenai: "AdimenAi",
  herrikonekt: "Herrikonekt",
  hiopos: "Hiopos",
};

const addressSchema = z.object({
  line1: z.string().min(1, "La dirección es obligatoria"),
  line2: z.string().optional().default(""),
  city: z.string().min(1, "La ciudad es obligatoria"),
  zip: z.string().optional().default(""),
  country: z.string().optional().default("España"),
  isPrimary: z.boolean().optional().default(false),
});
export type ClientAddress = z.infer<typeof addressSchema>;

export const taxIdTypeEnum = z.enum([
  "nif",
  "nie",
  "cif",
  "vat",
  "passport",
  "other",
]);
export type TaxIdType = z.infer<typeof taxIdTypeEnum>;

export const taxIdTypeLabels: Record<TaxIdType, string> = {
  nif: "NIF",
  nie: "NIE",
  cif: "CIF",
  vat: "VAT intracomunitario",
  passport: "Pasaporte",
  other: "Otro",
};

export const paymentMethodEnum = z.enum([
  "transfer",
  "direct_debit",
  "card",
  "cash",
  "bizum",
  "other",
]);
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  transfer: "Transferencia bancaria",
  direct_debit: "Domiciliación",
  card: "Tarjeta",
  cash: "Efectivo",
  bizum: "Bizum",
  other: "Otro",
};

const billingSchema = z.object({
  legalName: z.string().optional().default(""),
  taxId: z.string().optional().default(""),
  taxIdType: taxIdTypeEnum.default("nif"),
  billingEmail: z
    .string()
    .email("Email no válido")
    .optional()
    .or(z.literal("")),
  billingPhone: z.string().optional().default(""),
  address: addressSchema.optional(),
  paymentMethod: paymentMethodEnum.default("transfer"),
  paymentTerms: z.string().optional().default(""),
  internalNotes: z.string().optional().default(""),
  invoicingActive: z.boolean().default(false),
});
export type ClientBilling = z.infer<typeof billingSchema>;

export const socialLinksSchema = z.object({
  instagram: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
});
export type ClientSocialLinks = z.infer<typeof socialLinksSchema>;

const dayHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
});
export type DayHours = z.infer<typeof dayHoursSchema>;

const openingHoursSchema = z.object({
  monday: z.array(dayHoursSchema).default([]),
  tuesday: z.array(dayHoursSchema).default([]),
  wednesday: z.array(dayHoursSchema).default([]),
  thursday: z.array(dayHoursSchema).default([]),
  friday: z.array(dayHoursSchema).default([]),
  saturday: z.array(dayHoursSchema).default([]),
  sunday: z.array(dayHoursSchema).default([]),
});
export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const dayLabels: Record<keyof OpeningHours, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function emptyOpeningHours(): OpeningHours {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };
}

export const createHerrikonektSchema = z.object({
  businessLine: z.literal("herrikonekt"),
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().optional().default(""),
  website: z
    .union([z.string().url("URL no válida"), z.literal("")])
    .optional()
    .default(""),
  email: z
    .union([z.string().email("Email no válido"), z.literal("")])
    .optional()
    .default(""),
  phones: z.array(z.string()).default([]),
  addresses: z.array(addressSchema).default([]),
  type: herrikonektTypeEnum.optional().default("bares_y_restaurantes"),
  syncToApp: z.boolean().default(true),
  social: socialLinksSchema.optional().default({ instagram: "", facebook: "" }),
  billing: billingSchema.optional(),
  openingHours: openingHoursSchema.optional().default(emptyOpeningHours()),
});
export type CreateHerrikonektInput = z.infer<typeof createHerrikonektSchema>;

export const updateHerrikonektSchema = createHerrikonektSchema.partial();
export type UpdateHerrikonektInput = z.infer<typeof updateHerrikonektSchema>;
