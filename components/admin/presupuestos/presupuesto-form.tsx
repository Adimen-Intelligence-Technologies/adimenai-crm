"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPresupuestoSchema, calculateItemTotal, businessLinePrefix, businessLineLabels } from "@/lib/schemas/presupuesto";
import type { Client } from "@/lib/repositories/clients";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import { cn } from "@/lib/utils";

type LineItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type Props = {
  mode: "create" | "edit";
  initial?: Presupuesto & { _id: string };
  defaultClientId?: string;
  defaultSalesAgentId?: string;
  defaultSourceActivityId?: string;
  fixedBusinessLine?: "adimenai" | "herrikonekt" | "hiopos";
};

type ClientOption = Pick<Client, "_id" | "name" | "email" | "phones" | "addresses" | "billing"> & {
  businessLine: string;
};

export function PresupuestoForm({
  mode,
  initial,
  defaultClientId,
  defaultSalesAgentId,
  defaultSourceActivityId,
  fixedBusinessLine,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [businessLine, setBusinessLine] = useState<string>(
    initial?.businessLine ?? fixedBusinessLine ?? "adimenai"
  );
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<ClientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(
    initial
      ? {
          _id: initial.clientId,
          name: initial.clientSnapshot.name,
          email: initial.clientSnapshot.email ?? "",
          phones: initial.clientSnapshot.phone ? [initial.clientSnapshot.phone] : [],
          addresses: initial.clientSnapshot.address
            ? [{ line1: initial.clientSnapshot.address, city: "", isPrimary: true }]
            : [],
          billing: undefined,
          businessLine: initial.businessLine,
        }
      : null
  );
  const [introduction, setIntroduction] = useState(initial?.introduction ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initial?.items.map((i) => ({ ...i })) ?? [
      { title: "", quantity: 1, unitPrice: 0, total: 0 },
    ]
  );
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? 21);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // Preseleccionar cliente cuando viene desde la ficha o desde una visita
  const sourceActivityId = initial?.sourceActivityId ?? defaultSourceActivityId ?? "";

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  async function searchClients(q: string) {
    setClientQuery(q);
    if (!q.trim()) {
      setClientResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/clients?businessLine=${businessLine}&q=${encodeURIComponent(q)}&pageSize=10`);
      if (res.ok) {
        const data = await res.json();
        setClientResults(data.items ?? []);
      }
    } catch {
      // ignore
    }
    setSearching(false);
  }

  function selectClient(client: ClientOption) {
    setSelectedClient(client);
    setClientQuery("");
    setClientResults([]);
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...patch };
        updated.total = calculateItemTotal(updated);
        return updated;
      });
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { title: "", quantity: 1, unitPrice: 0, total: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // Cargar cliente preseleccionado cuando viene desde ficha/visita
  useEffect(() => {
    if (initial || !defaultClientId) return;
    if (selectedClient) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/clients/${defaultClientId}`);
        if (!res.ok) return;
        const c = (await res.json()) as Client;
        if (cancelled) return;
        setSelectedClient({
          _id: c._id,
          name: c.name,
          email: c.email ?? "",
          phones: c.phones ?? [],
          addresses: c.addresses ?? [],
          billing: c.billing,
          businessLine: c.businessLine,
        });
        setBusinessLine(c.businessLine);
      } catch {
        // noop
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultClientId]);

  async function handleSubmit() {
    setError(null);

    if (!selectedClient) {
      setError("Selecciona un cliente");
      return;
    }
    if (items.length === 0 || items.every((i) => !i.title.trim())) {
      setError("Añade al menos una línea de pedido");
      return;
    }
    if (items.some((i) => !i.title.trim())) {
      setError("Todas las líneas deben tener un título");
      return;
    }

    const primaryAddr = selectedClient.addresses?.find((a) => a.isPrimary) ?? selectedClient.addresses?.[0];
    const addressStr = primaryAddr
      ? `${primaryAddr.line1}${primaryAddr.line2 ? `, ${primaryAddr.line2}` : ""}${primaryAddr.city ? `, ${primaryAddr.city}` : ""}`
      : "";

    const payload = {
      businessLine: businessLine as "adimenai" | "herrikonekt" | "hiopos",
      clientId: selectedClient._id,
      clientSnapshot: {
        name: selectedClient.name,
        nif: selectedClient.billing?.taxId ?? "",
        address: addressStr,
        email: selectedClient.email ?? "",
        phone: selectedClient.phones?.[0] ?? "",
      },
      introduction,
      items: items.map((i) => ({
        title: i.title.trim(),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total,
      })),
      taxRate,
      notes,
      sourceActivityId: sourceActivityId || "",
      salesAgentId: initial?.salesAgentId ?? defaultSalesAgentId ?? "",
    };

    const parsed = createPresupuestoSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(issue ? `${issue.path.join(".")}: ${issue.message}` : "Datos inválidos");
      return;
    }

    startTransition(async () => {
      try {
        const url = mode === "create" ? "/api/presupuestos" : `/api/presupuestos/${initial!._id}`;
        const method = mode === "create" ? "POST" : "PATCH";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "No se pudo guardar el presupuesto");
        }
        router.push("/admin/presupuestos");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          aria-label="Volver"
          className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Link href="/admin/presupuestos">
            <ChevronLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "Nuevo presupuesto" : "Editar presupuesto"}
          </h1>
          <p className="text-sm text-zinc-500">
            {businessLineLabels[businessLine as keyof typeof businessLineLabels] ?? businessLine}
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {mode === "create" && sourceActivityId && (
        <div className="flex items-center gap-2 rounded-md border border-[#3B1E8A]/20 bg-[#3B1E8A]/5 px-4 py-2.5 text-[12px] text-[#3B1E8A]">
          <Link2 className="size-3.5 shrink-0" />
          <span>
            Este presupuesto quedará vinculado a la visita desde la que lo
            estás creando.
          </span>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-5">
          {/* Linea de negocio */}
          <Field label="Línea de negocio">
            {fixedBusinessLine ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 items-center gap-2 rounded-md border border-[#3B1E8A] bg-[#3B1E8A] px-3 text-sm font-medium text-white">
                  {businessLinePrefix[fixedBusinessLine]} ·{" "}
                  {businessLineLabels[fixedBusinessLine]}
                </span>
                <span className="text-[12px] text-zinc-500">
                  Línea fijada al crear el presupuesto.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(["adimenai", "herrikonekt", "hiopos"] as const).map((line) => {
                  const prefix = businessLinePrefix[line];
                  return (
                    <button
                      key={line}
                      type="button"
                      onClick={() => {
                        setBusinessLine(line);
                        setSelectedClient(null);
                      }}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                        businessLine === line
                          ? "border-[#3B1E8A] bg-[#3B1E8A] text-white"
                          : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      {prefix} · {businessLineLabels[line]}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          {/* Cliente */}
          <Field label="Cliente" required>
            {selectedClient ? (
              <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{selectedClient.name}</p>
                  <p className="text-xs text-zinc-500">
                    {selectedClient.billing?.taxId ? `NIF: ${selectedClient.billing.taxId}` : ""}
                    {selectedClient.email ? ` · ${selectedClient.email}` : ""}
                    {selectedClient.phones?.[0] ? ` · ${selectedClient.phones[0]}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedClient(null)}
                  className="text-zinc-400 hover:text-rose-600"
                >
                  <X />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  value={clientQuery}
                  onChange={(e) => searchClients(e.target.value)}
                  placeholder="Buscar cliente por nombre…"
                />
                {clientResults.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg">
                    {clientResults.map((c) => (
                      <li key={c._id}>
                        <button
                          type="button"
                          onClick={() => selectClient(c)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                        >
                          <span className="font-medium text-zinc-900">{c.name}</span>
                          <span className="ml-2 text-xs text-zinc-500">
                            {c.billing?.taxId ? c.billing.taxId : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {searching && (
                  <p className="mt-1 text-xs text-zinc-400">Buscando…</p>
                )}
              </div>
            )}
          </Field>

          {/* Introduccion */}
          <Field label="Introducción">
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Texto de introducción para el presupuesto (opcional)"
              rows={3}
              className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
                "placeholder:text-zinc-400",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            />
          </Field>

          {/* Lineas de pedido */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">Líneas de pedido</h3>
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="text-[#3B1E8A] hover:bg-[#3B1E8A]/10">
                <Plus /> Añadir línea
              </Button>
            </div>
            <div className="overflow-x-auto rounded-md border border-zinc-200">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500">
                    <th className="py-2 pr-2">Título</th>
                    <th className="w-20 px-2 py-2">Cant.</th>
                    <th className="w-28 px-2 py-2">Precio ud.</th>
                    <th className="w-28 px-2 py-2 text-right">Total</th>
                    <th className="w-10 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-zinc-100">
                      <td className="py-1 pr-2">
                        <Input
                          value={item.title}
                          onChange={(e) => updateItem(i, { title: e.target.value })}
                          placeholder="Ej. Página web"
                          className="h-8"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="h-8 text-center"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(i, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="h-8 text-right"
                        />
                      </td>
                      <td className="px-2 py-1 text-right font-mono text-sm text-zinc-900">
                        {item.total.toFixed(2).replace(".", ",")} €
                      </td>
                      <td className="py-1">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeItem(i)}
                            className="text-zinc-400 hover:text-rose-600"
                          >
                            <X />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="ml-auto w-full max-w-xs space-y-1 border-t border-zinc-200 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-mono text-zinc-900">{subtotal.toFixed(2).replace(".", ",")} €</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-zinc-600">IVA</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="h-7 w-16 text-right"
                />
                <span className="text-zinc-500">%</span>
                <span className="font-mono text-zinc-900">{taxAmount.toFixed(2).replace(".", ",")} €</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-1 text-sm font-semibold">
              <span className="text-zinc-900">Total</span>
              <span className="font-mono text-zinc-900">{total.toFixed(2).replace(".", ",")} €</span>
            </div>
          </div>

          {/* Notas */}
          <Field label="Notas">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. (*) Precios sin IVA. Se aplicará el tipo impositivo vigente…"
              rows={2}
              className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
                "placeholder:text-zinc-400",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            />
          </Field>
        </div>
      </div>

      <footer className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <Button asChild variant="outline">
          <Link href="/admin/presupuestos">Cancelar</Link>
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-[#3B1E8A] text-white hover:bg-[#2D1666] disabled:bg-zinc-200 disabled:text-zinc-500"
        >
          {isPending ? "Guardando…" : mode === "create" ? "Crear presupuesto" : "Guardar cambios"}
        </Button>
      </footer>
    </div>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-semibold text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
