"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Globe, Pencil, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteClientButton } from "./delete-client-button";
import * as LucideIcons from "lucide-react";
import {
  businessLineLabels,
  herrikonektTypeEnum,
  herrikonektTypeIcons,
  herrikonektTypeLabels,
  type HerrikonektType,
} from "@/lib/schemas/client";
import { useCustomTypes } from "@/lib/stores/custom-types";
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
            <th className="hidden px-4 py-2.5 lg:table-cell">Socials</th>
            <th className="px-4 py-2.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {clients.length === 0 ? (
            <tr>
              <td
                colSpan={7}
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
  const isHerrikonekt = client.businessLine === "herrikonekt";

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
      <td className="hidden px-4 py-3 md:table-cell">
        {isHerrikonekt && client.type ? (
          <InlineTypeSelect
            clientId={client._id}
            currentType={client.type as HerrikonektType}
            customTypeIcon={client.customTypeIcon}
          />
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-zinc-600">
        {primaryAddress?.city || "—"}
      </td>
      <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">
        {primaryPhone || "—"}
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <div className="flex items-center gap-3">
          <Globe className={cn("size-4", client.website ? "text-[#3B1E8A]" : "text-zinc-200")} />
          <svg viewBox="0 0 24 24" className={cn("size-4 fill-current", client.social?.instagram ? "text-[#3B1E8A]" : "text-zinc-200")}>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881" />
          </svg>
          <svg viewBox="0 0 24 24" className={cn("size-4 fill-current", client.social?.facebook ? "text-[#3B1E8A]" : "text-zinc-200")}>
            <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073C0 18.01 4.285 22.993 10 23.868v-8.317H7.5v-3.478H10V9.34c0-2.468 1.502-3.82 3.708-3.82 1.074 0 2.199.192 2.199.192v2.416h-1.239c-1.22 0-1.6.757-1.6 1.534v1.838h2.723l-.445 3.478H13.07v8.317C19.715 22.993 24 18.01 24 12.073" />
          </svg>
        </div>
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

function InlineTypeSelect({ clientId, currentType, customTypeIcon }: { clientId: string; currentType?: HerrikonektType; customTypeIcon?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const customTypes = useCustomTypes((s) => s.types);

  const isPredefined = currentType ? herrikonektTypeEnum.options.includes(currentType as HerrikonektType) : false;

  const selected = currentType
    ? {
        id: currentType,
        label: isPredefined
          ? herrikonektTypeLabels[currentType as HerrikonektType]
          : currentType,
        isCustom: !isPredefined,
        iconName: customTypeIcon,
      }
    : null;

  const predefinedOptions = herrikonektTypeEnum.options
    .map((t) => ({
      id: t,
      label: herrikonektTypeLabels[t],
      isCustom: false as const,
      iconName: undefined as string | undefined,
      iconComponent: herrikonektTypeIcons[t],
    }));

  const customOptions = customTypes.map((ct) => ({
    id: ct.label,
    label: ct.label,
    isCustom: true as const,
    iconName: ct.icon,
    iconComponent: LucideIcons[ct.icon as keyof typeof LucideIcons] as
      | React.ComponentType<{ className?: string }>
      | undefined,
  }));

  const allOptions = [...predefinedOptions, ...customOptions];

  const filtered = allOptions.filter((o) =>
    query.trim()
      ? o.label.toLowerCase().includes(query.trim().toLowerCase())
      : true
  );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function selectOption(option: (typeof allOptions)[number]) {
    setOpen(false);
    setQuery("");
    const payload: Record<string, string> = { type: option.id };
    if (option.isCustom && option.iconName) {
      payload.customTypeIcon = option.iconName;
    } else {
      payload.customTypeIcon = "";
    }
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) router.refresh();
  }

  function selectedIcon() {
    if (selected?.isCustom && selected.iconName) {
      const Icon = LucideIcons[selected.iconName as keyof typeof LucideIcons] as
        | React.ComponentType<{ className?: string }>
        | undefined;
      return Icon ? <Icon className="size-2.5" /> : null;
    }
    if (selected && !selected.isCustom) {
      const Icon = herrikonektTypeIcons[selected.id as HerrikonektType];
      return Icon ? <Icon className="size-2.5" /> : null;
    }
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-7 w-full items-center justify-between gap-1 rounded border border-zinc-200 bg-white px-2 text-xs transition-colors",
          "hover:border-zinc-300 focus-visible:border-[#3B1E8A] focus-visible:ring-[3px] focus-visible:ring-[#3B1E8A]/20",
          !selected && "text-zinc-400"
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {selected ? (
            <>
              <span className="flex size-4 shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-zinc-500">
                {selectedIcon()}
              </span>
              <span className="truncate font-medium text-zinc-700">{selected.label}</span>
            </>
          ) : (
            <span className="text-zinc-400">—</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-3 shrink-0 text-zinc-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-50 mt-1 w-56 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-200 p-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-400" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tipo…"
                className="h-7 pl-7 pr-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setOpen(false); setQuery(""); }
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    selectOption(filtered[0]);
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-zinc-500">
                Sin resultados
              </li>
            ) : (
              filtered.map((o) => {
                const isSelected = o.id === currentType && o.isCustom === !isPredefined;
                return (
                  <li key={`${o.isCustom ? "custom" : "predef"}-${o.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectOption(o)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                          : "text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded border",
                          isSelected
                            ? "border-[#3B1E8A]/20 bg-white text-[#3B1E8A]"
                            : "border-zinc-200 bg-zinc-50 text-zinc-500"
                        )}
                      >
                        {o.isCustom && o.iconComponent ? (
                          <o.iconComponent className="size-3" />
                        ) : !o.isCustom && o.iconComponent ? (
                          <o.iconComponent className="size-3" />
                        ) : null}
                      </span>
                      <span className="flex-1 truncate">
                        {o.label}
                        {o.isCustom && (
                          <span className="ml-1 text-[9px] text-zinc-400">(personalizada)</span>
                        )}
                      </span>
                      {isSelected && <Check className="size-3 shrink-0 text-[#3B1E8A]" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
