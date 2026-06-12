"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";
import { businessLineLabels } from "@/lib/schemas/client";
import { getInitials } from "@/lib/schemas/sales-agent";
import {
  DEAL_STAGES,
  dealStageLabels,
  type DealStage,
} from "@/lib/schemas/deal";
import { DealCard } from "./deal-card";
import { SearchableCombobox, type ComboboxItem } from "@/components/ui/searchable-combobox";
import type { Deal } from "@/lib/repositories/deals";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

type Props = {
  deals: Deal[];
  salesAgents: SalesAgent[];
  salesAgentsById: Record<string, SalesAgent>;
  filters: { line?: string; agent?: string; q?: string };
};

export function PipelineView({
  deals,
  salesAgents,
  salesAgentsById,
  filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending] = useTransition();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    router.replace(`/admin/pipeline?${params.toString()}`);
  }

  // Combobox items
  const lineItems: ComboboxItem[] = (["adimenai", "herrikonekt", "hiopos"] as const).map(
    (l) => ({
      value: l,
      label: businessLineLabels[l],
      icon: <span className={cn(
        "size-2.5 rounded-full",
        l === "adimenai" && "bg-violet-500",
        l === "herrikonekt" && "bg-emerald-500",
        l === "hiopos" && "bg-red-500"
      )} />,
    })
  );

  const agentItems: ComboboxItem[] = salesAgents
    .filter((a) => a.isActive)
    .map((a) => ({
      value: a._id,
      label: a.name,
      icon: (
        <span
          className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: a.color }}
        >
          {getInitials(a.name)}
        </span>
      ),
    }));

  // Bucket deals by stage
  const byStage = new Map<DealStage, Deal[]>();
  for (const stage of DEAL_STAGES) byStage.set(stage, []);
  for (const d of deals) byStage.get(d.stage)?.push(d);

  const totalValue = deals.reduce((sum, d) => sum + (d.estimatedValue ?? 0), 0);
  const openDeals = deals.filter((d) => !["paid", "lost"].includes(d.stage));
  const openValue = openDeals.reduce(
    (sum, d) => sum + (d.estimatedValue ?? 0),
    0
  );
  const wonValue = deals
    .filter((d) => d.stage === "paid")
    .reduce((sum, d) => sum + (d.estimatedValue ?? 0), 0);
  const lostCount = deals.filter((d) => d.stage === "lost").length;

  const hasFilters = !!filters.q || !!filters.line || !!filters.agent;

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader
        title="Pipeline"
        description="Oportunidades activas por etapa. Pasa el ratón y haz clic en una card para abrir el detalle."
        search={
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="group relative w-full lg:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-[#3B1E8A]"
                aria-hidden
              />
              <Input
                type="search"
                defaultValue={filters.q ?? ""}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Buscar por título o cliente"
                className="h-9 pl-9 pr-9 text-[13px] focus-visible:border-[#3B1E8A] focus-visible:ring-[#3B1E8A]/20"
              />
              {filters.q && (
                <button
                  type="button"
                  onClick={() => setParam("q", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="w-full lg:w-48">
              <SearchableCombobox
                value={filters.line ?? ""}
                onChange={(v) => setParam("line", v || null)}
                items={lineItems}
                placeholder="Línea…"
                clearLabel="Todas las líneas"
                emptyLabel="Sin líneas"
              />
            </div>
            <div className="w-full lg:w-56">
              <SearchableCombobox
                value={filters.agent ?? ""}
                onChange={(v) => setParam("agent", v || null)}
                items={agentItems}
                placeholder="Comercial…"
                clearLabel="Todos los comerciales"
                emptyLabel="Sin comerciales"
              />
            </div>
            {hasFilters && (
              <Link
                href="/admin/pipeline"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white px-3 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <X className="size-3.5" />
                Limpiar
              </Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Abiertas"
          value={openDeals.length.toString()}
          sub={`${formatMoney(openValue)} en juego`}
          tone="violet"
        />
        <KpiCard
          label="Cobradas"
          value={formatMoney(wonValue)}
          sub={`${deals.filter((d) => d.stage === "paid").length} oportunidades`}
          tone="emerald"
        />
        <KpiCard
          label="Perdidas"
          value={lostCount.toString()}
          sub={lostCount === 0 ? "ninguna" : "en este filtro"}
          tone="rose"
        />
        <KpiCard
          label="Total"
          value={deals.length.toString()}
          sub={`${formatMoney(totalValue)} estimado`}
          tone="zinc"
        />
      </div>

      <div
        className={cn(
          "overflow-x-auto pb-3 transition-opacity",
          isPending && "opacity-70"
        )}
      >
        <div className="flex min-w-max gap-3">
          {DEAL_STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              deals={byStage.get(stage) ?? []}
              salesAgentsById={salesAgentsById}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  deals,
  salesAgentsById,
}: {
  stage: DealStage;
  deals: Deal[];
  salesAgentsById: Record<string, SalesAgent>;
}) {
  const stageValue = deals.reduce(
    (sum, d) => sum + (d.estimatedValue ?? 0),
    0
  );
  const isTerminal = stage === "paid" || stage === "lost";
  const isWon = stage === "paid";

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-2xl border border-zinc-200/80 bg-zinc-100/40 p-2.5">
      {/* Header de la etapa */}
      <div
        className={cn(
          "rounded-xl px-3 py-2.5",
          isWon && "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-200",
          stage === "lost" && "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-200",
          !isTerminal && "bg-white border border-zinc-200/80"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "text-[13px] font-bold tracking-tight",
              isTerminal ? "text-white" : "text-zinc-950"
            )}
          >
            {dealStageLabels[stage]}
          </h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
              isTerminal
                ? "bg-white/20 text-white"
                : "bg-zinc-100 text-zinc-700"
            )}
          >
            {deals.length}
          </span>
        </div>
        {stageValue > 0 && (
          <p
            className={cn(
              "mt-1 font-mono text-[15px] font-bold tabular-nums",
              isTerminal ? "text-white/95" : "text-zinc-900"
            )}
          >
            {formatMoney(stageValue)}
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="mt-2 flex min-h-[160px] flex-col gap-2">
        {deals.length === 0 ? (
          <div
            className={cn(
              "flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center text-[12px]",
              isTerminal
                ? "border-zinc-200/60 text-zinc-400"
                : "border-zinc-200 bg-white/50 text-zinc-400"
            )}
          >
            <span>Sin oportunidades</span>
          </div>
        ) : (
          deals.map((d) => (
            <DealCard
              key={d._id}
              deal={d}
              salesAgent={
                d.salesAgentId ? salesAgentsById[d.salesAgentId] : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "violet" | "emerald" | "rose" | "zinc";
}) {
  const toneClasses = {
    violet: "from-violet-50 to-white border-violet-100",
    emerald: "from-emerald-50 to-white border-emerald-100",
    rose: "from-rose-50 to-white border-rose-100",
    zinc: "from-zinc-50 to-white border-zinc-200/80",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br px-4 py-3.5 shadow-sm shadow-zinc-900/[0.02]",
        toneClasses
      )}
    >
      <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-950">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[11px] text-zinc-500">{sub}</p>
      )}
    </div>
  );
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
