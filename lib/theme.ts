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
};

export const businessLineTheme: Record<BusinessLine, BusinessLineTheme> = {
  adimenai: {
    accent: "#3B1E8A",
    accentHover: "#2D1666",
    badge: "bg-[#3B1E8A]/10 text-[#3B1E8A] border-[#3B1E8A]/20",
    soft: "bg-[#3B1E8A]/5",
    icon: "text-[#3B1E8A]",
  },
  herrikonekt: {
    accent: "#0F5132",
    accentHover: "#0A3D26",
    badge: "bg-emerald-900/10 text-emerald-900 border-emerald-900/20",
    soft: "bg-emerald-900/5",
    icon: "text-emerald-900",
  },
  hiopos: {
    accent: "#B91C1C",
    accentHover: "#991B1B",
    badge: "bg-red-700/10 text-red-700 border-red-700/20",
    soft: "bg-red-700/5",
    icon: "text-red-700",
  },
};
