"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessLineTheme } from "@/lib/theme";
import { businessLineLabels, presupuestoStatusLabels, type PresupuestoStatus } from "@/lib/schemas/presupuesto";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import type { PendingPresupuestoLine } from "@/app/admin/presupuestos/page";
import { cn } from "@/lib/utils";

export function PresupuestoTable({
  presupuestos,
  page,
  totalPages,
  onPageChange,
  pendingLines = [],
  clientNameMap = {},
}: {
  presupuestos: Presupuesto[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pendingLines?: PendingPresupuestoLine[];
  clientNameMap?: Record<string, string>;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);

  async function handleCreate(activityId: string, businessLine: string) {
    setCreating(`${activityId}-${businessLine}`);
    try {
      const res = await fetch("/api/presupuestos/from-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, businessLine }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Error al crear presupuesto");
      }
      const data = await res.json();
      if (data.presupuesto?._id) {
        router.push(`/admin/presupuestos/${data.presupuesto._id}/edit`);
      }
    } catch {
      setCreating(null);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Eliminar este presupuesto?")) return;
    const res = await fetch(`/api/presupuestos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50/40 text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
          <tr>
            <th className="px-4 py-2.5">Nº</th>
            <th className="px-4 py-2.5">Cliente</th>
            <th className="hidden px-4 py-2.5 sm:table-cell">Línea</th>
            <th className="px-4 py-2.5">Total</th>
            <th className="hidden px-4 py-2.5 md:table-cell">Estado</th>
            <th className="px-4 py-2.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {pendingLines.map((pl) => {
            const theme = businessLineTheme[pl.businessLine] ?? businessLineTheme.adimenai;
            const creatingKey = `${pl.activityId}-${pl.businessLine}`;
            const isCreating = creating === creatingKey;
            return (
              <tr
                key={creatingKey}
                className="bg-amber-50/40 transition-colors duration-100 hover:bg-amber-50/70"
              >
                <td className="max-w-[12rem] truncate px-4 py-3 text-[12px] font-medium text-zinc-900">
                  {pl.activitySubject}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {clientNameMap[pl.clientId] ?? "—"}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", theme.badge)}>
                    {businessLineLabels[pl.businessLine] ?? pl.businessLine}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-zinc-400">—</td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Pendiente
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isCreating}
                    onClick={() => handleCreate(pl.activityId, pl.businessLine)}
                    className="text-amber-600 hover:text-amber-800"
                    aria-label="Crear presupuesto"
                  >
                    {isCreating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </Button>
                </td>
              </tr>
            );
          })}
          {pendingLines.length > 0 && presupuestos.length > 0 && (
            <tr className="bg-zinc-50/60">
              <td
                colSpan={6}
                className="px-4 py-2 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase"
              >
                Presupuestos generados
              </td>
            </tr>
          )}
          {presupuestos.length === 0 && pendingLines.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center text-sm text-zinc-500">
                No hay presupuestos para mostrar.
              </td>
            </tr>
          ) : (
            presupuestos.map((p) => {
              const primaryLine = (p.businessLines?.[0] ?? "adimenai") as keyof typeof businessLineTheme;
              const theme = businessLineTheme[primaryLine] ?? businessLineTheme.adimenai;
              return (
                <tr
                  key={p._id}
                  className="transition-colors duration-100 hover:bg-zinc-50/50"
                >
                  <td className="px-4 py-3 font-mono text-[12px] font-medium text-zinc-900">
                    {p.number}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {p.clientSnapshot.name}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        theme.badge
                      )}
                    >
                      {(p.businessLines ?? ["adimenai"])
                        .map((l) => businessLineLabels[l as keyof typeof businessLineLabels] ?? l)
                        .join(", ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-zinc-900">
                    {p.total.toFixed(2).replace(".", ",")} €
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        className="text-zinc-500 hover:text-zinc-900"
                      >
                        <Link href={`/admin/presupuestos/${p._id}`} aria-label="Ver">
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        className="text-zinc-500 hover:text-zinc-900"
                      >
                        <Link href={`/admin/presupuestos/${p._id}/edit`} aria-label="Editar">
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Eliminar"
                        className="text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={(e) => handleDelete(p._id, e)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
          <span className="text-[12px] text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="text-zinc-600 hover:bg-zinc-100"
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="text-zinc-600 hover:bg-zinc-100"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PresupuestoStatus }) {
  const colors: Record<PresupuestoStatus, string> = {
    draft: "bg-zinc-100 text-zinc-600",
    sent: "bg-amber-50 text-amber-700",
    accepted: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        colors[status] ?? "bg-zinc-100 text-zinc-700"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "draft" && "bg-zinc-400",
          status === "sent" && "bg-amber-500",
          status === "accepted" && "bg-emerald-500",
          status === "rejected" && "bg-rose-500"
        )}
      />
      {presupuestoStatusLabels[status] ?? status}
    </span>
  );
}
