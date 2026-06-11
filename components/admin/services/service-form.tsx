"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { businessLineTheme } from "@/lib/theme";
import { businessLineLabels, type BusinessLine } from "@/lib/schemas/client";
import {
  serviceBillingEnum,
  serviceBillingLabels,
  serviceBillingShort,
  type Service,
  type ServiceBilling,
} from "@/lib/schemas/service";

type Props = {
  mode: "create" | "edit";
  initial?: Service;
  fixedBusinessLine?: BusinessLine;
};

const DRAFT_KEY_PREFIX = "service-form-draft:";

function eurosInput(raw: string): number {
  if (!raw) return 0;
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

export function ServiceForm({ mode, initial, fixedBusinessLine }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceStr, setPriceStr] = useState(
    initial ? String(initial.price).replace(".", ",") : ""
  );
  const [businessLine, setBusinessLine] = useState<BusinessLine>(
    fixedBusinessLine ?? initial?.businessLine ?? "adimenai"
  );
  const [billing, setBilling] = useState<ServiceBilling>(
    initial?.billing ?? "one_time"
  );

  // Restaurar borrador (solo create sin línea prefijada)
  useEffect(() => {
    if (mode !== "create" || fixedBusinessLine || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}new`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        name: string;
        description: string;
        priceStr: string;
        businessLine: BusinessLine;
        billing: ServiceBilling;
      };
      if (parsed && typeof parsed === "object") {
        setName(parsed.name ?? "");
        setDescription(parsed.description ?? "");
        setPriceStr(parsed.priceStr ?? "");
        setBusinessLine(parsed.businessLine ?? "adimenai");
        setBilling(parsed.billing ?? "one_time");
      }
    } catch {
      // noop
    }
  }, [mode, fixedBusinessLine]);

  useEffect(() => {
    if (mode !== "create" || fixedBusinessLine || typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      window.localStorage.setItem(
        `${DRAFT_KEY_PREFIX}new`,
        JSON.stringify({ name, description, priceStr, businessLine, billing })
      );
    }, 400);
    return () => window.clearTimeout(t);
  }, [mode, fixedBusinessLine, name, description, priceStr, businessLine, billing]);

  function clearDraft() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}new`);
  }

  const canSubmit = name.trim().length > 0 && priceStr.trim().length > 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (canSubmit) handleSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit, name, description, priceStr, businessLine, billing]);

  async function handleSubmit() {
    setError(null);
    const payload = {
      businessLine,
      name: name.trim(),
      description: description.trim(),
      price: eurosInput(priceStr),
      billing,
    };

    startTransition(async () => {
      try {
        const url = mode === "create" ? "/api/services" : `/api/services/${initial?._id}`;
        const method = mode === "create" ? "POST" : "PATCH";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "No se pudo guardar el servicio");
        }
        clearDraft();
        router.push("/admin/gestion-servicios");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  const completedRequired = [name.trim(), priceStr.trim()].filter(Boolean).length;
  const totalRequired = 2;
  const progress = (completedRequired / totalRequired) * 100;

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 h-7 px-2 text-zinc-900 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
          >
            <Link href="/admin/gestion-servicios">
              <ArrowLeft className="size-3.5" />
              Volver
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            {mode === "create" ? "Nuevo servicio" : "Editar servicio"}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-900">
          <span className="font-semibold tabular-nums">
            {completedRequired}/{totalRequired}
          </span>
          <span>obligatorios</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-900">
            ⌘↵ guardar
          </kbd>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Section title="Identidad del servicio">
            <div className="flex flex-col gap-4">
              <Field label="Nombre / titular" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Diseño de landing page"
                  autoFocus
                  required
                />
              </Field>

              <Field label="Descripción" required>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué incluye el servicio, alcance, condiciones, entregables…"
                  rows={5}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Precio sin IVA" required>
                  <div className="relative">
                    <Input
                      inputMode="decimal"
                      value={priceStr}
                      onChange={(e) => setPriceStr(e.target.value)}
                      placeholder="0,00"
                      className="pr-10"
                      required
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-900">
                      €
                    </span>
                  </div>
                </Field>
                <Field label="Facturación">
                  <SelectBilling value={billing} onChange={setBilling} />
                </Field>
              </div>
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Resumen">
            <ul className="divide-y divide-zinc-100">
              <SummaryRow label="Nombre" value={name || "—"} ok={!!name.trim()} />
              <SummaryRow
                label="Descripción"
                value={description ? `${description.length} caracteres` : "—"}
                ok={!!description.trim()}
              />
              <SummaryRow
                label="Precio"
                value={priceStr ? `${priceStr.replace(".", ",")} €` : "—"}
                ok={!!priceStr.trim()}
              />
              <SummaryRow
                label="Facturación"
                value={serviceBillingLabels[billing]}
                ok
              />
              <SummaryRow
                label="Línea"
                value={businessLineLabels[businessLine]}
                ok
              />
            </ul>
          </Section>

          <Section title="Vista previa">
            <div
              className={cn(
                "rounded-lg border p-3 transition-colors",
                businessLine === "adimenai" && "border-violet-200",
                businessLine === "herrikonekt" && "border-emerald-200",
                businessLine === "hiopos" && "border-red-200"
              )}
              style={{
                background: `linear-gradient(135deg, ${businessLineTheme[businessLine].accent}10, transparent)`,
              }}
            >
              <p
                className="text-[11px] font-semibold tracking-wide uppercase"
                style={{ color: businessLineTheme[businessLine].accent }}
              >
                {businessLineLabels[businessLine]}
              </p>
              <p className="mt-1 truncate text-sm font-bold text-zinc-950">
                {name || "Nombre del servicio"}
              </p>
              {description && (
                <p className="mt-1 line-clamp-3 text-[12px] text-zinc-900">
                  {description}
                </p>
              )}
              <p className="mt-2 font-mono text-lg font-bold tabular-nums text-zinc-950">
                {priceStr ? priceStr.replace(".", ",") : "0,00"} <span className="text-sm">€</span>
                <span className="ml-1 font-sans text-[12px] font-normal text-zinc-900">
                  {serviceBillingShort[billing]}
                </span>
              </p>
            </div>
          </Section>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="hidden truncate text-xs text-zinc-900 sm:block">
            <span className="font-semibold">{name || "Sin nombre"}</span>
            {priceStr && (
              <span className="text-zinc-900">
                {" "}
                · {priceStr.replace(".", ",")} € {serviceBillingShort[billing]}
              </span>
            )}
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              asChild
              type="button"
              variant="ghost"
              className="text-zinc-900 hover:bg-zinc-100"
            >
              <Link href="/admin/gestion-servicios">Cancelar</Link>
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !canSubmit}
              className="min-w-32 bg-[#3B1E8A] text-white shadow-sm hover:bg-[#2D1666] disabled:bg-zinc-200 disabled:text-zinc-500"
            >
              {isPending
                ? "Guardando…"
                : mode === "create"
                  ? "Crear servicio"
                  : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4">
      <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-950">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs font-semibold text-zinc-900">
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

function SelectBilling({
  value,
  onChange,
}: {
  value: ServiceBilling;
  onChange: (v: ServiceBilling) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {serviceBillingEnum.options.map((opt) => {
        const isActive = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-md border px-2 py-2 text-xs font-semibold transition-all",
              isActive
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "bg-white text-zinc-900 hover:bg-zinc-50"
            )}
          >
            {opt === "one_time" && "Pago único"}
            {opt === "monthly" && "Mensual"}
            {opt === "yearly" && "Anual"}
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
      <span className="text-xs text-zinc-900">{label}</span>
      <span
        className={cn(
          "flex items-center gap-1 truncate text-right text-xs font-semibold",
          ok ? "text-zinc-950" : "text-zinc-900"
        )}
      >
        {value}
        {ok && <Check className="size-3 shrink-0 text-emerald-500" />}
      </span>
    </li>
  );
}
