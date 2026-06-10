"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessLineTheme } from "@/lib/theme";
import { businessLineLabels, presupuestoStatusLabels } from "@/lib/schemas/presupuesto";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import { cn } from "@/lib/utils";

export function PresupuestoTable({
  presupuestos,
  page,
  totalPages,
  onPageChange,
}: {
  presupuestos: Presupuesto[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const router = useRouter();

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Eliminar este presupuesto?")) return;
    const res = await fetch(`/api/presupuestos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
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
          {presupuestos.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                No hay presupuestos para mostrar.
              </td>
            </tr>
          ) : (
            presupuestos.map((p) => {
              const theme = businessLineTheme[p.businessLine as keyof typeof businessLineTheme] ?? businessLineTheme.adimenai;
              return (
                <tr key={p._id} className="hover:bg-zinc-50/60">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-zinc-900">
                    {p.number}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {p.clientSnapshot.name}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge variant="outline" className={cn("rounded-[2px]", theme.badge)}>
                      {businessLineLabels[p.businessLine as keyof typeof businessLineLabels] ?? p.businessLine}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-zinc-900">
                    {p.total.toFixed(2).replace(".", ",")} €
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" className="text-zinc-500 hover:text-zinc-900">
                        <Link href={`/admin/presupuestos/${p._id}`}>
                          <Eye />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon-sm" className="text-zinc-500 hover:text-zinc-900">
                        <Link href={`/admin/presupuestos/${p._id}/edit`}>
                          <Pencil />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={(e) => handleDelete(p._id, e)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
          <span className="text-xs text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = presupuestoStatusLabels;
  const colors: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-700 border-zinc-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <Badge variant="outline" className={cn("rounded-[2px]", colors[status] ?? "bg-zinc-100 text-zinc-700")}>
      {labels[status] ?? status}
    </Badge>
  );
}
