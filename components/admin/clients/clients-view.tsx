"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { businessLineLabels, type BusinessLine } from "@/lib/schemas/client";
import { ClientTable } from "./client-table";
import type { Client } from "@/lib/repositories/clients";

type Filter = "all" | BusinessLine;

const filters: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "adimenai", label: businessLineLabels.adimenai },
  { id: "herrikonekt", label: businessLineLabels.herrikonekt },
  { id: "hiopos", label: businessLineLabels.hiopos },
];

export function ClientsView({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = (searchParams.get("line") ?? "all") as Filter;
  const q = searchParams.get("q") ?? "";

  function setFilter(next: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("line");
    else params.set("line", next);
    router.replace(`/admin/clients?${params.toString()}`);
  }

  function setQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.replace(`/admin/clients?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona los clientes de AdimenAi, Herrikonekt y Hiopos.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]"
        >
          <Link href="/admin/clients/new">
            <Plus />
            Nuevo cliente
          </Link>
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          className="inline-flex w-fit items-center gap-1 rounded-md border border-zinc-200 bg-white p-1"
          aria-label="Filtrar por línea de negocio"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                activeFilter === f.id
                  ? "bg-[#3B1E8A] text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              {f.label}
            </button>
          ))}
        </nav>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            type="search"
            defaultValue={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, ciudad o teléfono"
            className="pl-9"
          />
        </div>
      </div>

      <ClientTable clients={clients} />
    </div>
  );
}
