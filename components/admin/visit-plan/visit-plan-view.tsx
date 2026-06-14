"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  Eye,
  Mail,
  MessageSquare,
  NotebookPen,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { activityTypeEnum, activityTypeLabels } from "@/lib/schemas/activity";
import {
  visitPlanStatusColors,
  visitPlanStatusDots,
  visitPlanStatusLabels,
  type VisitPlanStatus,
} from "@/lib/schemas/visit-plan";
import { SearchableCombobox, type ComboboxItem } from "@/components/ui/searchable-combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/page-header";
import { VisitPlanDialog } from "./visit-plan-dialog";
import type { VisitPlan } from "@/lib/repositories/visit-plans";
import type { Client } from "@/lib/repositories/clients";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

type Props = {
  plans: VisitPlan[];
  clients: Client[];
  clientNameMap: Record<string, string>;
  salesAgents: SalesAgent[];
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  visit: User,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  whatsapp: MessageSquare,
  note: NotebookPen,
};

const statusOptions: { label: string; value: VisitPlanStatus }[] = [
  { label: "Programada", value: "programada" },
  { label: "Confirmada", value: "confirmada" },
  { label: "Realizada", value: "realizada" },
  { label: "No disponible", value: "no_disponible" },
  { label: "Reprogramar", value: "reprogramar" },
];

