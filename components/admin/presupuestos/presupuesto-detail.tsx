"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  FileDown,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessLineTheme } from "@/lib/theme";
import {
  businessLineLabels,
  presupuestoStatusLabels,
} from "@/lib/schemas/presupuesto";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { chip: string; dot: string }> = {
  draft: { chip: "bg-zinc-100 text-zinc-600", dot: "bg-zinc-400" },
  sent: { chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  accepted: { chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  rejected: { chip: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

export function PresupuestoDetail({
  presupuesto,
  linkedDealId,
}: {
  presupuesto: Presupuesto;
  linkedDealId?: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme =
    businessLineTheme[
      presupuesto.businessLine as keyof typeof businessLineTheme
    ] ?? businessLineTheme.adimenai;

  const isAccepted = presupuesto.status === "accepted";

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

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/presupuestos/${presupuesto._id}/accept`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "No se pudo aceptar el presupuesto");
      }
      const data = (await res.json()) as { deal?: { _id: string } };
      if (data.deal?._id) {
        router.push(`/admin/deals/${data.deal._id}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isAccepted && linkedDealId && (
        <div
          className="flex flex-col gap-3 rounded-lg border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}10, transparent)`,
            borderColor: theme.accent + "40",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-white"
              style={{ backgroundColor: theme.accent }}
            >
              <Check className="size-4" />
            </span>
            <div>
              <p className="font-semibold text-zinc-900">
                Presupuesto aceptado
              </p>
              <p className="text-[12px] text-zinc-500">
                Se generó una oportunidad en el pipeline.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="self-start text-white sm:self-auto"
            style={{ backgroundColor: theme.accent }}
          >
            <Link href={`/admin/deals/${linkedDealId}`}>Ver oportunidad →</Link>
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
        <div className="relative border-b border-zinc-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.accent }}
                  aria-hidden
                />
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {presupuesto.number}
                </h1>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    theme.badge
                  )}
                >
                  {businessLineLabels[presupuesto.businessLine as keyof typeof businessLineLabels]}
                </span>
                {(() => {
                  const st = statusStyles[presupuesto.status] ?? statusStyles.draft;
                  return (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        st.chip
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", st.dot)} />
                      {presupuestoStatusLabels[presupuesto.status] ?? presupuesto.status}
                    </span>
                  );
                })()}
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
            <div className="flex shrink-0 items-center gap-2">
              {!isAccepted && presupuesto.status !== "rejected" && (
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {accepting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {accepting ? "Aceptando…" : "Aceptar presupuesto"}
                </Button>
              )}
              <Button
                onClick={handleGeneratePDF}
                disabled={generating}
                size="sm"
                className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
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
        </div>

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

        {presupuesto.introduction && (
          <div className="border-t border-zinc-100 px-6 py-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600">
              {presupuesto.introduction}
            </p>
          </div>
        )}

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
