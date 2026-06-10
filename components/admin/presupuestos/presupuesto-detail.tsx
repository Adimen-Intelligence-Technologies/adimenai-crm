"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown, Loader2, Mail, MapPin, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { businessLineTheme } from "@/lib/theme";
import {
  businessLineLabels,
  presupuestoStatusLabels,
} from "@/lib/schemas/presupuesto";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 border-zinc-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

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
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {/* Header */}
        <div className="relative border-b border-zinc-100 px-6 py-5">
          <div
            className="absolute bottom-0 left-0 top-0 w-1"
            style={{ backgroundColor: theme.accent }}
          />
          <div className="flex items-start justify-between gap-4 pl-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {presupuesto.number}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("rounded-[2px]", theme.badge)}
                >
                  {businessLineLabels[presupuesto.businessLine as keyof typeof businessLineLabels]}
                </Badge>
                <span
                  className={cn(
                    "inline-flex items-center rounded-[2px] border px-2.5 py-0.5 text-xs font-medium",
                    statusStyles[presupuesto.status] ?? "bg-zinc-100 text-zinc-700"
                  )}
                >
                  {presupuestoStatusLabels[presupuesto.status] ?? presupuesto.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Creado{" "}
                {new Date(presupuesto.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button
              onClick={handleGeneratePDF}
              disabled={generating}
              size="sm"
              className="shrink-0"
              style={{ backgroundColor: theme.accent, color: "#fff" }}
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
              {generating ? "Generando…" : "Descargar PDF"}
            </Button>
          </div>
        </div>

        {/* Client info */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-6 py-5 sm:grid-cols-2">
          <InfoRow
            icon={<User className="size-4" />}
            label="Cliente"
            value={presupuesto.clientSnapshot.name}
          />
          {presupuesto.clientSnapshot.nif && (
            <InfoRow label="NIF/CIF" value={presupuesto.clientSnapshot.nif} />
          )}
          {presupuesto.clientSnapshot.address && (
            <InfoRow
              icon={<MapPin className="size-4" />}
              label="Dirección"
              value={presupuesto.clientSnapshot.address}
              className="sm:col-span-2"
            />
          )}
          {presupuesto.clientSnapshot.email && (
            <InfoRow
              icon={<Mail className="size-4" />}
              label="Email"
              value={presupuesto.clientSnapshot.email}
            />
          )}
          {presupuesto.clientSnapshot.phone && (
            <InfoRow
              icon={<Phone className="size-4" />}
              label="Teléfono"
              value={presupuesto.clientSnapshot.phone}
            />
          )}
        </div>

        {/* Introduction */}
        {presupuesto.introduction && (
          <div className="border-t border-zinc-100 px-6 py-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600">
              {presupuesto.introduction}
            </p>
          </div>
        )}

        {/* Items table */}
        <div className="border-t border-zinc-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Título
                </th>
                <th className="w-20 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Cant.
                </th>
                <th className="w-28 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Precio ud.
                </th>
                <th className="w-28 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {presupuesto.items.map((item, i) => (
                <tr key={i} className="hover:bg-zinc-50/60">
                  <td className="px-6 py-3 font-medium text-zinc-900">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-sm text-zinc-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-zinc-600">
                    {item.unitPrice.toFixed(2).replace(".", ",")} €
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-sm font-medium text-zinc-900">
                    {item.total.toFixed(2).replace(".", ",")} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end border-t border-zinc-100 px-6 py-5">
          <div className="w-64 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-mono text-zinc-700">
                {presupuesto.subtotal.toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">
                IVA ({presupuesto.taxRate}%)
              </span>
              <span className="font-mono text-zinc-700">
                {presupuesto.taxAmount.toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-semibold">
              <span className="text-zinc-900">Total</span>
              <span className="font-mono text-lg" style={{ color: theme.accent }}>
                {presupuesto.total.toFixed(2).replace(".", ",")} €
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {presupuesto.notes && (
          <div className="border-t border-zinc-100 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Notas
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-zinc-500">
              {presupuesto.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      {icon && (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-400">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-zinc-900 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
