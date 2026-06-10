"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessLineTheme } from "@/lib/theme";
import {
  businessLineLabels,
  presupuestoStatusLabels,
} from "@/lib/schemas/presupuesto";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import { cn } from "@/lib/utils";

export function PresupuestoDetail({
  presupuesto,
}: {
  presupuesto: Presupuesto;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme =
    businessLineTheme[
      presupuesto.businessLine as keyof typeof businessLineTheme
    ] ?? businessLineTheme.adimenai;

  const statusColors: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-700 border-zinc-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  async function handleGeneratePDF() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/presupuestos/${presupuesto._id}/pdf`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Error al generar PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presupuesto.number} - ${presupuesto.clientSnapshot.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
    setGenerating(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold text-zinc-900">
                {presupuesto.number}
              </span>
              <Badge
                variant="outline"
                className={cn("rounded-[2px]", theme.badge)}
              >
                {businessLineLabels[presupuesto.businessLine as keyof typeof businessLineLabels]}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-[2px]",
                  statusColors[presupuesto.status] ?? "bg-zinc-100 text-zinc-700"
                )}
              >
                {presupuestoStatusLabels[presupuesto.status] ?? presupuesto.status}
              </Badge>
            </div>
            {presupuesto.pdfDriveFileId && (
              <p className="mt-1 text-xs text-emerald-600">PDF guardado en Drive</p>
            )}
          </div>
          <Button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4" />
            )}
            {generating ? "Generando…" : "Generar PDF"}
          </Button>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Item label="Cliente">{presupuesto.clientSnapshot.name}</Item>
          {presupuesto.clientSnapshot.nif && (
            <Item label="NIF">{presupuesto.clientSnapshot.nif}</Item>
          )}
          {presupuesto.clientSnapshot.address && (
            <Item label="Dirección" className="sm:col-span-2">
              {presupuesto.clientSnapshot.address}
            </Item>
          )}
          {presupuesto.clientSnapshot.email && (
            <Item label="Email">{presupuesto.clientSnapshot.email}</Item>
          )}
          {presupuesto.clientSnapshot.phone && (
            <Item label="Teléfono">{presupuesto.clientSnapshot.phone}</Item>
          )}
          <Item label="Fecha de creación">
            {new Date(presupuesto.createdAt).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Item>
        </dl>

        {presupuesto.introduction && (
          <div className="mt-4 rounded-md bg-zinc-50 p-3">
            <p className="text-sm text-zinc-700 whitespace-pre-line">
              {presupuesto.introduction}
            </p>
          </div>
        )}
      </div>

      {/* Line items table */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
            <tr>
              <th className="px-5 py-3">Título</th>
              <th className="w-20 px-5 py-3 text-center">Cant.</th>
              <th className="w-28 px-5 py-3 text-right">Precio ud.</th>
              <th className="w-28 px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {presupuesto.items.map((item, i) => (
              <tr key={i} className="hover:bg-zinc-50/60">
                <td className="px-5 py-3 font-medium text-zinc-900">
                  {item.title}
                </td>
                <td className="px-5 py-3 text-center text-zinc-700">
                  {item.quantity}
                </td>
                <td className="px-5 py-3 text-right font-mono text-zinc-700">
                  {item.unitPrice.toFixed(2).replace(".", ",")} €
                </td>
                <td className="px-5 py-3 text-right font-mono text-zinc-900">
                  {item.total.toFixed(2).replace(".", ",")} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="ml-auto w-72 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600">Subtotal</span>
            <span className="font-mono text-zinc-900">
              {presupuesto.subtotal.toFixed(2).replace(".", ",")} €
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600">IVA ({presupuesto.taxRate}%)</span>
            <span className="font-mono text-zinc-900">
              {presupuesto.taxAmount.toFixed(2).replace(".", ",")} €
            </span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-semibold">
            <span className="text-zinc-900">Total</span>
            <span className="font-mono text-zinc-900">
              {presupuesto.total.toFixed(2).replace(".", ",")} €
            </span>
          </div>
        </div>
        {presupuesto.notes && (
          <p className="mt-3 text-xs text-zinc-500">{presupuesto.notes}</p>
        )}
      </div>

      {presupuesto.pdfDriveFileId && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">PDF en Drive</h3>
          <p className="mt-1 text-sm text-zinc-500">
            El PDF se ha guardado en la carpeta de Drive.
          </p>
        </div>
      )}
    </div>
  );
}

function Item({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-900">{children}</dd>
    </div>
  );
}
