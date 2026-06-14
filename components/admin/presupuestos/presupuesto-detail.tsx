"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileDown,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessLineTheme } from "@/lib/theme";
import {
  businessLineLabels,
  serviceBillingShort,
  type PresupuestoStatus,
} from "@/lib/schemas/presupuesto";
import { activityTypeLabels } from "@/lib/schemas/activity";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import type { Activity } from "@/lib/repositories/activities";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  PresupuestoStatus,
  {
    label: string;
    chip: string;
    dot: string;
    helper: string;
  }
> = {
  draft: {
    label: "Borrador",
    chip: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dot: "bg-zinc-400",
    helper: "Aún no se ha enviado al cliente.",
  },
  sent: {
    label: "Enviado",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    helper: "Enviado al cliente. Esperando respuesta.",
  },
  accepted: {
    label: "Aceptado",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    helper: "El cliente ha aceptado este presupuesto.",
  },
  rejected: {
    label: "Rechazado",
    chip: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
    helper: "El cliente ha rechazado este presupuesto.",
  },
};

function formatEUR(n: number): string {
  return (
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(n)
      .replace(",", ",") + " €"
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PresupuestoDetail({
  presupuesto,
  sourceActivity,
}: {
  presupuesto: Presupuesto;
  sourceActivity?: Activity | null;
}) {
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const primaryLine = (presupuesto.businessLines?.[0] ?? "adimenai") as keyof typeof businessLineTheme;
  const theme = businessLineTheme[primaryLine] ?? businessLineTheme.adimenai;

  const status = presupuesto.status;
  const meta = STATUS_META[status];

  const clientInitials = presupuesto.clientSnapshot.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  async function changeStatus(next: PresupuestoStatus) {
    setError(null);
    setIsMutating(true);
    try {
      const res = await fetch(`/api/presupuestos/${presupuesto._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "No se pudo cambiar el estado");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsMutating(false);
    }
  }

  async function handleGeneratePDF() {
    setError(null);
    setGenerating(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`/api/presupuestos/${presupuesto._id}/pdf`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let msg = "Error al generar PDF";
        try {
          const json = JSON.parse(text) as { error?: string };
          if (json.error) msg = json.error;
        } catch {
          if (text) msg = text.slice(0, 200);
        }
        throw new Error(msg);
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
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("La generación del PDF está tardando demasiado. Revisa que los assets (logo, imágenes) existan en /public.");
      } else {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ============================== HERO ============================== */}
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-6 sm:px-7 sm:py-7"
        style={{
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
        }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm",
                  meta.chip.replace(/bg-\S+/, "border-white/30")
                )}
              >
                <span className={cn("size-1.5 rounded-full", meta.dot)} />
                {meta.label}
              </span>
              {(presupuesto.businessLines ?? ["adimenai"]).map((line) => {
                const key = line as keyof typeof businessLineLabels;
                return (
                  <span key={line} className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/90">
                    {businessLineLabels[key] ?? line}
                  </span>
                );
              })}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {presupuesto.number}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {meta.helper}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Creado el {formatDate(presupuesto.createdAt)}
              </span>
              {presupuesto.createdAt !== presupuesto.updatedAt && (
                <span className="inline-flex items-center gap-1.5">
                  · Actualizado el {formatDate(presupuesto.updatedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Tarjeta de total destacada */}
          <div className="rounded-2xl bg-white/15 px-5 py-4 text-white backdrop-blur-sm sm:min-w-[14rem]">
            <p className="text-[10px] font-semibold tracking-wide text-white/75 uppercase">
              Total
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums sm:text-4xl">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 2,
              }).format(presupuesto.total)}
            </p>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-white/80">
              <span>Subtotal {formatEUR(presupuesto.subtotal)}</span>
              <span>·</span>
              <span>IVA {presupuesto.taxRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== GRID PRINCIPAL ============================== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Columna izquierda: cliente + líneas + notas */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Tarjeta cliente */}
          <section className="rounded-xl border border-zinc-200/80 bg-white p-5">
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-zinc-950">
                Cliente
              </h2>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[12px] text-zinc-500 hover:text-zinc-900"
              >
                <Link href={`/admin/clients/${presupuesto.clientId}`}>
                  Ver ficha
                  <ExternalLink className="size-3" />
                </Link>
              </Button>
            </header>
            <div className="flex items-start gap-4">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                style={{ backgroundColor: theme.accent }}
              >
                {clientInitials || "·"}
              </span>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                    Nombre
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                    {presupuesto.clientSnapshot.name}
                  </p>
                </div>
                {presupuesto.clientSnapshot.nif && (
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                      NIF / CIF
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-medium text-zinc-900">
                      {presupuesto.clientSnapshot.nif}
                    </p>
                  </div>
                )}
                {presupuesto.clientSnapshot.email && (
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${presupuesto.clientSnapshot.email}`}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:text-[#3B1E8A]"
                    >
                      <Mail className="size-3.5 text-zinc-400" />
                      {presupuesto.clientSnapshot.email}
                    </a>
                  </div>
                )}
                {presupuesto.clientSnapshot.phone && (
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                      Teléfono
                    </p>
                    <a
                      href={`tel:${presupuesto.clientSnapshot.phone}`}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:text-[#3B1E8A]"
                    >
                      <Phone className="size-3.5 text-zinc-400" />
                      {presupuesto.clientSnapshot.phone}
                    </a>
                  </div>
                )}
                {presupuesto.clientSnapshot.address && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                      Dirección
                    </p>
                    <p className="mt-0.5 inline-flex items-start gap-1.5 text-sm font-medium text-zinc-900">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-zinc-400" />
                      {presupuesto.clientSnapshot.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Líneas de pedido */}
          <section className="rounded-xl border border-zinc-200/80 bg-white">
            <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-zinc-950">
                  Líneas de pedido
                </h2>
                <p className="text-[12px] text-zinc-500">
                  {presupuesto.items.length}{" "}
                  {presupuesto.items.length === 1 ? "línea" : "líneas"} ·{" "}
                  {presupuesto.items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                  unidades en total
                </p>
              </div>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-500">
                    <th className="px-5 py-2.5 font-semibold">Concepto</th>
                    <th className="w-20 px-3 py-2.5 text-center font-semibold">
                      Cant.
                    </th>
                    <th className="w-28 px-3 py-2.5 text-right font-semibold">
                      Precio ud.
                    </th>
                    <th className="w-24 px-3 py-2.5 text-center font-semibold">
                      Tipo
                    </th>
                    <th className="w-32 px-5 py-2.5 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {presupuesto.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3 font-medium text-zinc-900">
                        {item.title}
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-sm tabular-nums text-zinc-600">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm tabular-nums text-zinc-600">
                        {formatEUR(item.unitPrice)}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-zinc-500">
                        {serviceBillingShort[item.billing] ?? "/ ud."}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums text-zinc-900">
                        {formatEUR(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-4">
              <div className="ml-auto w-full max-w-xs space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-mono tabular-nums text-zinc-700">
                    {formatEUR(presupuesto.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    IVA ({presupuesto.taxRate}%)
                  </span>
                  <span className="font-mono tabular-nums text-zinc-700">
                    {formatEUR(presupuesto.taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-2">
                  <span className="text-sm font-bold text-zinc-950">Total</span>
                  <span
                    className="font-mono text-lg font-bold tabular-nums"
                    style={{ color: theme.accent }}
                  >
                    {formatEUR(presupuesto.total)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Introducción + Notas */}
          {(presupuesto.introduction || presupuesto.notes) && (
            <section className="rounded-xl border border-zinc-200/80 bg-white p-5">
              {presupuesto.introduction && (
                <div className={presupuesto.notes ? "mb-5" : ""}>
                  <h3 className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                    Introducción
                  </h3>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                    {presupuesto.introduction}
                  </p>
                </div>
              )}
              {presupuesto.notes && (
                <div>
                  <h3 className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                    Notas
                  </h3>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                    {presupuesto.notes}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Columna derecha: acciones + visita origen + meta */}
        <div className="flex flex-col gap-5">
          {/* Acciones principales */}
          <section
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: theme.accent + "40" }}
          >
            <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">
              Acciones
            </h2>
            <div className="space-y-2">
              {status === "draft" && (
                <PrimaryActionButton
                  onClick={() => changeStatus("sent")}
                  disabled={isMutating}
                  loading={isMutating}
                  theme={theme}
                  icon={<Send className="size-4" />}
                  label="Marcar como enviado"
                  sublabel="Crea una actividad email automática"
                />
              )}
              {status === "sent" && (
                <>
                  <PrimaryActionButton
                    onClick={() => changeStatus("accepted")}
                    disabled={isMutating}
                    loading={isMutating}
                    theme={theme}
                    icon={<Check className="size-4" />}
                    label="Marcar como aceptado"
                    sublabel="El cliente ha dicho sí"
                    tone="emerald"
                  />
                  <SecondaryActionButton
                    onClick={() => changeStatus("rejected")}
                    disabled={isMutating}
                    icon={<XCircle className="size-4" />}
                    label="Marcar como rechazado"
                    tone="rose"
                  />
                </>
              )}
              {status === "accepted" && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900">Aceptado</p>
                    <p className="text-[12px] text-emerald-700/80">
                      Estado terminal. Si el cliente cambia de opinión, edita el
                      presupuesto.
                    </p>
                  </div>
                </div>
              )}
              {status === "rejected" && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-sm">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-semibold text-rose-900">Rechazado</p>
                    <p className="text-[12px] text-rose-700/80">
                      Si quieres reabrir la conversación, crea uno nuevo
                      desde la actividad origen.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={generating}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                {generating ? "Generando PDF…" : "Descargar PDF"}
              </button>
            </div>
          </section>

          {/* Visita origen */}
          {sourceActivity && (
            <section className="rounded-xl border border-[#3B1E8A]/20 bg-gradient-to-br from-[#3B1E8A]/5 to-transparent p-5">
              <h2 className="mb-2 text-[11px] font-semibold tracking-wide text-[#3B1E8A] uppercase">
                Visita origen
              </h2>
              <p className="text-sm font-semibold text-zinc-900">
                {sourceActivity.subject}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-zinc-500">
                <User className="size-3" />
                {activityTypeLabels[sourceActivity.type]} ·{" "}
                {formatDateTime(sourceActivity.occurredAt)}
              </p>
              {sourceActivity.description && (
                <p className="mt-2 line-clamp-3 text-[12px] text-zinc-600">
                  {sourceActivity.description}
                </p>
              )}
              <Link
                href="/admin/activities"
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#3B1E8A] hover:underline"
              >
                <Link2 className="size-3" />
                Ver timeline
                <ArrowRight className="size-3" />
              </Link>
            </section>
          )}

          {/* Mini-meta */}
          <section className="rounded-xl border border-zinc-200/80 bg-white p-5">
            <h2 className="mb-3 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
              Detalle
            </h2>
            <dl className="space-y-2.5 text-sm">
              <MetaRow label="Línea">
                <span
                  className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: theme.accent + "15",
                    color: theme.accent,
                  }}
                >
                  <Building2 className="size-3" />
                  {(presupuesto.businessLines ?? ["adimenai"])
                    .map((l) => businessLineLabels[l as keyof typeof businessLineLabels] ?? l)
                    .join(", ")}
                </span>
              </MetaRow>
              <MetaRow label="Nº presupuesto">
                <span className="font-mono text-zinc-900">
                  {presupuesto.number}
                </span>
              </MetaRow>
              <MetaRow label="Cliente">
                <span className="text-zinc-900">
                  {presupuesto.clientSnapshot.name}
                </span>
              </MetaRow>
              {presupuesto.clientSnapshot.nif && (
                <MetaRow label="NIF / CIF">
                  <span className="font-mono text-zinc-900">
                    {presupuesto.clientSnapshot.nif}
                  </span>
                </MetaRow>
              )}
              <MetaRow label="Creado">
                {formatDate(presupuesto.createdAt)}
              </MetaRow>
              {presupuesto.updatedAt !== presupuesto.createdAt && (
                <MetaRow label="Actualizado">
                  {formatDate(presupuesto.updatedAt)}
                </MetaRow>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function PrimaryActionButton({
  onClick,
  disabled,
  loading,
  icon,
  label,
  sublabel,
  theme,
  tone = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  theme: { accent: string; accentHover: string };
  tone?: "default" | "emerald";
}) {
  const color = tone === "emerald" ? "#059669" : theme.accent;
  const hover = tone === "emerald" ? "#047857" : theme.accentHover;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white shadow-sm transition-all hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: color }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = hover)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = color)
      }
    >
      <div className="flex items-center gap-2.5">
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          icon
        )}
        <div>
          <p className="leading-tight">{label}</p>
          {sublabel && (
            <p className="text-[11px] font-normal opacity-80">{sublabel}</p>
          )}
        </div>
      </div>
      <ArrowRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function SecondaryActionButton({
  onClick,
  disabled,
  icon,
  label,
  tone = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  tone?: "default" | "rose";
}) {
  const colorClasses =
    tone === "rose"
      ? "border-rose-200 text-rose-700 hover:bg-rose-50"
      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        colorClasses
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
        {label}
      </dt>
      <dd className="text-sm font-medium text-zinc-900">{children}</dd>
    </div>
  );
}
