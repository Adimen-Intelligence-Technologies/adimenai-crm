"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  Building2,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Send,
  Store,
} from "lucide-react";
import {
  businessLineLabels,
  dayLabels,
  herrikonektTypeEnum,
  herrikonektTypeLabels,
  paymentMethodLabels,
  taxIdTypeLabels,
  type HerrikonektType,
  type OpeningHours,
  type PaymentMethod,
  type TaxIdType,
} from "@/lib/schemas/client";
import { businessLineTheme } from "@/lib/theme";
import type { Client } from "@/lib/repositories/clients";
import { cn } from "@/lib/utils";

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
  const theme = businessLineTheme[client.businessLine];
  const visibleTabs = tabs.filter((t) => {
    if (t.id === "sync") return isHerrikonekt;
    if (t.id === "billing") return billingActive;
    return true;
  });

  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  const primaryAddress = client.addresses?.find((a) => a.isPrimary) ?? client.addresses?.[0];

  const stats = [
    { label: "Direcciones", value: client.addresses?.length ?? 0, icon: MapPin },
    { label: "Teléfonos", value: client.phones?.length ?? 0, icon: Phone },
    {
      label: "Redes",
      value: [client.website, client.social?.instagram, client.social?.facebook].filter(Boolean).length,
      icon: Globe,
    },
    { label: "Sincronizado", value: client.syncToApp ? "Sí" : "No", icon: Send },
  ];

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white">
        <div
          className="relative h-28 sm:h-32"
          style={{
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-[0.08]">
            <svg
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="relative px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div
                className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold tracking-tight shadow-md ring-4 ring-white"
                style={{ color: theme.accent }}
              >
                {initials || "·"}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      theme.badge
                    )}
                  >
                    {businessLineLabels[client.businessLine]}
                  </span>
                  {billingActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#3B1E8A]/10 px-2 py-0.5 text-[11px] font-medium text-[#3B1E8A]">
                      <Receipt className="size-3" />
                      Facturación
                    </span>
                  )}
                </div>
                <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                  {client.name}
                </h1>
                {client.description && (
                  <p className="mt-1 max-w-xl text-sm text-pretty text-zinc-500">
                    {client.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-end">
              {client.phones?.[0] && (
                <ActionButton
                  href={`tel:${client.phones[0]}`}
                  icon={Phone}
                  label="Llamar"
                />
              )}
              {client.email && (
                <ActionButton
                  href={`mailto:${client.email}`}
                  icon={Mail}
                  label="Email"
                />
              )}
              {client.website && (
                <ActionButton
                  href={client.website}
                  icon={Globe}
                  label="Web"
                  external
                />
              )}
              {primaryAddress?.city && (
                <ActionButton
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [primaryAddress.line1, primaryAddress.zip, primaryAddress.city].filter(Boolean).join(", ")
                  )}`}
                  icon={MapPin}
                  label="Mapa"
                  external
                />
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-lg border border-zinc-200/60 bg-zinc-50/40 px-3 py-2.5"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${theme.accent}1A`, color: theme.accent }}
                >
                  <s.icon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
                    {s.label}
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 tabular-nums">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200/80">
        <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Secciones del cliente">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "border-b-2 px-1 pb-3 text-[13px] font-medium whitespace-nowrap transition-colors duration-150",
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

      {tab === "data" && <DataTab client={client} theme={theme} isHerrikonekt={isHerrikonekt} />}
      {tab === "addresses" && <AddressesTab client={client} theme={theme} />}
      {tab === "phones" && <PhonesTab client={client} theme={theme} />}
      {tab === "billing" && billingActive && client.billing && (
        <BillingTab client={client} theme={theme} />
      )}
      {tab === "sync" && isHerrikonekt && <SyncTab client={client} theme={theme} />}
    </div>
  );
}

