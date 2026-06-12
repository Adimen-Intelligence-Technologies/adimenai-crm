"use client";

import Link from "next/link";
import { Eye, Pencil, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteSalesAgentButton } from "./delete-sales-agent-button";
import { getInitials } from "@/lib/schemas/sales-agent";
import type { SalesAgent } from "@/lib/repositories/sales-agents";

export function SalesAgentTable({ agents }: { agents: SalesAgent[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.02]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200/80 bg-zinc-50/70">
          <tr>
            <th className="px-5 py-3.5 text-[13px] font-bold tracking-tight text-zinc-700">Nombre</th>
            <th className="hidden px-5 py-3.5 text-[13px] font-bold tracking-tight text-zinc-700 sm:table-cell">Email</th>
            <th className="hidden px-5 py-3.5 text-[13px] font-bold tracking-tight text-zinc-700 md:table-cell">Teléfono</th>
            <th className="px-5 py-3.5 text-[13px] font-bold tracking-tight text-zinc-700">Estado</th>
            <th className="px-5 py-3.5 text-right text-[13px] font-bold tracking-tight text-zinc-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {agents.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-20 text-center text-sm text-zinc-500">
                No hay comerciales para mostrar.
              </td>
            </tr>
          ) : (
            agents.map((agent) => (
              <SalesAgentRow key={agent._id} agent={agent} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SalesAgentRow({ agent }: { agent: SalesAgent }) {
  return (
    <tr className="transition-colors duration-150 hover:bg-zinc-50/70">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ backgroundColor: agent.color }}
            aria-hidden
          >
            {getInitials(agent.name)}
          </span>
          <div className="min-w-0">
            <Link
              href={`/admin/sales-agents/${agent._id}`}
              className="font-semibold text-zinc-900 transition-colors hover:text-[#3B1E8A]"
            >
              {agent.name}
            </Link>
          </div>
        </div>
      </td>
      <td className="hidden px-5 py-3.5 text-zinc-700 sm:table-cell">
        {agent.email || <span className="text-zinc-400">—</span>}
      </td>
      <td className="hidden px-5 py-3.5 text-zinc-700 md:table-cell">
        {agent.phone || <span className="text-zinc-400">—</span>}
      </td>
      <td className="px-5 py-3.5">
        {agent.isActive ? (
          <Badge className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border-emerald-200">
            Activo
          </Badge>
        ) : (
          <Badge className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 border-zinc-200">
            Inactivo
          </Badge>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Ver detalle del comercial"
            className="text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
          >
            <Link href={`/admin/sales-agents/${agent._id}`}>
              <Eye />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Editar comercial"
            className="text-zinc-500 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
          >
            <Link href={`/admin/sales-agents/${agent._id}/edit`}>
              <Pencil />
            </Link>
          </Button>
          <DeleteSalesAgentButton id={agent._id} name={agent.name} />
        </div>
      </td>
    </tr>
  );
}

export function SalesAgentAvatar({
  agent,
  size = 24,
}: {
  agent: { name: string; color: string } | null;
  size?: number;
}) {
  if (!agent) {
    return (
      <span
        className="flex items-center justify-center rounded-full bg-zinc-200 text-zinc-500"
        style={{ width: size, height: size }}
        aria-label="Sin comercial"
      >
        <UserCircle2 style={{ width: size * 0.7, height: size * 0.7 }} />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.4)),
        backgroundColor: agent.color,
      }}
      title={agent.name}
    >
      {getInitials(agent.name)}
    </span>
  );
}
