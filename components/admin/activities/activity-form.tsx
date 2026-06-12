"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  activityOutcomeEnum,
  activityTypeEnum,
  activityTypeLabels,
  nextActionTypeEnum,
  nextActionTypeLabels,
} from "@/lib/schemas/activity";
import type { Activity } from "@/lib/repositories/activities";
import type { Client } from "@/lib/repositories/clients";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  clientId?: string;
  salesAgents: SalesAgent[];
  defaultSalesAgentId?: string;
  onSaved?: (activity: Activity) => void;
};

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ActivityForm({
  open,
  onOpenChange,
  clients,
  clientId,
  salesAgents,
  defaultSalesAgentId,
  onSaved,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string>(
    clientId ?? ""
  );
  const [salesAgentId, setSalesAgentId] = useState<string>(
    defaultSalesAgentId ?? ""
  );
  const [type, setType] = useState<string>("visit");
  const [occurredAt, setOccurredAt] = useState<string>(todayIso());
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState<string>("positive");
  const [hasNextAction, setHasNextAction] = useState(false);
  const [nextActionType, setNextActionType] = useState<string>("callback");
  const [nextActionDueDate, setNextActionDueDate] = useState<string>("");
  const [nextActionNotes, setNextActionNotes] = useState<string>("");

  const resetKey = open ? "open" : "closed";

  const activeAgents = salesAgents.filter((a) => a.isActive);
  const clientOptions = clients;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedClientId) {
      setError("Selecciona un cliente");
      return;
    }
    if (!subject.trim()) {
      setError("El asunto es obligatorio");
      return;
    }
    const payload: Record<string, unknown> = {
      clientId: selectedClientId,
      salesAgentId,
      type,
      occurredAt: new Date(occurredAt).toISOString(),
      subject: subject.trim(),
      description: description.trim(),
      outcome,
    };
    if (hasNextAction) {
      payload.nextAction = {
        type: nextActionType,
        dueDate: nextActionDueDate,
        notes: nextActionNotes,
        done: false,
      };
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "No se pudo guardar la actividad");
        }
        const activity = (await res.json()) as Activity;
        onSaved?.(activity);
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
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
            <SheetTitle className="text-lg">Registrar actividad</SheetTitle>
            <p className="text-sm text-zinc-500">
              Visita, llamada, email, reunión o nota sobre un cliente.
            </p>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <Field label="Cliente" required>
              <ClientSelect
                value={selectedClientId}
                onChange={setSelectedClientId}
                clients={clientOptions}
                disabled={!!clientId}
              />
            </Field>

            <Field label="Tipo" required>
              <div className="grid grid-cols-3 gap-1.5">
                {activityTypeEnum.options.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-md border px-2 py-2 text-xs font-semibold transition-all",
                      type === t
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "bg-white text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    {activityTypeLabels[t]}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Fecha" required>
                <Input
                  type="date"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  required
                />
              </Field>
              <Field label="Resultado" required>
                <NativeSelect
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                >
                  {activityOutcomeEnum.options.map((o) => (
                    <option key={o} value={o}>
                      {o === "positive"
                        ? "Positivo"
                        : o === "neutral"
                          ? "Neutro"
                          : o === "negative"
                            ? "Negativo"
                            : "Pendiente"}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            <Field label="Asunto" required>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej. Visita comercial — propuesta web"
                required
                autoFocus={!clientId}
              />
            </Field>

            <Field label="Descripción">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Qué se habló, qué pidió el cliente, próximos pasos…"
                rows={4}
              />
            </Field>

            <Field label="Comercial">
              {activeAgents.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No hay comerciales activos.
                </p>
              ) : (
                <NativeSelect
                  value={salesAgentId}
                  onChange={(e) => setSalesAgentId(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {activeAgents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </Field>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">
                    Programar siguiente acción
                  </p>
                  <p className="text-[12px] text-zinc-500">
                    Para no olvidar el próximo paso con este cliente.
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
                  <Field label="Tipo">
                    <NativeSelect
                      value={nextActionType}
                      onChange={(e) => setNextActionType(e.target.value)}
                    >
                      {nextActionTypeEnum.options.map((t) => (
                        <option key={t} value={t}>
                          {nextActionTypeLabels[t]}
                        </option>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field label="Fecha">
                    <Input
                      type="date"
                      value={nextActionDueDate}
                      onChange={(e) => setNextActionDueDate(e.target.value)}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Notas">
                      <Input
                        value={nextActionNotes}
                        onChange={(e) => setNextActionNotes(e.target.value)}
                        placeholder="Ej. Llamar el lunes a las 11:00"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="border-t border-zinc-200 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
            >
              {isPending ? "Guardando…" : "Registrar actividad"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "flex w-full rounded-md border border-zinc-200/80 bg-white px-3 py-2 text-sm shadow-xs outline-none",
        "placeholder:text-zinc-400",
        "focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200",
        props.className
      )}
    />
  );
}

function NativeSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-9 w-full rounded-md border border-zinc-200/80 bg-white px-3 text-sm shadow-xs outline-none",
        "focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200",
        props.className
      )}
    />
  );
}

function ClientSelect({
  value,
  onChange,
  clients,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  clients: Client[];
  disabled?: boolean;
}) {
  return (
    <NativeSelect
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Seleccionar cliente…</option>
      {clients.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </NativeSelect>
  );
}