function DataTab({
  client,
  theme,
  isHerrikonekt,
}: {
  client: Client;
  theme: ReturnType<typeof getTheme>;
  isHerrikonekt: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {client.website && (
        <InfoCard
          icon={Globe}
          label="Página web"
          theme={theme}
          action={
            <a
              href={client.website}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 transition-colors hover:text-[#3B1E8A]"
              aria-label="Abrir web"
            >
              <ExternalLink className="size-3.5" />
            </a>
          }
        >
          <a
            href={client.website}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-medium text-zinc-900 transition-colors hover:text-[#3B1E8A]"
          >
            {client.website.replace(/^https?:\/\//, "")}
          </a>
        </InfoCard>
      )}

      {client.email && (
        <InfoCard
          icon={Mail}
          label="Email"
          theme={theme}
          action={
            <a
              href={`mailto:${client.email}`}
              className="text-zinc-400 transition-colors hover:text-[#3B1E8A]"
              aria-label="Enviar email"
            >
              <Send className="size-3.5" />
            </a>
          }
        >
          <a
            href={`mailto:${client.email}`}
            className="truncate text-sm font-medium text-zinc-900 transition-colors hover:text-[#3B1E8A]"
          >
            {client.email}
          </a>
        </InfoCard>
      )}

      {isHerrikonekt && client.type && (
        <InfoCard icon={TagIcon(client.customTypeIcon)} label="Categoría" theme={theme}>
          {herrikonektTypeEnum.options.includes(client.type as HerrikonektType) ? (
            <span className="text-sm font-medium text-zinc-900">
              {herrikonektTypeLabels[client.type as HerrikonektType]}
            </span>
          ) : (
            <span className="text-sm font-medium text-zinc-900">{client.type}</span>
          )}
        </InfoCard>
      )}

      {(client.social?.instagram || client.social?.facebook) && (
        <InfoCard icon={Globe} label="Redes sociales" theme={theme} className="md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {client.social?.instagram && (
              <SocialPill
                platform="instagram"
                label={
                  client.social.instagram.startsWith("http")
                    ? client.social.instagram.split("/").pop() ?? "Instagram"
                    : client.social.instagram.replace(/^@/, "")
                }
                href={
                  client.social.instagram.startsWith("http")
                    ? client.social.instagram
                    : `https://instagram.com/${client.social.instagram.replace(/^@/, "")}`
                }
              />
            )}
            {client.social?.facebook && (
              <SocialPill
                platform="facebook"
                label={
                  client.social.facebook.includes("/")
                    ? client.social.facebook.split("/").pop() ?? "Facebook"
                    : client.social.facebook
                }
                href={client.social.facebook}
              />
            )}
          </div>
        </InfoCard>
      )}

      {client.openingHours && (
        <div className="md:col-span-2">
          <HoursCard hours={client.openingHours} theme={theme} />
        </div>
      )}

      <InfoCard icon={Calendar} label="Fechas" theme={theme} className="md:col-span-2">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Creado:</span>
            <span className="font-medium text-zinc-900">
              {new Date(client.createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Actualizado:</span>
            <span className="font-medium text-zinc-900">
              {new Date(client.updatedAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </InfoCard>
    </div>
  );
}

function HoursCard({
  hours,
  theme,
}: {
  hours: OpeningHours;
  theme: ReturnType<typeof getTheme>;
}) {
  const dayOrder: (keyof OpeningHours)[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
      <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-3.5">
        <span
          className="flex size-7 items-center justify-center rounded-md"
          style={{ backgroundColor: `${theme.accent}1A`, color: theme.accent }}
        >
          <Clock className="size-3.5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Horario de apertura</h3>
          <p className="text-[11px] text-zinc-500">Apertura semanal del comercio</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {dayOrder.map((day) => {
          const slots = hours[day];
          const isClosed = slots.length === 0;
          const isToday = isCurrentDay(day);
          return (
            <div
              key={day}
              className={cn(
                "flex flex-col gap-1 rounded-lg border p-3 transition-colors",
                isToday
                  ? "border-[#3B1E8A]/30 bg-[#3B1E8A]/[0.03]"
                  : isClosed
                    ? "border-zinc-100 bg-zinc-50/40"
                    : "border-zinc-200/60 bg-white"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[11px] font-semibold tracking-wide uppercase",
                    isToday ? "text-[#3B1E8A]" : "text-zinc-500"
                  )}
                >
                  {dayLabels[day]}
                </span>
                {isToday && (
                  <span className="size-1.5 rounded-full bg-[#3B1E8A]" aria-label="Hoy" />
                )}
              </div>
              {isClosed ? (
                <span className="text-sm font-medium text-zinc-400">Cerrado</span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {slots.map((s, i) => (
                    <span
                      key={i}
                      className="font-mono text-[13px] font-semibold tabular-nums text-zinc-900"
                    >
                      {s.open}–{s.close}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddressesTab({
  client,
  theme,
}: {
  client: Client;
  theme: ReturnType<typeof getTheme>;
}) {
  if (client.addresses.length === 0) {
    return (
      <EmptyTab
        icon={MapPin}
        title="Sin direcciones"
        description="Este cliente no tiene direcciones guardadas."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {client.addresses.map((a, i) => {
        const fullAddress = [a.line1, a.line2, a.zip, a.city, a.country]
          .filter(Boolean)
          .join(", ");
        return (
          <div
            key={i}
            className="group relative overflow-hidden rounded-lg border border-zinc-200/80 bg-white"
          >
            <div
              className="relative h-24"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}10 0%, ${theme.accentHover}10 100%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin
                  className="size-8 transition-transform group-hover:scale-110"
                  style={{ color: `${theme.accent}80` }}
                />
              </div>
              {a.isPrimary && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase shadow-xs">
                  Principal
                </span>
              )}
            </div>
            <div className="flex items-start justify-between gap-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">{a.line1}</p>
                {a.line2 && (
                  <p className="truncate text-sm text-zinc-500">{a.line2}</p>
                )}
                <p className="mt-0.5 text-sm text-zinc-500">
                  {[a.zip, a.city].filter(Boolean).join(" ")}
                  {a.country ? `, ${a.country}` : ""}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir en Google Maps"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-[#3B1E8A]"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhonesTab({
  client,
  theme,
}: {
  client: Client;
  theme: ReturnType<typeof getTheme>;
}) {
  if (client.phones.length === 0) {
    return (
      <EmptyTab
        icon={Phone}
        title="Sin teléfonos"
        description="Este cliente no tiene teléfonos guardados."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {client.phones.map((phone, i) => (
        <PhoneCard key={i} phone={phone} theme={theme} />
      ))}
    </div>
  );
}

function PhoneCard({
  phone,
  theme,
}: {
  phone: string;
  theme: ReturnType<typeof getTheme>;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-zinc-200/80 bg-white p-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${theme.accent}1A`, color: theme.accent }}
      >
        <Phone className="size-4" />
      </span>
      <a
        href={`tel:${phone}`}
        className="min-w-0 flex-1 truncate font-mono text-sm font-semibold tabular-nums text-zinc-900 transition-colors hover:text-[#3B1E8A]"
      >
        {phone}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar teléfono"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        {copied ? (
          <span className="text-[10px] font-semibold text-emerald-600">OK</span>
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  );
}

function BillingTab({
  client,
  theme,
}: {
  client: Client;
  theme: ReturnType<typeof getTheme>;
}) {
  const billing = client.billing!;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {billing.legalName && (
          <InfoCard icon={Building2} label="Razón social" theme={theme}>
            <span className="text-sm font-medium text-zinc-900">{billing.legalName}</span>
          </InfoCard>
        )}
        <InfoCard icon={Receipt} label="Identificador fiscal" theme={theme}>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-zinc-900">
              {billing.taxId ?? "—"}
            </span>
            <span className="text-[11px] text-zinc-500">
              {taxIdTypeLabels[billing.taxIdType as TaxIdType] ?? billing.taxIdType}
            </span>
          </div>
        </InfoCard>
        {billing.billingEmail && (
          <InfoCard icon={Mail} label="Email de facturación" theme={theme}>
            <a
              href={`mailto:${billing.billingEmail}`}
              className="truncate text-sm font-medium text-zinc-900 transition-colors hover:text-[#3B1E8A]"
            >
              {billing.billingEmail}
            </a>
          </InfoCard>
        )}
        {billing.billingPhone && (
          <InfoCard icon={Phone} label="Teléfono de facturación" theme={theme}>
            <a
              href={`tel:${billing.billingPhone}`}
              className="font-mono text-sm font-medium tabular-nums text-zinc-900 transition-colors hover:text-[#3B1E8A]"
            >
              {billing.billingPhone}
            </a>
          </InfoCard>
        )}
        <InfoCard icon={CreditCardIcon(billing.paymentMethod)} label="Método de pago" theme={theme}>
          <span className="text-sm font-medium text-zinc-900">
            {paymentMethodLabels[billing.paymentMethod as PaymentMethod] ??
              billing.paymentMethod}
          </span>
        </InfoCard>
        {billing.paymentTerms && (
          <InfoCard icon={Clock} label="Condiciones" theme={theme}>
            <span className="text-sm text-zinc-700">{billing.paymentTerms}</span>
          </InfoCard>
        )}
      </div>

      {billing.address && billing.address.line1 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-3.5">
            <span
              className="flex size-7 items-center justify-center rounded-md"
              style={{ backgroundColor: `${theme.accent}1A`, color: theme.accent }}
            >
              <MapPin className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-zinc-950">Dirección fiscal</h3>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-zinc-900">
              {billing.address.line1}
              {billing.address.line2 ? `, ${billing.address.line2}` : ""}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {[billing.address.zip, billing.address.city].filter(Boolean).join(" ")}
              {billing.address.country ? `, ${billing.address.country}` : ""}
            </p>
          </div>
        </div>
      )}

      {billing.internalNotes && (
        <div className="rounded-lg border border-zinc-200/80 bg-white p-5">
          <h3 className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
            Notas internas
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
            {billing.internalNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function SyncTab({
  client,
  theme,
}: {
  client: Client;
  theme: ReturnType<typeof getTheme>;
}) {
  const isOn = !!client.syncToApp;
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
      <div
        className="relative h-24"
        style={{
          background: isOn
            ? `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`
            : "linear-gradient(135deg, #71717A 0%, #52525B 100%)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-end pr-6">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl shadow-md ring-4 ring-white/20",
              isOn ? "bg-white" : "bg-white/20 backdrop-blur"
            )}
          >
            <Store className={cn("size-6", isOn ? "" : "text-white")} style={isOn ? { color: theme.accent } : undefined} />
          </div>
        </div>
      </div>
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-zinc-950">
              Sincronización con Herrikonekt
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {isOn
                ? "Este comercio está habilitado para aparecer en la app móvil de Herrikonekt."
                : "Este comercio NO se sincroniza con Herrikonekt."}
            </p>
          </div>
          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
              isOn
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-600"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isOn ? "bg-emerald-500" : "bg-zinc-400"
              )}
            />
            {isOn ? "Activo" : "Inactivo"}
          </div>
        </div>
        <p className="mt-3 text-[12px] text-zinc-400">
          Puedes cambiar esta preferencia desde la edición del cliente.
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  theme,
  children,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  theme: ReturnType<typeof getTheme>;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200/80 bg-white p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${theme.accent}1A`, color: theme.accent }}
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
              {label}
            </p>
            <div className="mt-1">{children}</div>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

function ActionButton({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={label}
      title={label}
      className="group inline-flex size-9 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-500 transition-all hover:border-[#3B1E8A]/30 hover:bg-[#3B1E8A]/5 hover:text-[#3B1E8A]"
    >
      <Icon className="size-4" />
    </a>
  );
}

function SocialPill({
  platform,
  label,
  href,
}: {
  platform: "instagram" | "facebook";
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-all hover:border-[#3B1E8A]/30 hover:bg-[#3B1E8A]/5 hover:text-[#3B1E8A]"
    >
      {platform === "instagram" ? (
        <BrandIcon platform="instagram" className="size-3.5 fill-current" />
      ) : (
        <BrandIcon platform="facebook" className="size-3.5 fill-current" />
      )}
      <span className="max-w-[160px] truncate">{label}</span>
      <ExternalLink className="size-3 text-zinc-400 group-hover:text-[#3B1E8A]" />
    </a>
  );
}

function BrandIcon({
  platform,
  className,
}: {
  platform: "instagram" | "facebook";
  className?: string;
}) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073C0 18.01 4.285 22.993 10 23.868v-8.317H7.5v-3.478H10V9.34c0-2.468 1.502-3.82 3.708-3.82 1.074 0 2.199.192 2.199.192v2.416h-1.239c-1.22 0-1.6.757-1.6 1.534v1.838h2.723l-.445 3.478H13.07v8.317C19.715 22.993 24 18.01 24 12.073" />
    </svg>
  );
}

function EmptyTab({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-white px-5 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function getTheme(businessLine: string) {
  return businessLineTheme[businessLine as keyof typeof businessLineTheme] ?? businessLineTheme.adimenai;
}

function TagIcon(customIcon?: string) {
  return ({ className }: { className?: string }) => {
    if (!customIcon) return <Store className={className} />;
    const Icon = LucideIcons[customIcon as keyof typeof LucideIcons] as
      | React.ComponentType<{ className?: string }>
      | undefined;
    return Icon ? <Icon className={className} /> : <Store className={className} />;
  };
}

function CreditCardIcon(method?: string) {
  return ({ className }: { className?: string }) => {
    if (method === "bank_transfer") return <Building2 className={className} />;
    if (method === "cash") return <Receipt className={className} />;
    return <Receipt className={className} />;
  };
}

function isCurrentDay(day: keyof OpeningHours): boolean {
  const dayMap: Record<keyof OpeningHours, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };
  return new Date().getDay() === dayMap[day];
}
