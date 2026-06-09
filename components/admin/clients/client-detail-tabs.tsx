"use client";

import { useState } from "react";
import { MapPin, Phone, Receipt, Store } from "lucide-react";
import {
  businessLineLabels,
  herrikonektTypeLabels,
  paymentMethodLabels,
  taxIdTypeLabels,
  type HerrikonektType,
  type PaymentMethod,
  type TaxIdType,
} from "@/lib/schemas/client";
import type { Client } from "@/lib/repositories/clients";
import { cn } from "@/lib/utils";

const businessLineStyles: Record<Client["businessLine"], string> = {
  adimenai: "bg-violet-50 text-violet-700 border-violet-100",
  herrikonekt: "bg-emerald-50 text-emerald-700 border-emerald-100",
  hiopos: "bg-amber-50 text-amber-700 border-amber-100",
};

type Tab = "data" | "addresses" | "phones" | "billing" | "sync";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "data", label: "Datos" },
  { id: "addresses", label: "Direcciones" },
  { id: "phones", label: "Teléfonos" },
  { id: "billing", label: "Facturación" },
  { id: "sync", label: "Sincronización" },
];

export function ClientDetailTabs({ client }: { client: Client }) {
  const [tab, setTab] = useState<Tab>("data");
  const isHerrikonekt = client.businessLine === "herrikonekt";
  const billingActive = !!client.billing?.invoicingActive;
  const visibleTabs = tabs.filter((t) => {
    if (t.id === "sync") return isHerrikonekt;
    if (t.id === "billing") return billingActive;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {client.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                businessLineStyles[client.businessLine]
              )}
            >
              {businessLineLabels[client.businessLine]}
            </span>
            {billingActive && (
              <span className="inline-flex items-center rounded-full border border-[#3B1E8A]/20 bg-[#3B1E8A]/10 px-2.5 py-0.5 text-xs font-medium text-[#3B1E8A]">
                <Receipt className="mr-1 size-3" />
                Facturación
              </span>
            )}
          </div>
          {client.description && (
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              {client.description}
            </p>
          )}
        </div>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex gap-6" aria-label="Secciones del cliente">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-[#3B1E8A] text-[#3B1E8A]"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "data" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {client.website && (
              <Item label="Página web">
                <a
                  href={client.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#3B1E8A] hover:underline"
                >
                  {client.website}
                </a>
              </Item>
            )}
            {isHerrikonekt && client.type && (
              <Item label="Tipo">
                {herrikonektTypeLabels[client.type as HerrikonektType] ??
                  client.type}
              </Item>
            )}
            {isHerrikonekt && client.subType && (
              <Item label="Subtipo">{client.subType}</Item>
            )}
            <Item label="Creado">
              {new Date(client.createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Item>
            <Item label="Actualizado">
              {new Date(client.updatedAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Item>
          </dl>
        </div>
      )}

      {tab === "addresses" && (
        <div className="rounded-xl border border-zinc-200 bg-white">
          {client.addresses.length === 0 ? (
            <EmptyState
              icon={<MapPin className="size-5" />}
              title="Sin direcciones"
              description="Este cliente no tiene direcciones guardadas."
            />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {client.addresses.map((a, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-4">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
                    <MapPin className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {a.zip ? `${a.zip} ` : ""}
                      {a.city}
                      {a.country ? `, ${a.country}` : ""}
                    </p>
                    {a.isPrimary && (
                      <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 uppercase">
                        Principal
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "phones" && (
        <div className="rounded-xl border border-zinc-200 bg-white">
          {client.phones.length === 0 ? (
            <EmptyState
              icon={<Phone className="size-5" />}
              title="Sin teléfonos"
              description="Este cliente no tiene teléfonos guardados."
            />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {client.phones.map((phone, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
                    <Phone className="size-4" />
                  </div>
                  <a
                    href={`tel:${phone}`}
                    className="text-sm font-medium text-zinc-900 hover:text-[#3B1E8A]"
                  >
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "billing" && billingActive && client.billing && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {client.billing.legalName && (
                <Item label="Razón social">{client.billing.legalName}</Item>
              )}
              <Item label="Tipo de identificador">
                {taxIdTypeLabels[client.billing.taxIdType as TaxIdType] ??
                  client.billing.taxIdType}
              </Item>
              {client.billing.taxId && (
                <Item label="NIF / CIF">{client.billing.taxId}</Item>
              )}
              {client.billing.billingEmail && (
                <Item label="Email de facturación">
                  <a
                    href={`mailto:${client.billing.billingEmail}`}
                    className="text-[#3B1E8A] hover:underline"
                  >
                    {client.billing.billingEmail}
                  </a>
                </Item>
              )}
              {client.billing.billingPhone && (
                <Item label="Teléfono de facturación">
                  <a
                    href={`tel:${client.billing.billingPhone}`}
                    className="text-[#3B1E8A] hover:underline"
                  >
                    {client.billing.billingPhone}
                  </a>
                </Item>
              )}
              <Item label="Método de pago">
                {paymentMethodLabels[
                  client.billing.paymentMethod as PaymentMethod
                ] ?? client.billing.paymentMethod}
              </Item>
              {client.billing.paymentTerms && (
                <Item label="Condiciones de pago" className="sm:col-span-2">
                  {client.billing.paymentTerms}
                </Item>
              )}
            </div>
          </div>

          {client.billing.address && client.billing.address.line1 && (
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-5 py-3">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Dirección fiscal
                </h3>
              </div>
              <div className="flex items-start gap-3 px-5 py-4">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {client.billing.address.line1}
                    {client.billing.address.line2
                      ? `, ${client.billing.address.line2}`
                      : ""}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {client.billing.address.zip
                      ? `${client.billing.address.zip} `
                      : ""}
                    {client.billing.address.city}
                    {client.billing.address.country
                      ? `, ${client.billing.address.country}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {client.billing.internalNotes && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-zinc-900">
                Notas internas
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-600">
                {client.billing.internalNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "sync" && isHerrikonekt && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Store className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Sincronización con la app
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {client.syncToApp
                  ? "Este comercio está habilitado para aparecer en Herrikonekt."
                  : "Este comercio NO se sincroniza con Herrikonekt."}
              </p>
              <p className="mt-3 text-xs text-zinc-400">
                Puedes cambiar esta preferencia desde la edición del cliente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-900">{children}</dd>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  );
}
