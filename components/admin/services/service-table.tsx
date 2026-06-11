"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, Pencil, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { businessLineTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/schemas/service";
import type { BusinessLine } from "@/lib/schemas/client";
import { DeleteServiceButton } from "./delete-service-button";

export function ServiceTable({
  services,
  page,
  totalPages,
  onPageChange,
}: {
  services: Service[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.02]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200/80 bg-zinc-50/70">
          <tr>
            <th className="px-5 py-3.5 text-[13px] font-bold tracking-tight text-zinc-700">Nombre</th>
            <th className="hidden px-5 py-3.5 text-[13px] font-bold tracking-tight text-zinc-700 sm:table-cell">Línea</th>
            <th className="px-5 py-3.5 text-right text-[13px] font-bold tracking-tight text-zinc-700">Precio (sin IVA)</th>
            <th className="px-5 py-3.5 text-right text-[13px] font-bold tracking-tight text-zinc-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {services.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-20 text-center text-sm text-zinc-500">
                No hay servicios para mostrar.
              </td>
            </tr>
          ) : (
            services.map((service) => (
              <ServiceRow key={service._id} service={service} />
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3.5">
          <span className="text-[12px] text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-zinc-300">···</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={[
                      "min-w-8 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors tabular-nums",
                      p === page ? "bg-[#3B1E8A] text-white" : "text-zinc-600 hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceRow({ service }: { service: Service }) {
  const theme = businessLineTheme[service.businessLine as BusinessLine];
  return (
    <tr className={cn("transition-colors duration-150", theme.row)}>
      <td className="px-5 py-3.5">
        <Link
          href={`/admin/gestion-servicios/${service._id}`}
          className="font-semibold text-zinc-900 transition-colors hover:text-[#3B1E8A]"
        >
          {service.name}
        </Link>
        {service.description && (
          <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-500">{service.description}</p>
        )}
      </td>
      <td className="hidden px-5 py-3.5 sm:table-cell">
        <span
          className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", theme.badge)}
        >
          {service.businessLine === "adimenai" && "AdimenAi"}
          {service.businessLine === "herrikonekt" && "Herrikonekt"}
          {service.businessLine === "hiopos" && "Hiopos"}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className="font-mono text-sm font-bold tabular-nums text-zinc-900">
          {formatEUR(service.price)}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Ver detalle del servicio"
            className="text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
          >
            <Link href={`/admin/gestion-servicios/${service._id}`}>
              <Eye />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Editar servicio"
            className="text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
          >
            <Link href={`/admin/gestion-servicios/${service._id}/edit`}>
              <Pencil />
            </Link>
          </Button>
          <DeleteServiceButton id={service._id} name={service.name} />
        </div>
      </td>
    </tr>
  );
}

function formatEUR(n: number): string {
  return (
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " €"
  );
}
