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

export function ClientTable({
  clients,
  page,
  totalPages,
  onPageChange,
}: {
  clients: Client[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th className="px-4 py-2.5">Nombre</th>
            <th className="hidden px-4 py-2.5 sm:table-cell">Línea</th>
            <th className="hidden px-4 py-2.5 md:table-cell">Tipo</th>
            <th className="px-4 py-2.5">Ciudad</th>
            <th className="hidden px-4 py-2.5 md:table-cell">Teléfono</th>
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
                No hay contactos para mostrar.
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <ClientRow key={client._id} client={client} />
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
          <span className="text-sm text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-zinc-300">···</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={[
                      "min-w-[32px] rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                      p === page
                        ? "bg-[#3B1E8A] text-white"
                        : "text-zinc-600 hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRow({ client }: { client: Client }) {
  const primaryAddress =
    client.addresses?.find((a) => a.isPrimary) ??
    client.addresses?.find((a) => a.city?.trim()) ??
    client.addresses?.[0];
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
      <td className="px-4 py-3 text-zinc-600">
        {primaryAddress?.city || "—"}
      </td>
      <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">
        {primaryPhone || "—"}
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