export function VisitPlanView({ plans, clients, clientNameMap, salesAgents }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogReadOnly, setDialogReadOnly] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VisitPlan | null>(null);
  const [statusDialogPlan, setStatusDialogPlan] = useState<VisitPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filters = {
    q: searchParams.get("q") ?? "",
    status: searchParams.get("status") ?? "",
    type: searchParams.get("type") ?? "",
    salesAgentId: searchParams.get("salesAgentId") ?? "",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
  };

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`/admin/visit-plan?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.replace("/admin/visit-plan");
  }, [router]);

  const clientItems: ComboboxItem[] = clients.map((c) => ({
    value: c._id,
    label: c.name,
    sublabel: c.addresses?.[0]?.city ?? "",
  }));

  const hasFilters = Object.values(filters).some((v) => v !== "");

  const filtered = plans.filter((p) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const name = (clientNameMap[p.clientId] ?? "").toLowerCase();
      const contact = p.contactName.toLowerCase();
      const addr = p.address.toLowerCase();
      const obs = p.observations.toLowerCase();
      if (
        !name.includes(q) &&
        !contact.includes(q) &&
        !addr.includes(q) &&
        !obs.includes(q)
      )
        return false;
    }
    if (filters.status && p.status !== filters.status) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.salesAgentId && p.salesAgentId !== filters.salesAgentId) return false;
    if (filters.dateFrom && p.date < filters.dateFrom) return false;
    if (filters.dateTo && p.date > filters.dateTo + "T23:59:59") return false;
    return true;
  });

  async function handleQuickStatus(plan: VisitPlan, newStatus: VisitPlanStatus) {
    try {
      const res = await fetch(`/api/visit-plans/${plan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error");
      setStatusDialogPlan(null);
      router.refresh();
    } catch {
      console.error("Error al cambiar estado");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/visit-plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      setDeleteConfirm(null);
      router.refresh();
    } catch {
      console.error("Error al eliminar");
    }
  }

  function openView(plan: VisitPlan) {
    setEditingPlan(plan);
    setDialogReadOnly(true);
    setDialogOpen(true);
  }

  function openEdit(plan: VisitPlan) {
    setEditingPlan(plan);
    setDialogReadOnly(false);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditingPlan(null);
    setDialogReadOnly(false);
    setDialogOpen(true);
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <PageHeader
        title="Plan visitas comerciales"
        description="Registra y organiza las visitas programadas"
        actions={
          <Button onClick={openCreate} className="bg-[#3B1E8A] hover:bg-[#2D1666] text-white">
            <Plus className="size-4" />
            Nueva visita
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Buscar cliente, contacto..."
            defaultValue={filters.q}
            onChange={(e) => setParam("q", e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
        <SearchableCombobox
          value={filters.type}
          onChange={(v) => setParam("type", v)}
          items={activityTypeEnum.options.map((t) => ({
            value: t,
            label: activityTypeLabels[t as keyof typeof activityTypeLabels],
          }))}
          placeholder="Tipo"
          clearLabel="Todos"
          className="w-36"
        />
        <SearchableCombobox
          value={filters.status}
          onChange={(v) => setParam("status", v)}
          items={statusOptions.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          placeholder="Estado"
          clearLabel="Todos"
          className="w-40"
        />
        <div className="relative w-40">
          <Input
            type="date"
            defaultValue={filters.dateFrom}
            onChange={(e) => setParam("dateFrom", e.target.value)}
            className="h-9 text-xs"
          />
        </div>
        <span className="text-xs text-zinc-400">—</span>
        <div className="relative w-40">
          <Input
            type="date"
            defaultValue={filters.dateTo}
            onChange={(e) => setParam("dateTo", e.target.value)}
            className="h-9 text-xs"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-zinc-500">
            Limpiar filtros
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 py-16 text-center">
          <Calendar className="size-8 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500">Sin visitas planificadas</p>
          <p className="text-xs text-zinc-400">
            {hasFilters ? "Prueba a limpiar los filtros" : "Crea la primera visita programada"}
          </p>
          {hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearAll} className="mt-2 text-xs">
              Limpiar filtros
            </Button>
          ) : (
            <Button size="sm" onClick={openCreate} className="mt-2 bg-[#3B1E8A] hover:bg-[#2D1666] text-white text-xs">
              <Plus className="size-3.5" />
              Nueva visita
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-3 py-2.5">Fecha</th>
                <th className="px-3 py-2.5">Cliente</th>
                <th className="px-3 py-2.5">Contacto</th>
                <th className="px-3 py-2.5">Dirección</th>
                <th className="px-3 py-2.5">Tipo</th>
                <th className="px-3 py-2.5">Estado</th>
                <th className="px-3 py-2.5">Observaciones</th>
                <th className="px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((plan) => {
                const TypeIcon = TYPE_ICONS[plan.type] ?? User;
                return (
                  <tr
                    key={plan._id}
                    className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-3 py-2.5 align-top">
                      <span className="text-zinc-900 font-medium whitespace-nowrap">
                        {new Date(plan.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <span className="ml-1.5 text-zinc-400">
                        {new Date(plan.date).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="font-medium text-zinc-900">
                        {clientNameMap[plan.clientId] ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top text-zinc-600">
                      {plan.contactName || "—"}
                    </td>
                    <td className="max-w-[12rem] truncate px-3 py-2.5 align-top text-zinc-600" title={plan.address}>
                      {plan.address || "—"}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <Badge variant="outline" className="gap-1 font-normal text-[11px]">
                        <TypeIcon className="size-3 text-zinc-400" />
                        {activityTypeLabels[plan.type as keyof typeof activityTypeLabels] ?? plan.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <div className="inline-flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            visitPlanStatusColors[plan.status as VisitPlanStatus]
                          )}
                        >
                          <span className={cn("mr-1 size-1.5 rounded-full", visitPlanStatusDots[plan.status as VisitPlanStatus])} />
                          {visitPlanStatusLabels[plan.status as VisitPlanStatus]}
                        </Badge>
                        <button
                          onClick={() => setStatusDialogPlan(plan)}
                          className="rounded p-0.5 text-zinc-300 opacity-0 hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 transition-opacity"
                          title="Cambiar estado"
                        >
                          <ChevronDown className="size-3" />
                        </button>
                      </div>
                    </td>
                    <td className="max-w-[10rem] truncate px-3 py-2.5 align-top text-zinc-500" title={plan.observations}>
                      {plan.observations || "—"}
                    </td>
                    <td className="px-3 py-2.5 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(plan)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-[#3B1E8A] transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(plan)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {plan.activityId && (
                          <a
                            href={`/admin/activities?clientId=${plan.clientId}`}
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-[#3B1E8A] transition-colors"
                            title="Ver actividad"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                        {deleteConfirm === plan._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(plan._id)}
                              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded px-1.5 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-100"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(plan._id)}
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-rose-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <VisitPlanDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingPlan(null);
        }}
        plan={editingPlan}
        readOnly={dialogReadOnly}
        clients={clientItems}
        allClients={clients}
        salesAgents={salesAgents}
        onSaved={() => {
          setDialogOpen(false);
          setEditingPlan(null);
          router.refresh();
        }}
      />

      <Dialog open={!!statusDialogPlan} onOpenChange={(v) => { if (!v) setStatusDialogPlan(null); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">Cambiar estado</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            {statusOptions.map((opt) => {
              const isCurrent = statusDialogPlan?.status === opt.value;
              return (
                <button
                  key={opt.value}
                  disabled={isCurrent}
                  onClick={() => statusDialogPlan && handleQuickStatus(statusDialogPlan, opt.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    isCurrent
                      ? "bg-[#3B1E8A]/10 text-[#3B1E8A] font-medium cursor-default"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <span className={cn("size-2 rounded-full", visitPlanStatusDots[opt.value])} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
