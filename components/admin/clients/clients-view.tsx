"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";
import { businessLineLabels, type BusinessLine } from "@/lib/schemas/client";
import { ClientTable } from "./client-table";
import type { PaginatedResult, Client } from "@/lib/repositories/clients";

type Filter = "all" | BusinessLine;

const filters: Array<{ id: Filter; label: string; active: string }> = [
  { id: "all", label: "Todos", active: "bg-[#3B1E8A] text-white" },
  { id: "adimenai", label: businessLineLabels.adimenai, active: "bg-[#6D28D9] text-white" },
  { id: "herrikonekt", label: businessLineLabels.herrikonekt, active: "bg-emerald-600 text-white" },
  { id: "hiopos", label: businessLineLabels.hiopos, active: "bg-red-600 text-white" },
];

export function ClientsView({ result }: { result: PaginatedResult<Client> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = (searchParams.get("line") ?? "all") as Filter;
  const q = searchParams.get("q") ?? "";
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10) || 1;

  function setFilter(next: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("line");
    else params.set("line", next);
    params.delete("page");
    router.replace(`/admin/clients?${params.toString()}`);
  }

  function setQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    params.delete("page");
    router.replace(`/admin/clients?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    router.replace(`/admin/clients?${params.toString()}`);
  }

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader
        title="Contactos"
        search={
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <div className="group relative w-full sm:w-80">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-[#3B1E8A]"
                aria-hidden
              />
              <Input
                type="search"
                defaultValue={q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, ciudad o teléfono"
                className="h-9 pl-9 text-[13px] focus-visible:border-[#3B1E8A] focus-visible:ring-[#3B1E8A]/20"
              />
            </div>
            <nav
              className="inline-flex w-fit items-center gap-0.5 rounded-md border border-zinc-200/80 bg-white p-0.5"
              aria-label="Filtrar por línea de negocio"
            >
              {filters.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
                    isActive
                      ? f.active
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </nav>
            <Button
              asChild
              className="bg-[#3B1E8A] text-white shadow-xs hover:bg-[#2D1666]"
            >
              <Link href="/admin/clients/new">
                <Plus className="size-4" />
                Nuevo cliente
              </Link>
            </Button>
          </div>
        }
      />

      <ClientTable
        clients={result.items}
        page={result.page}
        totalPages={result.totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}
