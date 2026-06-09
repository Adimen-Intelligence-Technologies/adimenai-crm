"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteClientButton } from "./delete-client-button";
import {
  businessLineLabels,
  herrikonektTypeLabels,
  type HerrikonektType,
} from "@/lib/schemas/client";
import { businessLineTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/repositories/clients";

export function ClientTable({ clients }: { clients: Client[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th className="px-4 py-2.5">Nombre</th>
            <th className="hidden px-4 py-2.5 sm:table-cell">Línea</th>
            <th className="hidden px-4 py-2.5 md:table-cell">Tipo</th>
            <th className="hidden px-4 py-2.5 lg:table-cell">Ciudad</th>
            <th className="hidden px-4 py-2.5 lg:table-cell">Teléfono</th>
            <th className="px-4 py-2.5 text-right">Acciones</th>
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
  const theme = businessLineTheme[client.businessLine];

  return (
    <tr className="hover:bg-zinc-50/60">
      <td className="px-4 py-3">
        <Link
          href={`/admin/clients/${client._id}`}
          className="font-medium text-zinc-900 hover:text-[#3B1E8A]"
        >
          {client.name}
        </Link>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <Badge
          variant="outline"
          className={cn("rounded-[2px]", theme.badge)}
        >
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
