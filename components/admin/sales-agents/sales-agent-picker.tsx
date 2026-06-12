"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/schemas/sales-agent";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

type Props = {
  clientId: string;
  currentAgentId: string;
  agents: SalesAgent[];
  size?: "sm" | "md";
  showLabel?: boolean;
  /** Etiqueta cuando no hay comercial asignado */
  emptyLabel?: string;
  /** Si se debe refrescar el router tras el cambio (default true) */
  refreshOnChange?: boolean;
  /** Endpoint al que se hace PATCH; default `/api/clients/{clientId}` */
  endpoint?: string;
  /** Campo a actualizar en el body del PATCH; default `assignedSalesAgentId` */
  fieldName?: string;
  /** Mostrar agentes inactivos (default false) */
  includeInactive?: boolean;
};

export function SalesAgentPicker({
  clientId,
  currentAgentId,
  agents,
  size = "sm",
  showLabel = false,
  emptyLabel = "Sin asignar",
  refreshOnChange = true,
  endpoint,
  fieldName = "assignedSalesAgentId",
  includeInactive = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleAgents = includeInactive
    ? agents
    : agents.filter((a) => a.isActive);

  const selected = visibleAgents.find((a) => a._id === currentAgentId) ?? null;

  const filtered = visibleAgents.filter((a) =>
    query.trim()
      ? a.name.toLowerCase().includes(query.trim().toLowerCase())
      : true
  );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function persist(newId: string | null) {
    setError(null);
    const url = endpoint ?? `/api/clients/${clientId}`;
    const payload: Record<string, unknown> = {
      [fieldName]: newId ?? "",
    };
    startTransition(async () => {
      try {
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "No se pudo guardar");
        }
        if (refreshOnChange) router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  async function selectAgent(agent: SalesAgent | null) {
    setOpen(false);
    setQuery("");
    if (agent && agent._id === currentAgentId) return;
    await persist(agent ? agent._id : null);
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border transition-colors",
          size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm",
          selected
            ? "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300"
            : "border-dashed border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400",
          isPending && "opacity-60"
        )}
        title={selected ? `Comercial: ${selected.name}` : emptyLabel}
      >
        {selected ? (
          <>
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
                size === "sm" ? "size-5 text-[10px]" : "size-6 text-[11px]"
              )}
              style={{ backgroundColor: selected.color }}
            >
              {getInitials(selected.name)}
            </span>
            {showLabel && (
              <span className="font-medium text-zinc-900">{selected.name}</span>
            )}
          </>
        ) : (
          <>
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400",
                size === "sm" ? "size-5" : "size-6"
              )}
            >
              ?
            </span>
            {showLabel && <span>{emptyLabel}</span>}
          </>
        )}
        <ChevronDown
          className={cn(
            "size-3 shrink-0 text-zinc-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-1 w-60 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-200 p-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-400" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar comercial…"
                className="h-7 pl-7 pr-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    setQuery("");
                  }
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    selectAgent(filtered[0]);
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-64 overflow-y-auto p-1">
            <li>
              <button
                type="button"
                onClick={() => selectAgent(null)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
                  !selected
                    ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                    : "text-zinc-700 hover:bg-zinc-50"
                )}
              >
                <span className="flex size-5 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400">
                  ?
                </span>
                <span className="flex-1 truncate font-medium">Sin asignar</span>
                {!selected && (
                  <Check className="size-3 shrink-0 text-[#3B1E8A]" />
                )}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-zinc-500">
                Sin resultados
              </li>
            ) : (
              filtered.map((agent) => {
                const isSelected = agent._id === currentAgentId;
                return (
                  <li key={agent._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectAgent(agent)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                          : "text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span
                        className="flex size-5 shrink-0 items-center justify-center rounded-full font-bold text-white"
                        style={{ backgroundColor: agent.color }}
                      >
                        <span className="text-[10px]">
                          {getInitials(agent.name)}
                        </span>
                      </span>
                      <span className="flex-1 truncate">
                        <span className="font-medium">{agent.name}</span>
                        {!agent.isActive && (
                          <span className="ml-1 text-[10px] text-zinc-400">
                            (inactivo)
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <Check className="size-3 shrink-0 text-[#3B1E8A]" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="absolute right-0 top-full mt-1 z-50 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 shadow-sm whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
