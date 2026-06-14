"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableCombobox, type ComboboxItem } from "@/components/ui/searchable-combobox";
import { activityTypeEnum, activityTypeLabels } from "@/lib/schemas/activity";
import { visitPlanStatusLabels, type VisitPlanStatus } from "@/lib/schemas/visit-plan";
import { cn } from "@/lib/utils";
import {
  LoaderCircle, User, Calendar, MessageSquare, Mail, NotebookPen, Phone,
  type LucideIcon,
} from "lucide-react";
import type { VisitPlan } from "@/lib/repositories/visit-plans";
import type { SalesAgent } from "@/lib/repositories/sales-agents";
import type { Client } from "@/lib/repositories/clients";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: VisitPlan | null;
  readOnly?: boolean;
  clients: ComboboxItem[];
  allClients: Client[];
  salesAgents: SalesAgent[];
  onSaved: () => void;
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  visit: <User className="size-4" />,
  call: <Phone className="size-4" />,
  email: <Mail className="size-4" />,
  meeting: <Calendar className="size-4" />,
  whatsapp: <MessageSquare className="size-4" />,
  note: <NotebookPen className="size-4" />,
};

const typeOptions = activityTypeEnum.options.map((t) => ({
  value: t,
  label: activityTypeLabels[t as keyof typeof activityTypeLabels],
  icon: TYPE_ICONS[t],
}));

const outcomeOptions = [
  { value: "positive", label: "Positivo", color: "bg-emerald-500" },
  { value: "neutral", label: "Neutro", color: "bg-zinc-400" },
  { value: "negative", label: "Negativo", color: "bg-rose-500" },
  { value: "pending", label: "Pendiente", color: "bg-amber-500" },
] as const;

const nextActionTypes = [
  { value: "callback", label: "Volver a llamar" },
  { value: "send_quote", label: "Enviar presupuesto" },
  { value: "send_info", label: "Enviar información" },
  { value: "meeting", label: "Agendar reunión" },
  { value: "follow_up", label: "Hacer seguimiento" },
  { value: "other", label: "Otra" },
] as const;

