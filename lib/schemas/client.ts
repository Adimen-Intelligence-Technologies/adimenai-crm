import { z } from "zod";

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
};

export const herrikonektSubTypeByType: Record<HerrikonektType, string[]> = {
  bares_y_restaurantes: [
    "Restaurantes",
    "Tabernas y comida",
    "Sociedades culturales",
    "Bares de barrio",
    "Locales gastronómicos",
  ],
  comercios: [
    "Alimentación: Carnicerías / Charcuterías",
    "Alimentación: Frutas / Verduras",
    "Alimentación: Herboristerías / Dietética",
    "Deportes",
    "Moda: Hombre / Mujer",
    "Moda: Infantil",
    "Moda: Lencería",
    "Otras categorías",
  ],
  servicios_profesionales: [
    "Estética",
    "Gremios: Carpintería / Acuchillado",
    "Peluquerías",
    "Traductores / Intérpretes",
    "Traumatología / Ortopedia",
    "Otros profesionales",
  ],
  servicios_municipales: [
    "Atención al ciudadano",
    "Hacienda",
    "Urbanismo",
    "Cultura",
    "Deportes",
    "Euskera",
    "Juventud",
  ],
  sanidad_y_servicios_sociales: [
    "Transporte público",
    "Servicios sociales",
  ],
  farmacias: [
    "Farmacias de guardia",
    "Farmacias generales",
    "Parafarmacias",
    "Homeopatía",
    "Servicios nutricionales",
  ],
  taxis: [
    "Paradas oficiales",
    "Taxistas locales",
  ],
  centros_medicos: [
    "Atención primaria (Osakidetza)",
    "Fisioterapia",
    "Podología",
    "Ópticas",
    "Salud Mental",
    "Cruz Roja",
    "Urgencias",
  ],
  veterinarios: [
    "Clínica veterinaria local",
    "Urgencias veterinarias",
  ],
  gestorias_y_asesorias: [
    "Gestorías administrativas",
    "Asesorías fiscales y contables",
    "Asesorías laborales",
    "Administración de fincas",
    "Consultorías",
  ],
  abogados: [
    "Derecho civil",
    "Familia y divorcios",
    "Penal",
    "Laboral",
    "Mercantil",
    "Administrativo",
    "Extranjería",
    "Mediación",
    "Traductores jurados",
  ],
  inmobiliarias: [
    "Compra y venta",
    "Alquiler",
    "Valoraciones",
    "Asesoramiento legal",
  ],
  bancos: [
    "Oficinas bancarias",
    "Cajeros automáticos 24h",
  ],
  talleres: [
    "Mecánica general",
    "Electricidad del automóvil",
    "Chapa y pintura",
    "Carrocería",
    "Talleres industriales",
  ],
  ferreterias: [
    "Ferretería general",
    "Bricolaje doméstico",
    "Ferretería industrial",
    "Materiales de construcción",
    "Sanitarios y tornillería",
  ],
  gasolineras: [
    "Gasoil",
    "Gasolina",
    "Diésel HVO",
    "AdBlue",
    "GLP",
    "Puntos de carga eléctrica",
    "Lavaderos",
  ],
  hoteles_y_alojamientos: [
    "Hoteles",
    "Pensiones",
    "Apartamentos turísticos",
    "Casas rurales",
  ],
  asociaciones: [
    "Religiosas",
    "Comerciantes (Txankakua)",
    "Gastronómicas",
    "Vecinos",
    "Deportivas",
    "Tiempo libre",
  ],
  funerarias: [
    "Funerarias",
    "Tanatorios",
  ],
};

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

export const createHerrikonektSchema = z.object({
  businessLine: z.literal("herrikonekt"),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional().default(""),
  website: z
    .string()
    .url("URL no válida")
    .optional()
    .or(z.literal("")),
  phones: z
    .array(z.string().min(1, "Teléfono vacío"))
    .default([]),
  addresses: z
    .array(addressSchema)
    .min(1, "Añade al menos una dirección"),
  type: herrikonektTypeEnum,
  subType: z.string().min(1, "Selecciona un subtipo"),
  syncToApp: z.boolean().default(true),
  billing: billingSchema.optional(),
});
export type CreateHerrikonektInput = z.infer<typeof createHerrikonektSchema>;

export const updateHerrikonektSchema = createHerrikonektSchema.partial();
export type UpdateHerrikonektInput = z.infer<typeof updateHerrikonektSchema>;
