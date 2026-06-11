"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { businessLineLabels } from "@/lib/schemas/presupuesto";
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
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader

        title="Presupuestos"
        actions={
          <Button
            asChild
            className="bg-[#3B1E8A] text-white shadow-xs hover:bg-[#2D1666]"
          >
            <Link href="/admin/presupuestos/nuevo">
              <Plus className="size-4" />
              Nuevo presupuesto
            </Link>
          </Button>
        }
      />

      <div className="flex">
        <nav
          className="inline-flex w-fit items-center gap-0.5 rounded-md border border-zinc-200/80 bg-white p-0.5"
          aria-label="Filtrar por línea de negocio"
        >
          {lines.map(({ value, label }) => {
            const isActive = activeLine === value;
            return (
              <button
                key={value}
                onClick={() => setLine(value)}
                className={cn(
                  "rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-[#3B1E8A] text-white"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>
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
