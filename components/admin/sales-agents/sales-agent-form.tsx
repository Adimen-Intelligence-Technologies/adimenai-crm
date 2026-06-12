"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SALES_AGENT_DEFAULT_COLORS,
  getInitials,
} from "@/lib/schemas/sales-agent";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

type Props = {
  mode: "create" | "edit";
  initial?: SalesAgent;
};

const DRAFT_KEY_PREFIX = "sales-agent-form-draft:";

type Draft = {
  name: string;
  email: string;
  phone: string;
  color: string;
  isActive: boolean;
};

function readDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(`${DRAFT_KEY_PREFIX}new`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (parsed && typeof parsed === "object") return parsed as Draft;
  } catch {
    // noop
  }
  return null;
}

export function SalesAgentForm({ mode, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>(() => {
    if (initial) return initial.name;
    return readDraft()?.name ?? "";
  });
  const [email, setEmail] = useState<string>(() => {
    if (initial) return initial.email;
    return readDraft()?.email ?? "";
  });
  const [phone, setPhone] = useState<string>(() => {
    if (initial) return initial.phone;
    return readDraft()?.phone ?? "";
  });
  const [color, setColor] = useState<string>(() => {
    if (initial) return initial.color;
    return readDraft()?.color ?? SALES_AGENT_DEFAULT_COLORS[0];
  });
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (initial) return initial.isActive;
    const d = readDraft();
    return typeof d?.isActive === "boolean" ? d.isActive : true;
  });

  useEffect(() => {
    if (mode !== "create" || typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      window.localStorage.setItem(
        `${DRAFT_KEY_PREFIX}new`,
        JSON.stringify({ name, email, phone, color, isActive })
      );
    }, 400);
    return () => window.clearTimeout(t);
  }, [mode, name, email, phone, color, isActive]);

  function clearDraft() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`${DRAFT_KEY_PREFIX}new`);
  }

  const canSubmit = name.trim().length > 0;

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
  }, [canSubmit, name, email, phone, color, isActive]);

  async function handleSubmit() {
    setError(null);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      color,
      isActive,
    };

    startTransition(async () => {
      try {
        const url =
          mode === "create"
            ? "/api/sales-agents"
            : `/api/sales-agents/${initial?._id}`;
        const method = mode === "create" ? "POST" : "PATCH";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "No se pudo guardar el comercial");
        }
        clearDraft();
        router.push("/admin/sales-agents");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  const completedRequired = [name.trim()].filter(Boolean).length;
  const totalRequired = 1;
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
            <Link href="/admin/sales-agents">
              <ArrowLeft className="size-3.5" />
              Volver
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            {mode === "create" ? "Nuevo comercial" : "Editar comercial"}
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
          <Section title="Datos del comercial">
            <div className="flex flex-col gap-4">
              <Field label="Nombre" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Andrea Gómez"
                  autoFocus
                  required
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="andrea@adimenai.com"
                  />
                </Field>
                <Field label="Teléfono">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                </Field>
              </div>
              <Field label="Color identificativo">
                <div className="flex flex-wrap items-center gap-2">
                  {SALES_AGENT_DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Color ${c}`}
                      className={cn(
                        "size-8 rounded-full border-2 transition-all",
                        color === c
                          ? "border-zinc-900 scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="ml-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="size-8 cursor-pointer rounded-md border border-zinc-200 bg-white"
                      aria-label="Color personalizado"
                    />
                    <span className="font-mono text-xs text-zinc-500">{color}</span>
                  </div>
                </div>
              </Field>
              <Field label="Estado">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                    isActive ? "bg-emerald-500" : "bg-zinc-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full bg-white shadow-sm transition-transform",
                      isActive ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
                <p className="mt-1 text-[12px] text-zinc-500">
                  {isActive
                    ? "El comercial aparece en selectores y puede recibir actividades."
                    : "El comercial no aparece en selectores ni recibe actividades nuevas."}
                </p>
              </Field>
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Resumen">
            <ul className="divide-y divide-zinc-100">
              <SummaryRow label="Nombre" value={name || "—"} ok={!!name.trim()} />
              <SummaryRow label="Email" value={email || "—"} ok={!!email.trim()} />
              <SummaryRow label="Teléfono" value={phone || "—"} ok={!!phone.trim()} />
              <SummaryRow
                label="Estado"
                value={isActive ? "Activo" : "Inactivo"}
                ok
              />
            </ul>
          </Section>
          <Section title="Vista previa">
            <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-white p-4">
              <span
                className="flex size-12 items-center justify-center rounded-full text-base font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {getInitials(name || "·")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-zinc-950">
                  {name || "Nombre del comercial"}
                </p>
                <p className="truncate text-[12px] text-zinc-500">
                  {email || "sin email"}
                </p>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
          <div className="hidden truncate text-xs text-zinc-900 sm:block">
            <span className="font-semibold">{name || "Sin nombre"}</span>
            {email && <span className="text-zinc-900"> · {email}</span>}
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              asChild
              type="button"
              variant="ghost"
              className="text-zinc-900 hover:bg-zinc-100"
            >
              <Link href="/admin/sales-agents">Cancelar</Link>
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
                  ? "Crear comercial"
                  : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
