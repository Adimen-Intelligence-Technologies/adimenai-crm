"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  ExternalLink,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { businessLineTheme } from "@/lib/theme";
import { businessLineLabels } from "@/lib/schemas/client";
import {
  DEAL_STAGES,
  dealStageColors,
  dealStageLabels,
  getNextStages,
} from "@/lib/schemas/deal";
import { getInitials } from "@/lib/schemas/sales-agent";
import { ActivityTimeline } from "@/components/admin/activities/activity-timeline";
import type { Deal } from "@/lib/repositories/deals";
import type { Activity } from "@/lib/repositories/activities";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

type Props = {
  deal: Deal;
  salesAgent: SalesAgent | null;
  salesAgents: SalesAgent[];
  activities: Activity[];
};

export function DealDetail({
  deal,
  salesAgent,
  salesAgents,
  activities,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const theme = businessLineTheme[deal.businessLine];
  const salesAgentsById: Record<string, SalesAgent> = {};
  for (const a of salesAgents) salesAgentsById[a._id] = a;

  async function move(stage: Deal["stage"], lostReason?: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/deals/${deal._id}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, lostReason }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "No se pudo mover");
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      }
    });
  }

  async function setLost() {
    const reason =
      typeof window !== "undefined"
        ? window.prompt("¿Por qué se perdió la oportunidad? (opcional)") ?? ""
        : "";
    await move("lost", reason);
  }

  const nextStages = getNextStages(deal.stage).filter((s) => s !== "lost");

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div
        className="rounded-xl px-6 py-6 sm:px-8 sm:py-7"
        style={{
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
        }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md border bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white"
                )}
              >
                {businessLineLabels[deal.businessLine]}
              </span>
              <span
                className={cn(
                  "rounded-md border bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white"
                )}
              >
                {dealStageLabels[deal.stage]}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {deal.title}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              <Link
                href={`/admin/clients/${deal.clientId}`}
                className="font-semibold text-white underline-offset-2 hover:underline"
              >
                {deal.clientSnapshot.name}
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {salesAgent && (
              <span className="inline-flex h-9 items-center gap-2 rounded-md bg-white/15 px-3 text-[13px] font-semibold text-white">
                <span
                  className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: salesAgent.color }}
                >
                  {getInitials(salesAgent.name)}
                </span>
                {salesAgent.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6">
            <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">
              Movimiento
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                  dealStageColors[deal.stage]
                )}
              >
                Actual: {dealStageLabels[deal.stage]}
              </span>
              {nextStages.length > 0 ? (
                nextStages.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => move(s)}
                    disabled={isPending}
                    className="h-7 text-[12px]"
                  >
                    Mover a {dealStageLabels[s]}
                    <ChevronRight className="size-3" />
                  </Button>
                ))
              ) : (
                <span className="text-[12px] text-zinc-500">
                  Esta oportunidad está en etapa terminal.
                </span>
              )}
              {deal.stage !== "lost" && deal.stage !== "paid" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={setLost}
                  disabled={isPending}
                  className="h-7 border-rose-200 text-[12px] text-rose-700 hover:bg-rose-50"
                >
                  Marcar como perdida
                </Button>
              )}
            </div>
            <div className="mt-4 flex items-center gap-1 overflow-x-auto">
              {DEAL_STAGES.filter(
                (s): s is Exclude<Deal["stage"], "lost"> => s !== "lost"
              ).map((s, i, arr) => {
                const idx = arr.indexOf(deal.stage as Exclude<Deal["stage"], "lost">);
                const active = arr.indexOf(s) === idx;
                const past = idx !== -1 && arr.indexOf(s) < idx;
                return (
                  <div key={s} className="flex items-center gap-1">
                    <span
                      className={cn(
                        "h-2 w-6 rounded-full",
                        active && "bg-[#3B1E8A]",
                        past && "bg-emerald-500",
                        !active && !past && "bg-zinc-200"
                      )}
                    />
                    {i < arr.length - 1 && <span className="h-px w-2 bg-zinc-200" />}
                  </div>
                );
              })}
            </div>
          </section>

          {deal.notes && (
            <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6">
              <h2 className="mb-2 text-sm font-bold tracking-tight text-zinc-950">
                Notas
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                {deal.notes}
              </p>
            </section>
          )}

          <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-zinc-950">
                Historial del cliente
              </h2>
              <Link
                href={`/admin/clients/${deal.clientId}`}
                className="text-[12px] font-semibold text-[#3B1E8A] hover:underline"
              >
                Ver ficha completa
              </Link>
            </div>
            <ActivityTimeline
              activities={activities}
              salesAgentsById={salesAgentsById}
              onChange={() => router.refresh()}
              emptyMessage="Aún no hay actividades para este cliente."
            />
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6">
            <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">
              Detalle
            </h2>
            <dl className="space-y-3 text-sm">
              <Row label="Valor estimado">
                <span className="font-mono font-bold tabular-nums">
                  {new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: deal.currency || "EUR",
                  }).format(deal.estimatedValue)}
                </span>
              </Row>
              {deal.expectedCloseDate && (
                <Row label="Cierre esperado">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5 text-zinc-400" />
                    {new Date(deal.expectedCloseDate).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </Row>
              )}
              {deal.closedAt && (
                <Row label="Cerrado el">
                  {new Date(deal.closedAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Row>
              )}
              {deal.lostReason && (
                <Row label="Motivo pérdida">
                  <span className="text-rose-700">{deal.lostReason}</span>
                </Row>
              )}
              <Row label="Creado">
                {new Date(deal.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Row>
            </dl>
          </section>

          <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6">
            <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">
              Cliente
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-semibold text-zinc-900">
                {deal.clientSnapshot.name}
              </p>
              {deal.clientSnapshot.email && (
                <a
                  href={`mailto:${deal.clientSnapshot.email}`}
                  className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-[#3B1E8A]"
                >
                  <Mail className="size-3.5" />
                  {deal.clientSnapshot.email}
                </a>
              )}
              {deal.clientSnapshot.phone && (
                <a
                  href={`tel:${deal.clientSnapshot.phone}`}
                  className="inline-flex items-center gap-1.5 text-zinc-700 hover:text-[#3B1E8A]"
                >
                  <Phone className="size-3.5" />
                  {deal.clientSnapshot.phone}
                </a>
              )}
              {deal.clientSnapshot.taxId && (
                <p className="text-[12px] text-zinc-500">
                  NIF/CIF: {deal.clientSnapshot.taxId}
                </p>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2 w-full"
              >
                <Link href={`/admin/clients/${deal.clientId}`}>
                  <ExternalLink className="size-3.5" />
                  Abrir ficha
                </Link>
              </Button>
            </div>
          </section>

          {deal.sourcePresupuestoId && (
            <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6">
              <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">
                Presupuesto
              </h2>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/admin/presupuestos/${deal.sourcePresupuestoId}`}>
                  <FileText className="size-3.5" />
                  Abrir presupuesto origen
                </Link>
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-zinc-900">{children}</dd>
    </div>
  );
}
