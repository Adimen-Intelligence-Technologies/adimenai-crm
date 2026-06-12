"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { businessLineTheme } from "@/lib/theme";
import { businessLineLabels } from "@/lib/schemas/client";
import { getInitials } from "@/lib/schemas/sales-agent";
import type { Deal } from "@/lib/repositories/deals";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

export function DealCard({
  deal,
  salesAgent,
}: {
  deal: Deal;
  salesAgent?: SalesAgent;
}) {
  const router = useRouter();
  const theme = businessLineTheme[deal.businessLine];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function move(to: "next" | "prev") {
    setError(null);
    const order: Deal["stage"][] = [
      "prospect",
      "contacted",
      "quoted",
      "accepted",
      "contracted",
      "invoiced",
      "paid",
    ];
    const idx = order.indexOf(deal.stage);
    if (idx === -1) return;
    const newStage =
      to === "next" ? order[idx + 1] : order[idx - 1];
    if (!newStage) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/deals/${deal._id}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "No se pudo mover");
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      }
    });
  }

  const order: Deal["stage"][] = [
    "prospect",
    "contacted",
    "quoted",
    "accepted",
    "contracted",
    "invoiced",
    "paid",
  ];
  const canPrev = order.indexOf(deal.stage) > 0;
  const canNext = order.indexOf(deal.stage) < order.length - 1;

  return (
    <Link
      href={`/admin/deals/${deal._id}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl border bg-white shadow-sm shadow-zinc-900/[0.02] transition-all",
        "hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-900/[0.06]"
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: theme.accent }}
    >
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                theme.badge
              )}
            >
              {businessLineLabels[deal.businessLine]}
            </span>
            <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-zinc-950">
              {deal.title}
            </h3>
          </div>
          {salesAgent && (
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
              style={{ backgroundColor: salesAgent.color }}
              title={salesAgent.name}
            >
              {getInitials(salesAgent.name)}
            </span>
          )}
        </div>

        <p className="mt-1.5 flex items-center gap-1 truncate text-[12px] text-zinc-600">
          <User className="size-3 shrink-0" />
          <span className="truncate">{deal.clientSnapshot.name}</span>
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-zinc-100 pt-2.5">
          <span className="font-mono text-[15px] font-bold tabular-nums text-zinc-950">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: deal.currency || "EUR",
              maximumFractionDigits: 0,
            }).format(deal.estimatedValue)}
          </span>
          {deal.expectedCloseDate && (
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
              <Calendar className="size-3" />
              {new Date(deal.expectedCloseDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>

        {salesAgent && (
          <p className="mt-1 text-[10px] text-zinc-400">{salesAgent.name}</p>
        )}
      </div>

      {error && (
        <p className="border-t border-rose-100 bg-rose-50 px-3.5 py-1 text-[10px] text-rose-600">
          {error}
        </p>
      )}

      {/* Acciones de mover etapa (visibles al hover) */}
      {(canPrev || canNext) && (
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (canPrev) move("prev");
            }}
            disabled={!canPrev || isPending}
            className="inline-flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-semibold text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Atrás
          </button>
          <ChevronRight className="size-3.5 text-zinc-400" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (canNext) move("next");
            }}
            disabled={!canNext || isPending}
            className="inline-flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-semibold text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Avanzar →
          </button>
        </div>
      )}
    </Link>
  );
}
