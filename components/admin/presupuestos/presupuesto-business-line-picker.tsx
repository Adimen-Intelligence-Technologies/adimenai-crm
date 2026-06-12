"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const lines: Array<{
  id: "adimenai" | "herrikonekt" | "hiopos";
  title: string;
  description: string;
  prefix: string;
}> = [
  {
    id: "adimenai",
    title: "AdimenAi",
    description: "Servicios de web, branding, impresión, SEO y marketing.",
    prefix: "A",
  },
  {
    id: "herrikonekt",
    title: "Herrikonekt",
    description: "Comercios locales sincronizados con la app móvil.",
    prefix: "H",
  },
  {
    id: "hiopos",
    title: "Hiopos",
    description: "TPV y software para empresas (partner).",
    prefix: "HI",
  },
];

export function PresupuestoBusinessLinePicker({
  clientId,
  salesAgentId,
  fromActivity,
}: {
  clientId?: string;
  salesAgentId?: string;
  fromActivity?: string;
}) {
  const params = new URLSearchParams();
  if (clientId) params.set("clientId", clientId);
  if (salesAgentId) params.set("salesAgentId", salesAgentId);
  if (fromActivity) params.set("fromActivity", fromActivity);
  const query = params.toString();
  const suffix = query ? `?${query}` : "";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {lines.map((line) => (
        <Link
          key={line.id}
          href={`/admin/presupuestos/nuevo/${line.id}${suffix}`}
          className="group relative flex h-full flex-col items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 text-center transition-all duration-200 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-900/[0.04] focus-visible:outline-none"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B1E8A]/10 to-[#3B1E8A]/5 text-[#3B1E8A]">
            <span className="text-lg font-bold tracking-tight">{line.prefix}</span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-zinc-950">
              {line.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              {line.description}
            </p>
          </div>
          <ChevronRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-900" />
        </Link>
      ))}
    </div>
  );
}