export function VisitPlanDialog({ open, onOpenChange, plan, readOnly, clients, allClients, salesAgents, onSaved }: Props) {
  const isEdit = !!plan;
  const isView = readOnly && isEdit;

  const [clientId, setClientId] = useState(plan?.clientId ?? "");
  const [salesAgentId, setSalesAgentId] = useState(plan?.salesAgentId ?? "");
  const [date, setDate] = useState(plan?.date ?? "");
  const [contactName, setContactName] = useState(plan?.contactName ?? "");
  const [address, setAddress] = useState(plan?.address ?? "");
  const [type, setType] = useState(plan?.type ?? "visit");
  const [status, setStatus] = useState<VisitPlanStatus>(plan?.status ?? "programada");
  const [observations, setObservations] = useState(plan?.observations ?? "");

  // Activity-specific fields (synced to linked activity)
  const [outcome, setOutcome] = useState<string>("pending");
  const [requestQuote, setRequestQuote] = useState(false);
  const [requestedBusinessLines, setRequestedBusinessLines] = useState<string[]>(["adimenai", "herrikonekt", "hiopos"]);
  const [hasNextAction, setHasNextAction] = useState(false);
  const [nextActionType, setNextActionType] = useState("callback");
  const [nextActionDueDate, setNextActionDueDate] = useState("");
  const [nextActionNotes, setNextActionNotes] = useState("");

  const [loadingActivity, setLoadingActivity] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetKey = open ? (plan?._id ?? "open") : "closed";

  // Fetch linked activity data when dialog opens for editing
  useEffect(() => {
    if (open && plan?.activityId) {
      setLoadingActivity(true);
      fetch(`/api/activities/${plan.activityId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data) {
            setOutcome(data.outcome ?? "pending");
            setRequestQuote(data.requestQuote ?? false);
            setRequestedBusinessLines((data.requestedBusinessLines as string[]) ?? []);
            setHasNextAction(!!data.nextAction);
            setNextActionType(data.nextAction?.type ?? "callback");
            setNextActionDueDate(data.nextAction?.dueDate ?? "");
            setNextActionNotes(data.nextAction?.notes ?? "");
          }
        })
        .catch(() => {})
        .finally(() => setLoadingActivity(false));
    } else if (open && !plan) {
      // Reset for create
      setOutcome("pending");
      setRequestQuote(false);
      setRequestedBusinessLines(["adimenai", "herrikonekt", "hiopos"]);
      setHasNextAction(false);
      setNextActionType("callback");
      setNextActionDueDate("");
      setNextActionNotes("");
    }
  }, [open, plan?._id, plan?.activityId]);

  function handleClientChange(id: string) {
    setClientId(id);
    if (!isEdit && id && !address) {
      const c = allClients.find((cl) => cl._id === id);
      if (c?.addresses?.[0]) {
        const a = c.addresses[0];
        setAddress(`${a.line1}, ${a.city}`);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !salesAgentId) return;
    setSaving(true);

    try {
      const url = isEdit ? `/api/visit-plans/${plan!._id}` : "/api/visit-plans";
      const method = isEdit ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        clientId,
        salesAgentId,
        date,
        contactName,
        address,
        type,
        status,
        observations,
        // Activity fields to sync
        outcome,
        requestQuote,
        requestedBusinessLines: requestQuote ? requestedBusinessLines : [],
      };
      if (hasNextAction) {
        body.nextAction = {
          type: nextActionType,
          dueDate: nextActionDueDate,
          notes: nextActionNotes,
          done: false,
        };
      } else {
        body.nextAction = null;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al guardar");
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        key={resetKey}
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-zinc-200 p-5">
            <SheetTitle className="text-lg">
              {isView ? "Visita programada" : isEdit ? "Editar visita" : "Nueva visita"}
            </SheetTitle>
            <p className="text-sm text-zinc-500">
              {isView ? "Detalle de la visita programada" : isEdit ? "Modifica los datos de la visita programada" : "Registra una nueva visita en el plan comercial"}
            </p>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-zinc-700">Cliente *</Label>
              <SearchableCombobox
                value={clientId}
                onChange={handleClientChange}
                items={clients}
                placeholder="Seleccionar cliente…"
                clearable={false}
                disabled={isView}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-zinc-700">Comercial *</Label>
              <SearchableCombobox
                value={salesAgentId}
                onChange={setSalesAgentId}
                items={salesAgents.filter(a => a.isActive).map((a) => ({
                  value: a._id,
                  label: a.name,
                  icon: (
                    <span
                      className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: a.color }}
                    >
                      {(a.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  ),
                }))}
                placeholder="Seleccionar comercial…"
                clearable={false}
                disabled={isView}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-zinc-700">Dirección</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección del comercio"
                className="h-9 text-xs"
                disabled={isView}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-zinc-700">Fecha y hora *</Label>
                <Input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-9 text-xs"
                  disabled={isView}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-zinc-700">Nombre de contacto</Label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nombre de la persona"
                  className="h-9 text-xs"
                  disabled={isView}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-zinc-700">Tipo</Label>
              <div className="flex flex-wrap gap-1">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => !isView && setType(opt.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                      type === opt.value
                        ? "border-[#3B1E8A] bg-[#3B1E8A]/10 text-[#3B1E8A] font-medium"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                      isView && "pointer-events-none opacity-70"
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-zinc-700">Estado</Label>
              <div className="flex flex-wrap gap-1">
                {(["programada", "confirmada", "realizada", "no_disponible", "reprogramar"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => !isView && setStatus(s)}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                      status === s
                        ? "border-[#3B1E8A] bg-[#3B1E8A]/10 text-[#3B1E8A] font-medium"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                      isView && "pointer-events-none opacity-70"
                    )}
                  >
                    {visitPlanStatusLabels[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-zinc-700">Observaciones</Label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Notas adicionales sobre la visita…"
                rows={3}
                disabled={isView}
                className="w-full resize-none rounded-md border border-zinc-200/80 bg-white px-3 py-2 text-xs outline-none placeholder:text-zinc-400 focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200 disabled:cursor-default disabled:opacity-60"
              />
            </div>

            {!isView && (
              <>
                {/* Outcome */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-zinc-700">Resultado</Label>
                  <div className="flex flex-wrap gap-1">
                    {outcomeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setOutcome(opt.value)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                          outcome === opt.value
                            ? "border-[#3B1E8A] bg-[#3B1E8A]/10 text-[#3B1E8A] font-medium"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <span className={cn("size-2 rounded-full", opt.color)} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Request Quote */}
                <div
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    requestQuote
                      ? "border-[#3B1E8A]/30 bg-[#3B1E8A]/5"
                      : "border-zinc-200 bg-zinc-50/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn("text-sm font-semibold", requestQuote ? "text-[#3B1E8A]" : "text-zinc-900")}>
                        Generar presupuesto
                      </p>
                      <p className="text-[12px] text-zinc-500">
                        Marca si esta visita requiere preparar un presupuesto
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={requestQuote}
                      onClick={() => setRequestQuote(!requestQuote)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
                        requestQuote ? "bg-[#3B1E8A]" : "bg-zinc-300"
                      )}
                    >
                      <span
                        className={cn(
                          "size-4 rounded-full bg-white shadow-sm transition-transform",
                          requestQuote ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                  {requestQuote && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-[#3B1E8A]/10 pt-3">
                      {["adimenai", "herrikonekt", "hiopos"].map((line) => {
                        const active = requestedBusinessLines.includes(line);
                        return (
                          <button
                            key={line}
                            type="button"
                            onClick={() =>
                              setRequestedBusinessLines((prev) =>
                                active ? prev.filter((l) => l !== line) : [...prev, line]
                              )
                            }
                            className={cn(
                              "rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                              active
                                ? "bg-[#3B1E8A] text-white"
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                            )}
                          >
                            {line === "adimenai" ? "AdimenAi" : line === "herrikonekt" ? "Herrikonekt" : "Hiopos"}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Next Action */}
                <div className="rounded-lg border border-zinc-200 bg-zinc-50/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">
                        Programar siguiente acción
                      </p>
                      <p className="text-[12px] text-zinc-500">
                        Para no olvidar el próximo paso con este cliente
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hasNextAction}
                      onClick={() => setHasNextAction(!hasNextAction)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
                        hasNextAction ? "bg-emerald-500" : "bg-zinc-300"
                      )}
                    >
                      <span
                        className={cn(
                          "size-4 rounded-full bg-white shadow-sm transition-transform",
                          hasNextAction ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                  {hasNextAction && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-medium text-zinc-700">Tipo</Label>
                        <select
                          value={nextActionType}
                          onChange={(e) => setNextActionType(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-zinc-200/80 bg-white px-3 text-xs outline-none focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200"
                        >
                          {nextActionTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-medium text-zinc-700">Fecha</Label>
                        <Input
                          type="date"
                          value={nextActionDueDate}
                          onChange={(e) => setNextActionDueDate(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs font-medium text-zinc-700">Notas</Label>
                          <Input
                            value={nextActionNotes}
                            onChange={(e) => setNextActionNotes(e.target.value)}
                            placeholder="Ej. Llamar el lunes a las 11:00"
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <SheetFooter className="border-t border-zinc-200 p-4">
            {isView ? (
              <Button type="button" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !clientId || !salesAgentId}
                  className="bg-[#3B1E8A] hover:bg-[#2D1666] text-white"
                >
                  {saving && <LoaderCircle className="size-3.5 animate-spin" />}
                  {isEdit ? "Guardar cambios" : "Crear visita"}
                </Button>
              </>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
