"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteClientButton } from "./delete-client-button";
import {
  businessLineLabels,
  herrikonektTypeLabels,
  type BusinessLine,
  type HerrikonektType,
} from "@/lib/schemas/client";
import type { Client } from "@/lib/repositories/clients";

const businessLineStyles: Record<BusinessLine, string> = {
  adimenai: "bg-violet-50 text-violet-700 border-violet-100",
  herrikonekt: "bg-emerald-50 text-emerald-700 border-emerald-100",
  hiopos: "bg-amber-50 text-amber-700 border-amber-100",
};

export function ClientTable({ clients }: { clients: Client[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Línea</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Tipo</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Ciudad</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Teléfono</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {clients.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-10 text-center text-sm text-zinc-500"
              >
                No hay clientes para mostrar.
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <ClientRow key={client._id} client={client} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ClientRow({ client }: { client: Client }) {
  const primaryAddress = client.addresses?.[0];
  const primaryPhone = client.phones?.[0];

  return (
    <tr className="hover:bg-zinc-50/60">
      <td className="px-4 py-3">
        <Link
          href={`/admin/clients/${client._id}`}
          className="font-medium text-zinc-900 hover:text-[#6C47FF]"
        >
          {client.name}
        </Link>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <Badge variant="outline" className={businessLineStyles[client.businessLine]}>
          {businessLineLabels[client.businessLine]}
        </Badge>
      </td>
      <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">
        {client.type
          ? herrikonektTypeLabels[client.type as HerrikonektType] ?? client.type
          : "—"}
      </td>
      <td className="hidden px-4 py-3 text-zinc-600 lg:table-cell">
        {primaryAddress?.city ?? "—"}
      </td>
      <td className="hidden px-4 py-3 text-zinc-600 lg:table-cell">
        {primaryPhone ?? "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Editar cliente"
            className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Link href={`/admin/clients/${client._id}/edit`}>
              <Pencil />
            </Link>
          </Button>
          <DeleteClientButton id={client._id} name={client.name} />
        </div>
      </td>
    </tr>
  );
}
