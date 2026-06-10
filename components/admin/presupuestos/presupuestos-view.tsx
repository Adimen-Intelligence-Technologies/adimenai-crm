"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessLineLabels } from "@/lib/schemas/presupuesto";
import { businessLineTheme } from "@/lib/theme";
import type { PaginatedResult, Presupuesto } from "@/lib/repositories/presupuestos";
import { cn } from "@/lib/utils";
import { PresupuestoTable } from "./presupuesto-table";

const lines = [
  { value: "", label: "Todos" },
  { value: "adimenai", label: businessLineLabels.adimenai },
  { value: "herrikonekt", label: businessLineLabels.herrikonekt },
  { value: "hiopos", label: businessLineLabels.hiopos },
] as const;

export function PresupuestosView({
  result,
}: {
  result: PaginatedResult<Presupuesto>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeLine = searchParams.get("line") ?? "";

  const onPageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.replace(`/admin/presupuestos?${params.toString()}`);
    },
    [router, searchParams]
  );

  function setLine(line: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (line) {
      params.set("line", line);
    } else {
      params.delete("line");
    }
    params.delete("page");
    router.replace(`/admin/presupuestos?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Presupuestos
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {result.total} presupuestos
          </p>
        </div>
        <Button asChild className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]">
          <Link href="/admin/presupuestos/nuevo">
            <Plus />
            Nuevo presupuesto
          </Link>
        </Button>
      </header>

      <div className="flex gap-1.5">
        {lines.map(({ value, label }) => {
          const isActive = activeLine === value;
          const theme = value ? businessLineTheme[value as keyof typeof businessLineTheme] : null;
          return (
            <button
              key={value}
              onClick={() => setLine(value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? theme
                    ? `${theme.soft} ${theme.icon}`
                    : "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <PresupuestoTable
        presupuestos={result.items}
        page={result.page}
        totalPages={result.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
