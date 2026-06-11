"use client";

import { useState } from "react";
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

export function ClientDetailTabs({ client }: { client: Client }) {
  const theme = businessLineTheme[client.businessLine];
  const isHerrikonekt = client.businessLine === "herrikonekt";
  const billingActive = !!client.billing?.invoicingActive;
  const isOn = !!client.syncToApp;
  const primaryAddress =
    client.addresses?.find((a) => a.isPrimary) ?? client.addresses?.[0];

  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      {/* Hero / cabecera */}
      <div
        className="rounded-xl px-6 py-6 sm:px-8 sm:py-7"
        style={{
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
        }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold tracking-tight text-white backdrop-blur-sm">
              {initials || "·"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {businessLineLabels[client.businessLine]}
                </span>
                {isHerrikonekt && client.type && (
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                    {herrikonektTypeEnum.options.includes(client.type as HerrikonektType)
                      ? herrikonektTypeLabels[client.type as HerrikonektType]
                      : client.type}
                  </span>
                )}
                {billingActive && (
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                    Facturación activa
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                {client.name}
              </h1>
              {client.description && (
                <p className="mt-1 max-w-xl text-sm text-pretty text-white/80">
                  {client.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {client.phones?.[0] && (
              <ActionButton href={`tel:${client.phones[0]}`} icon={Phone} label="Llamar" />
            )}
            {client.email && (
              <ActionButton href={`mailto:${client.email}`} icon={Mail} label="Email" />
            )}
            {client.website && (
              <ActionButton href={client.website} icon={Globe} label="Web" external />
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
      </div>

      {/* Cuerpo en grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Tarjeta unificada de contacto (estilo Apple) */}
          <Card>
            <div className="divide-y divide-zinc-100">
              {/* Web */}
              {client.website && (
                <ContactRow
                  icon={Globe}
                  label="Web"
                  value={client.website.replace(/^https?:\/\//, "")}
                  href={client.website}
                  external
                />
              )}
              {/* Email */}
              {client.email && (
                <ContactRow
                  icon={Mail}
                  label="Email"
                  value={client.email}
                  href={`mailto:${client.email}`}
                />
              )}
              {/* Instagram */}
              {client.social?.instagram && (
                <ContactRow
                  icon={Instagram}
                  label="Instagram"
                  value={
                    client.social.instagram.startsWith("http")
                      ? client.social.instagram.split("/").pop() ?? "Instagram"
                      : client.social.instagram.replace(/^@/, "")
                  }
                  href={
                    client.social.instagram.startsWith("http")
                      ? client.social.instagram
                      : `https://instagram.com/${client.social.instagram.replace(/^@/, "")}`
                  }
                  external
                />
              )}
              {/* Facebook */}
              {client.social?.facebook && (
                <ContactRow
                  icon={Facebook}
                  label="Facebook"
                  value={
                    client.social.facebook.includes("/")
                      ? client.social.facebook.split("/").pop() ?? "Facebook"
                      : client.social.facebook
                  }
                  href={client.social.facebook}
                  external
                />
              )}
              {/* Teléfonos */}
              {client.phones && client.phones.length > 0 && (
                <ContactRow
                  icon={Phone}
                  label={client.phones.length > 1 ? `Teléfonos (${client.phones.length})` : "Teléfono"}
                  value={client.phones.join(" · ")}
                  mono
                  action={
                    <CopyButton
                      value={client.phones[0]}
                      label="Copiar"
                    />
                  }
                />
              )}
              {/* Direcciones */}
              {client.addresses && client.addresses.length > 0 && (
                <ContactRow
                  icon={MapPin}
                  label={client.addresses.length > 1 ? `Direcciones (${client.addresses.length})` : "Dirección"}
                  value={
                    client.addresses
                      .map((a) => {
                        const parts = [a.line1, a.zip, a.city].filter(Boolean);
                        return a.isPrimary ? parts.join(", ") : null;
                      })
                      .filter(Boolean)
                      .join(" · ") ||
                    [client.addresses[0].line1, client.addresses[0].zip, client.addresses[0].city]
                      .filter(Boolean)
                      .join(", ")
                  }
                  mono
                  action={
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        client.addresses
                          .find((a) => a.isPrimary) ?? client.addresses[0]
                        ? (() => {
                            const a = client.addresses.find((x) => x.isPrimary) ?? client.addresses[0];
                            return [a.line1, a.line2, a.zip, a.city, a.country].filter(Boolean).join(", ");
                          })()
                        : ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Abrir en Google Maps"
                      className="flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-[#3B1E8A]"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  }
                />
              )}
            </div>
          </Card>

          {/* Horario */}
          {client.openingHours && (
            <Card title="Horario de apertura" subtitle="Apertura semanal del comercio">
              <HoursGrid hours={client.openingHours} />
            </Card>
          )}

          {/* Facturación */}
          {billingActive && client.billing && (
            <Card title="Facturación">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {client.billing.legalName && (
                  <BillingItem
                    icon={Building2}
                    label="Razón social"
                    value={client.billing.legalName}
                  />
                )}
                <BillingItem
                  icon={Receipt}
                  label="Identificador fiscal"
                  value={client.billing.taxId ?? "—"}
                  sub={
                    taxIdTypeLabels[client.billing.taxIdType as TaxIdType] ??
                    client.billing.taxIdType
                  }
                />
                {client.billing.billingEmail && (
                  <BillingItem
                    icon={Mail}
                    label="Email facturación"
                    value={client.billing.billingEmail}
                    href={`mailto:${client.billing.billingEmail}`}
                  />
                )}
                {client.billing.billingPhone && (
                  <BillingItem
                    icon={Phone}
                    label="Teléfono facturación"
                    value={client.billing.billingPhone}
                    href={`tel:${client.billing.billingPhone}`}
                    mono
                  />
                )}
                <BillingItem
                  icon={Receipt}
                  label="Método de pago"
                  value={
                    paymentMethodLabels[client.billing.paymentMethod as PaymentMethod] ??
                    client.billing.paymentMethod
                  }
                />
                {client.billing.paymentTerms && (
                  <BillingItem
                    icon={Clock}
                    label="Condiciones"
                    value={client.billing.paymentTerms}
                  />
                )}
                {client.billing.address?.line1 && (
                  <div className="sm:col-span-2">
                    <BillingItem
                      icon={MapPin}
                      label="Dirección fiscal"
                      value={`${client.billing.address.line1}${client.billing.address.line2 ? `, ${client.billing.address.line2}` : ""}`}
                      sub={[client.billing.address.zip, client.billing.address.city]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  </div>
                )}
                {client.billing.internalNotes && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
                      Notas internas
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                      {client.billing.internalNotes}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-5">
          {isHerrikonekt && (
            <Card title="Sincronización" subtitle="Herrikonekt">
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg border p-4 transition-colors",
                  isOn
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white"
                    : "border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-white"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm",
                      isOn
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-200 text-zinc-500"
                    )}
                  >
                    <Store className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        isOn ? "text-emerald-900" : "text-zinc-700"
                      )}
                    >
                      {isOn ? "Sincronizado" : "Sin sincronizar"}
                    </p>
                    <p
                      className={cn(
                        "text-[12px]",
                        isOn ? "text-emerald-700/80" : "text-zinc-500"
                      )}
                    >
                      {isOn
                        ? "Visible en la app móvil"
                        : "No aparece en la app móvil"}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "relative flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
                      isOn ? "bg-emerald-500" : "bg-zinc-300"
                    )}
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "size-6 rounded-full bg-white shadow-sm transition-transform",
                        isOn ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    "absolute -right-6 -top-6 size-20 rounded-full opacity-20 blur-2xl",
                    isOn ? "bg-emerald-400" : "bg-zinc-400"
                  )}
                  aria-hidden
                />
              </div>
              <p className="mt-3 text-[12px] text-zinc-500">
                {isOn
                  ? "Este comercio está habilitado para aparecer en Herrikonekt."
                  : "Activa la sincronización desde la edición del cliente."}
              </p>
            </Card>
          )}

          <Card title="Fechas">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-zinc-400" />
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
                    Creado
                  </p>
                  <p className="text-sm font-medium text-zinc-900">
                    {new Date(client.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-zinc-400" />
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
                    Actualizado
                  </p>
                  <p className="text-sm font-medium text-zinc-900">
                    {new Date(client.updatedAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function Card({
  title,
  subtitle,
  count,
  children,
}: {
  title?: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  const hasHeader = !!title || typeof count === "number";
  return (
    <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6 sm:py-6">
      {hasHeader && (
        <header className="mb-4 flex items-baseline justify-between gap-3">
          {title ? (
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-zinc-950">{title}</h2>
              {subtitle && <p className="mt-0.5 text-[12px] text-zinc-500">{subtitle}</p>}
            </div>
          ) : (
            <span />
          )}
          {typeof count === "number" && (
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-600">
              {count}
            </span>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
  mono,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  mono?: boolean;
  action?: React.ReactNode;
}) {
  const inner = (
    <>
      <Icon className="size-[18px] shrink-0 text-zinc-400 transition-colors group-hover:text-[#3B1E8A]" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-[0.02em] text-zinc-500">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-[15px] font-semibold text-zinc-950 transition-colors group-hover:text-[#3B1E8A]",
            mono && "font-mono tabular-nums"
          )}
        >
          {value}
        </p>
      </div>
      {action && <div className="ml-2 shrink-0">{action}</div>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="group flex items-center gap-3 px-1 py-3.5 transition-colors first:pt-1 last:pb-1"
      >
        {inner}
      </a>
    );
  }
  return (
    <div className="group flex items-center gap-3 px-1 py-3.5 first:pt-1 last:pb-1">
      {inner}
    </div>
  );
}

function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-[#3B1E8A]"
    >
      {copied ? (
        <span className="text-[10px] font-semibold text-emerald-600">OK</span>
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}

function BillingItem({
  icon: Icon,
  label,
  value,
  sub,
  href,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  href?: string;
  mono?: boolean;
}) {
  const inner = (
    <>
      <Icon className="mt-0.5 size-4 shrink-0 text-zinc-500" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-zinc-500 uppercase">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm font-semibold text-zinc-900",
            mono && "font-mono tabular-nums"
          )}
        >
          {value}
        </p>
        {sub && <p className="text-[12px] text-zinc-500">{sub}</p>}
      </div>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className="group flex items-start gap-3 rounded-lg p-1 transition-colors hover:bg-zinc-50"
      >
        {inner}
      </a>
    );
  }
  return <div className="flex items-start gap-3 p-1">{inner}</div>;
}

function HoursGrid({ hours }: { hours: OpeningHours }) {
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
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-7">
      {dayOrder.map((day) => {
        const slots = hours[day];
        const isClosed = slots.length === 0;
        const isToday = isCurrentDay(day);
        return (
          <div
            key={day}
            className={cn(
              "flex flex-col gap-1 border-b-2 pb-2",
              isToday ? "border-[#3B1E8A]" : "border-transparent"
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-[11px] font-bold tracking-wide uppercase",
                  isToday ? "text-[#3B1E8A]" : "text-zinc-500"
                )}
              >
                {dayLabels[day]}
              </span>
              {isToday && (
                <span
                  className="size-1.5 rounded-full bg-[#3B1E8A]"
                  aria-label="Hoy"
                />
              )}
            </div>
            {isClosed ? (
              <span className="text-sm text-zinc-400">Cerrado</span>
            ) : (
              <div className="flex flex-col gap-0.5">
                {slots.map((s, i) => (
                  <span
                    key={i}
                    className="font-mono text-[14px] font-bold tabular-nums text-zinc-900"
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
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-white/15 px-3 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
    >
      <Icon className="size-3.5" />
      {label}
    </a>
  );
}

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881" />
    </svg>
  );
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073C0 18.01 4.285 22.993 10 23.868v-8.317H7.5v-3.478H10V9.34c0-2.468 1.502-3.82 3.708-3.82 1.074 0 2.199.192 2.199.192v2.416h-1.239c-1.22 0-1.6.757-1.6 1.534v1.838h2.723l-.445 3.478H13.07v8.317C19.715 22.993 24 18.01 24 12.073" />
    </svg>
  );
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
