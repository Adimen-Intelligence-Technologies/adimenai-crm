"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, Mail, MessageSquare, NotebookPen, Phone, Plus, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";
import {
  activityOutcomeEnum,
  activityTypeEnum,
  activityTypeLabels,
  type ActivityOutcome,
} from "@/lib/schemas/activity";
import { getInitials } from "@/lib/schemas/sales-agent";
import { ActivityTimeline } from "./activity-timeline";
import { ActivityForm } from "./activity-form";
import { SearchableCombobox, type ComboboxItem } from "@/components/ui/searchable-combobox";
import type { Activity, PaginatedResult } from "@/lib/repositories/activities";
import type { Client } from "@/lib/repositories/clients";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

type Props = {
  result: PaginatedResult<Activity>;
  salesAgents: SalesAgent[];
  clients: Client[];
  salesAgentsById: Record<string, SalesAgent>;
  clientNameById: Record<string, string>;
  filters: {
    clientId?: string;
    salesAgentId?: string;
    type?: string;
    outcome?: string;
    pendingNextAction?: string;
    from?: string;
    to?: string;
    q?: string;
  };
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  visit: User,
  call: Phone,
  email: Mail,
  meeting: CalendarClock,
  whatsapp: MessageSquare,
  note: NotebookPen,
};

function outcomeLabel(o: ActivityOutcome): string {
  if (o === "positive") return "Positivo";
  if (o === "neutral") return "Neutro";
  if (o === "negative") return "Negativo";
  return "Pendiente";
}

const outcomeDot: Record<ActivityOutcome, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-zinc-400",
  negative: "bg-rose-500",
  pending: "bg-amber-500",
};

export function ActivitiesView({
  result,
  salesAgents,
  clients,
  salesAgentsById,
  clientNameById,
  filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    router.replace(`/admin/activities?${params.toString()}`);
  }

  // Type
  const typeItems: ComboboxItem[] = activityTypeEnum.options.map((t) => {
    const Icon = TYPE_ICONS[t] ?? NotebookPen;
    return {
      value: t,
      label: activityTypeLabels[t],
      icon: <Icon className="size-3.5 text-zinc-500" />,
    };
  });

  // Outcome
  const outcomeItems: ComboboxItem[] = activityOutcomeEnum.options.map((o) => ({
    value: o,
    label: outcomeLabel(o),
    icon: <span className={cn("size-2 rounded-full", outcomeDot[o])} />,
  }));

  // Sales agents
  const agentItems: ComboboxItem[] = salesAgents
    .filter((a) => a.isActive)
    .map((a) => ({
      value: a._id,
      label: a.name,
      sublabel: a.isActive ? undefined : "inactivo",
      icon: (
        <span
          className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: a.color }}
        >
          {getInitials(a.name)}
        </span>
      ),
    }));

  // Clients (ordenados alfabéticamente)
  const clientItems: ComboboxItem[] = [...clients]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      value: c._id,
      label: c.name,
      sublabel: c.addresses?.[0]?.city || undefined,
    }));

  const activeType = filters.type;
  const activeOutcome = filters.outcome;
  const activeAgent = filters.salesAgentId;
  const activePending = filters.pendingNextAction === "true";
  const activeClient = filters.clientId;

  const hasFilters =
    !!filters.q ||
    !!activeType ||
    !!activeOutcome ||
    !!activeAgent ||
    activePending ||
    !!activeClient;

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader
        title="Actividades"
        description="Registro de visitas, llamadas, emails, reuniones y notas comerciales."
        actions={
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-[#3B1E8A] text-white shadow-xs hover:bg-[#2D1666]"
          >
            <Plus className="size-4" />
            Nueva actividad
          </Button>
        }
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
                placeholder="Buscar por asunto o descripción"
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
            <div className="w-full lg:w-44">
              <SearchableCombobox
                value={activeType ?? ""}
                onChange={(v) => setParam("type", v || null)}
                items={typeItems}
                placeholder="Tipo…"
                clearLabel="Todos los tipos"
                emptyLabel="Sin tipos"
              />
            </div>
            <div className="w-full lg:w-44">
              <SearchableCombobox
                value={activeOutcome ?? ""}
                onChange={(v) => setParam("outcome", v || null)}
                items={outcomeItems}
                placeholder="Resultado…"
                clearLabel="Todos los resultados"
                emptyLabel="Sin resultados"
              />
            </div>
            <div className="w-full lg:w-52">
              <SearchableCombobox
                value={activeAgent ?? ""}
                onChange={(v) => setParam("salesAgentId", v || null)}
                items={agentItems}
                placeholder="Comercial…"
                clearLabel="Todos los comerciales"
                emptyLabel="Sin comerciales"
              />
            </div>
            <div className="w-full lg:w-64">
              <SearchableCombobox
                value={activeClient ?? ""}
                onChange={(v) => setParam("clientId", v || null)}
                items={clientItems}
                placeholder="Cliente…"
                clearLabel="Todos los clientes"
                emptyLabel="Sin clientes"
              />
            </div>
            <label
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-[12px] font-semibold transition-colors",
                activePending
                  ? "border-[#3B1E8A] bg-[#3B1E8A] text-white"
                  : "border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-50"
              )}
            >
              <input
                type="checkbox"
                checked={activePending}
                onChange={(e) =>
                  setParam("pendingNextAction", e.target.checked ? "true" : null)
                }
                className="size-3.5 accent-[#3B1E8A]"
              />
              Próximas acciones
            </label>
            {hasFilters && (
              <Link
                href="/admin/activities"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200/80 bg-white px-3 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <X className="size-3.5" />
                Limpiar
              </Link>
            )}
          </div>
        }
      />

      <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 text-[12px] text-zinc-500">
        <span>
          {result.total === 0
            ? "No hay actividades"
            : `${result.total} ${result.total === 1 ? "actividad" : "actividades"}`}
        </span>
        {hasFilters && (
          <span className="inline-flex items-center gap-1.5 text-zinc-400">
            <span className="size-1.5 rounded-full bg-[#3B1E8A]" />
            Filtrado
          </span>
        )}
      </div>

      <ActivityTimeline
        activities={result.items}
        salesAgentsById={salesAgentsById}
        showClient
        clientNameById={clientNameById}
        onChange={() => router.refresh()}
      />

      {result.totalPages > 1 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          onPageChange={(p) => setParam("page", p === 1 ? null : String(p))}
        />
      )}

      <ActivityForm
        open={open}
        onOpenChange={setOpen}
        clients={clients}
        salesAgents={salesAgents}
      />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white px-5 py-3.5 text-[12px] text-zinc-500">
      <span>
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
                className={cn(
                  "min-w-8 rounded-md px-2 py-1.5 text-[13px] font-medium tabular-nums transition-colors",
                  p === page
                    ? "bg-[#3B1E8A] text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                )}
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
  );
}
