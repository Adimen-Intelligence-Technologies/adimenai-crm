"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Link2, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPresupuestoSchema, calculateItemTotal, businessLineLabels } from "@/lib/schemas/presupuesto";
import type { Client } from "@/lib/repositories/clients";
import type { Presupuesto } from "@/lib/repositories/presupuestos";
import type { Service } from "@/lib/schemas/service";
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
  defaultBusinessLine?: string;
};

type ClientOption = Pick<Client, "_id" | "name" | "email" | "phones" | "addresses" | "billing">;

function formatPrice(n: number): string {
  const f = n.toFixed(2).replace(".", ",");
  const [int, dec] = f.split(",");
  const sep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sep},${dec} €`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ServiceSearchInput({
  value,
  onChange,
  businessLines,
  onServicePick,
}: {
  value: string;
  onChange: (val: string) => void;
  businessLines: string[];
  onServicePick: (service: { name: string; price: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Service[]>([]);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const internalValue = open ? query : value;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const line = businessLines[0] ?? "adimenai";
        const res = await fetch(`/api/services?businessLine=${line}&q=${encodeURIComponent(q)}&pageSize=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items ?? []);
        }
      } catch { /* noop */ }
      setSearching(false);
    }, 250);
  }, [query, open, businessLines]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-300" />
        <input
          value={internalValue}
          onChange={(e) => {
            const v = e.target.value;
            if (!open) setOpen(true);
            if (open) setQuery(v);
            else onChange(v);
          }}
          onFocus={() => { if (!open && value) { setQuery(value); setOpen(true); } }}
          placeholder="Buscar servicio o escribir uno nuevo…"
          className="w-full border-0 bg-transparent py-1 pl-6 text-xs text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </div>
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg">
          {searching && (
            <div className="px-3 py-3 text-center text-xs text-zinc-400">Buscando…</div>
          )}
          {!searching && query.trim() && results.length === 0 && (
            <div>
              <div className="px-3 py-3 text-center text-xs text-zinc-400">
                Sin resultados.
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange(query);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 border-t border-zinc-100 px-3 py-2 text-left text-xs font-medium text-[#3B1E8A] transition-colors hover:bg-zinc-50"
              >
                <Package className="size-3.5 shrink-0 text-[#3B1E8A]" />
                Usar «{query}»
              </button>
            </div>
          )}
          {results.map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => {
                onServicePick({ name: s.name, price: s.price });
                onChange(s.name);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-zinc-50"
            >
              <Package className="size-3.5 shrink-0 text-zinc-400" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-zinc-800 truncate">{s.name}</span>
                <span className="ml-1.5 text-[10px] text-zinc-400">
                  {s.price.toFixed(2).replace(".", ",")} €
                  {s.billing === "monthly" ? " /mes" : s.billing === "yearly" ? " /año" : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PresupuestoForm({
  mode,
  initial,
  defaultClientId,
  defaultSalesAgentId,
  defaultSourceActivityId,
  defaultBusinessLine,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [businessLines, setBusinessLines] = useState<string[]>(
    initial?.businessLines ?? (defaultBusinessLine ? [defaultBusinessLine] : ["adimenai"])
  );
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<ClientOption[]>([]);
  const [searchingClient, setSearchingClient] = useState(false);
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
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const clientDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sourceActivityId = initial?.sourceActivityId ?? defaultSourceActivityId ?? "";
  const presupuestoNumber = initial?.number ?? "A-0000";

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  const searchClients = useCallback((q: string) => {
    setClientQuery(q);
    if (!q.trim()) { setClientResults([]); return; }
    if (clientDebounceRef.current) clearTimeout(clientDebounceRef.current);
    clientDebounceRef.current = setTimeout(async () => {
      setSearchingClient(true);
      try {
        const res = await fetch(`/api/clients?q=${encodeURIComponent(q)}&pageSize=10`);
        if (res.ok) {
          const data = await res.json();
          setClientResults(data.items ?? []);
        }
      } catch { /* noop */ }
      setSearchingClient(false);
    }, 250);
  }, []);

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

  useEffect(() => {
    if (initial || !defaultClientId || selectedClient) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/clients/${defaultClientId}`);
        if (!res.ok) return;
        const c = (await res.json()) as Client;
        if (cancelled) return;
        setSelectedClient({
          _id: c._id, name: c.name, email: c.email ?? "",
          phones: c.phones ?? [], addresses: c.addresses ?? [],
          billing: c.billing,
        });
      } catch { /* noop */ }
    })();
    return () => { cancelled = true; };
  }, [defaultClientId, initial, selectedClient]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setClientResults([]);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleSubmit() {
    setError(null);
    if (!selectedClient) { setError("Selecciona un cliente"); return; }
    if (items.length === 0 || items.every((i) => !i.title.trim())) { setError("Añade al menos una línea de pedido"); return; }
    if (items.some((i) => !i.title.trim())) { setError("Todas las líneas deben tener un título"); return; }

    const primaryAddr = selectedClient.addresses?.find((a) => a.isPrimary) ?? selectedClient.addresses?.[0];
    const addressStr = primaryAddr
      ? `${primaryAddr.line1}${primaryAddr.line2 ? `, ${primaryAddr.line2}` : ""}${primaryAddr.city ? `, ${primaryAddr.city}` : ""}`
      : "";

    const payload = {
      businessLines: businessLines as ("adimenai" | "herrikonekt" | "hiopos")[],
      clientId: selectedClient._id,
      clientSnapshot: {
        name: selectedClient.name,
        nif: selectedClient.billing?.taxId ?? "",
        address: addressStr,
        email: selectedClient.email ?? "",
        phone: selectedClient.phones?.[0] ?? "",
      },
      introduction,
      items: items.map((i) => ({ title: i.title.trim(), quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
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
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "No se pudo guardar el presupuesto");
        }
        if (sourceActivityId) {
          fetch(`/api/activities/${sourceActivityId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quoteInProgress: false }), keepalive: true,
          }).catch(() => {});
        }
        router.push(sourceActivityId ? "/admin/activities" : "/admin/presupuestos");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  const todayFormatted = formatDate(new Date().toISOString());

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Navigation header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
          <Link href="/admin/presupuestos"><ArrowLeft /></Link>
        </Button>
        <div>
          <h1 className="text-base font-semibold text-zinc-900">
            {mode === "create" ? "Nuevo presupuesto" : "Editar presupuesto"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {mode === "create" && sourceActivityId && (
        <div className="flex items-center gap-2 rounded-md border border-[#3B1E8A]/20 bg-[#3B1E8A]/5 px-4 py-2.5 text-xs text-[#3B1E8A]">
          <Link2 className="size-3.5 shrink-0" />
          <span>Este presupuesto quedará vinculado a la visita desde la que lo estás creando.</span>
        </div>
      )}

      {/* Invoice container */}
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {/* ===== HEADER ===== */}
        <div className="relative border-b border-zinc-200 px-10 pb-8 pt-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-xl bg-[#1C1135]">
                <span className="text-2xl font-bold tracking-tight text-white">AI</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Adimen Intelligence Services S.L.</p>
                <p className="mt-0.5 text-xs text-zinc-500">NIF: B88787171</p>
                <p className="text-xs text-zinc-500">Kalea/Lorem Ipsum dolor</p>
                <p className="text-xs text-zinc-500">adimenai.tech@gmail.com | +34 650 60 90 28</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-zinc-900">
                <span className="font-normal text-zinc-500">{presupuestoNumber}</span>
                <span className="mx-1.5 text-zinc-300">|</span>
                <span>PRESUPUESTO</span>
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-400">
                {businessLineLabels[businessLines[0] as keyof typeof businessLineLabels] ?? businessLines[0]}
              </p>
            </div>
          </div>
        </div>

        {/* ===== CLIENT / META ROW ===== */}
        <div className="border-b border-zinc-200 px-10 py-5">
          <div className="flex items-start justify-between gap-8">
            {/* Client */}
            <div className="flex-1 min-w-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-zinc-500">
                Empresa a la que se factura
              </p>
              {selectedClient ? (
                <div className="group relative rounded-md border border-zinc-200 bg-zinc-50/60 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    className="absolute right-1.5 top-1.5 rounded p-0.5 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-200 hover:text-rose-600 group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                  <p className="text-sm font-bold text-zinc-900">{selectedClient.name}</p>
                  {selectedClient.billing?.taxId && (
                    <p className="text-xs text-zinc-500">CIF / NIF: {selectedClient.billing.taxId}</p>
                  )}
                  {selectedClient.addresses?.[0]?.line1 && (
                    <p className="text-xs text-zinc-500">{selectedClient.addresses[0].line1}</p>
                  )}
                  {selectedClient.email && <p className="text-xs text-zinc-500">{selectedClient.email}</p>}
                </div>
              ) : (
                <div ref={clientSearchRef} className="relative">
                  <input
                    value={clientQuery}
                    onChange={(e) => searchClients(e.target.value)}
                    placeholder="Buscar cliente por nombre…"
                    className="w-full rounded-md border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-xs text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#3B1E8A] focus:ring-2 focus:ring-[#3B1E8A]/20"
                  />
                  {searchingClient && <p className="mt-1 text-[10px] text-zinc-400">Buscando…</p>}
                  {clientResults.length > 0 && (
                    <ul className="absolute left-0 right-0 z-10 mt-1 rounded-md border border-zinc-200 bg-white shadow-lg">
                      {clientResults.map((c) => (
                        <li key={c._id}>
                          <button
                            type="button"
                            onClick={() => selectClient(c)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-50"
                          >
                            <span className="font-medium text-zinc-900">{c.name}</span>
                            {c.billing?.taxId && <span className="text-zinc-400">· {c.billing.taxId}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Meta info */}
            <div className="w-48 shrink-0 text-right">
              <table className="ml-auto text-xs">
                <tbody>
                  {[
                    ["NÚMERO DE FACTURA:", presupuestoNumber],
                    ["FECHA DE FACTURA:", todayFormatted],
                    ["FECHA DE PAGO:", todayFormatted],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td className="pr-2 text-zinc-500">{label}</td>
                      <td className="font-medium text-zinc-900">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== INTRODUCTION ===== */}
        {introduction || mode === "create" ? (
          <div className="border-b border-zinc-200 px-10 py-4">
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Texto de introducción (opcional)"
              rows={2}
              className="w-full resize-none border-0 bg-transparent text-xs text-zinc-700 outline-none placeholder:text-zinc-400"
            />
          </div>
        ) : null}

        {/* ===== LINE ITEMS TABLE ===== */}
        <div className="border-b border-zinc-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 text-[10px] font-bold uppercase tracking-[0.05em] text-zinc-500">
                <th className="px-10 py-2.5 pr-2">Descripción</th>
                <th className="w-20 px-2 py-2.5 text-center">Cantidad</th>
                <th className="w-24 px-2 py-2.5 text-right">Precio</th>
                <th className="w-14 px-2 py-2.5 text-center">IVA</th>
                <th className="w-24 px-2 py-2.5 pr-10 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-t border-zinc-100">
                  <td className="px-10 py-1.5 pr-2">
                    <div className="flex items-center gap-1">
                      <ServiceSearchInput
                        value={item.title}
                        onChange={(val) => updateItem(i, { title: val })}
                        businessLines={businessLines}
                        onServicePick={(svc) => updateItem(i, { title: svc.name, unitPrice: svc.price })}
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="shrink-0 rounded p-0.5 text-zinc-300 hover:bg-zinc-100 hover:text-rose-500"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-14 rounded border border-zinc-200 bg-transparent py-1 text-center text-xs text-zinc-900 outline-none focus:border-[#3B1E8A]"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-20 rounded border border-zinc-200 bg-transparent py-1 text-right text-xs text-zinc-900 outline-none focus:border-[#3B1E8A]"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center text-xs text-zinc-500">{taxRate}%</td>
                  <td className="px-2 py-1.5 pr-10 text-right font-mono text-xs font-medium text-zinc-900">
                    {formatPrice(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add line button */}
          <div className="border-t border-dashed border-zinc-200 px-10 py-2">
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#3B1E8A] transition-colors hover:text-[#2D1666]"
            >
              <Plus className="size-3" />
              Añadir línea
            </button>
          </div>
        </div>

        {/* ===== TOTALS ===== */}
        <div className="flex justify-end border-b border-zinc-200 px-10 py-4">
          <div className="w-56 space-y-1">
            <div className="flex justify-between rounded bg-zinc-50 px-4 py-2 text-xs">
              <span className="font-bold uppercase tracking-[0.04em] text-zinc-600">Subtotal</span>
              <span className="font-mono text-zinc-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between rounded bg-zinc-50 px-4 py-2 text-xs">
              <span className="font-bold uppercase tracking-[0.04em] text-zinc-600">
                IVA
                <span className="ml-1 font-normal text-zinc-500">({taxRate}%)</span>
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-12 rounded border border-zinc-200 bg-white py-0.5 text-center text-[10px] text-zinc-500 outline-none focus:border-[#3B1E8A]"
                />
                <span className="font-mono text-[#7252FF]">{formatPrice(taxAmount)}</span>
              </div>
            </div>
            <div className="flex justify-between rounded bg-[#3B1E8A] px-4 py-2.5 text-sm">
              <span className="font-bold uppercase tracking-[0.04em] text-white">Total presupuesto</span>
              <span className="font-mono font-bold text-white">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="border-b border-zinc-200 px-10 py-6">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-zinc-800">
            Instrucciones de pago
          </p>
          <div className="flex justify-between gap-12">
            <div className="space-y-1.5 text-xs text-zinc-600">
              <p className="font-bold text-zinc-800">Adimen Intelligence Services S.L.</p>
              <p><span className="font-bold">Número de cuenta:</span> ES 123 456 789</p>
              <p><span className="font-bold">SWIFT/BIC:</span> NTSBDEB1XXX</p>
              <p><span className="font-bold">Nombre del banco:</span> N26</p>
            </div>
            <div className="space-y-1 text-right text-xs text-zinc-500">
              <p className="font-bold text-zinc-600">Adimen AI</p>
              <p>www.adimenai.com</p>
              <p>adimenai.tech@gmail.com</p>
              <p>+34 650 60 90 28</p>
            </div>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white px-6 py-3 shadow-sm md:left-64 md:px-10">
        <Button asChild variant="outline">
          <Link href="/admin/presupuestos">Cancelar</Link>
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="min-w-40 bg-[#3B1E8A] text-white hover:bg-[#2D1666] disabled:bg-zinc-200 disabled:text-zinc-500"
        >
          {isPending ? "Guardando…" : mode === "create" ? "Crear presupuesto" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
