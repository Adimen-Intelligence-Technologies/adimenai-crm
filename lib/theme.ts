import type { BusinessLine } from "@/lib/schemas/client";

export type BusinessLineTheme = {
  /** Color principal (acentos, hover de links, foco). */
  accent: string;
  /** Color hover del accent. */
  accentHover: string;
  /** Clases para badges/chips. */
  badge: string;
  /** Clases para soft cards de fondo. */
  soft: string;
  /** Color sólido para iconos sobre fondo soft. */
  icon: string;
  /** Color de hover de fila en tablas. */
  row: string;
};

export const businessLineTheme: Record<BusinessLine, BusinessLineTheme> = {
  adimenai: {
    accent: "#3B1E8A",
    accentHover: "#2D1666",
    badge:
      "bg-[#6D28D9] text-white border-[#6D28D9]",
    soft: "bg-violet-100",
    icon: "text-violet-700",
    row: "hover:bg-violet-50/70",
  },
  herrikonekt: {
    accent: "#047857",
    accentHover: "#065F46",
    badge: "bg-emerald-600 text-white border-emerald-600",
    soft: "bg-emerald-100",
    icon: "text-emerald-700",
    row: "hover:bg-emerald-50/70",
  },
  hiopos: {
    accent: "#DC2626",
    accentHover: "#B91C1C",
    badge: "bg-red-600 text-white border-red-600",
    soft: "bg-red-100",
    icon: "text-red-700",
    row: "hover:bg-red-50/70",
  },
};

