import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { SalesAgentTable } from "./sales-agent-table";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

export function SalesAgentsView({ agents }: { agents: SalesAgent[] }) {
  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <PageHeader
        title="Comerciales"
        description="Personas que dan seguimiento a los clientes y registran las actividades del pipeline."
        search={
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="group relative w-full lg:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-[#3B1E8A]"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Buscar comercial"
                disabled
                className="h-9 pl-9 text-[13px] focus-visible:border-[#3B1E8A] focus-visible:ring-[#3B1E8A]/20"
              />
            </div>
            <Button
              asChild
              className="w-full bg-[#3B1E8A] text-white shadow-xs hover:bg-[#2D1666] sm:w-auto"
            >
              <Link href="/admin/sales-agents/new">
                <Plus className="size-4" />
                Nuevo comercial
              </Link>
            </Button>
          </div>
        }
      />

      <SalesAgentTable agents={agents} />
    </div>
  );
}
