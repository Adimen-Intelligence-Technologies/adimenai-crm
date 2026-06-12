import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { businessLineTheme } from "@/lib/theme";
import { businessLineLabels } from "@/lib/schemas/client";
import { serviceBillingLabels, serviceBillingShort } from "@/lib/schemas/service";
import { getService } from "@/lib/repositories/services";
import { DeleteServiceButton } from "@/components/admin/services/delete-service-button";

function formatEUR(n: number): string {
  return (
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " €"
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  const theme = businessLineTheme[service.businessLine];
  const profitMargin = service.profitMargin ?? 0;
  const benefit = service.price * (profitMargin / 100);
  const finalPrice = service.price + benefit;
  const iva = finalPrice * 0.21;
  const total = finalPrice + iva;

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="self-start -ml-2 text-zinc-700 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A] sm:self-auto"
        >
          <Link href="/admin/gestion-servicios">
            <ArrowLeft />
            Volver a Servicios
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Link href={`/admin/gestion-servicios/${service._id}/edit`}>
              <Pencil />
              Editar
            </Link>
          </Button>
          <DeleteServiceButton id={service._id} name={service.name} />
        </div>
      </div>

      {/* Hero */}
      <div
        className="rounded-xl px-6 py-6 sm:px-8 sm:py-7"
        style={{
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentHover} 100%)`,
        }}
      >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {businessLineLabels[service.businessLine]}
                </span>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                  {serviceBillingLabels[service.billing]}
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                {service.name}
              </h1>
              {service.description && (
                <p className="mt-1 max-w-xl whitespace-pre-line text-sm text-pretty text-white/80">
                  {service.description}
                </p>
              )}
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3 text-white backdrop-blur-sm">
              {profitMargin > 0 ? (
                <>
                  <p className="text-[10px] font-semibold tracking-wide text-white/80 uppercase">
                    Precio de venta (sin IVA)
                  </p>
                  <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums">
                    {formatEUR(finalPrice)}
                    {service.billing !== "one_time" && (
                      <span className="ml-1 text-sm font-normal text-white/80">
                        {serviceBillingShort[service.billing]}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/70">
                    Coste {formatEUR(service.price)} + {profitMargin}% margen
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold tracking-wide text-white/80 uppercase">
                    Precio sin IVA
                  </p>
                  <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums">
                    {formatEUR(service.price)}
                    {service.billing !== "one_time" && (
                      <span className="ml-1 text-sm font-normal text-white/80">
                        {serviceBillingShort[service.billing]}
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="mb-4 text-[15px] font-bold tracking-tight text-zinc-950">
              Información
            </h2>
            <div className="divide-y divide-zinc-100">
              <DetailRow label="Línea" value={businessLineLabels[service.businessLine]} />
              <DetailRow
                label="Facturación"
                value={serviceBillingLabels[service.billing]}
              />
              <DetailRow
                label="Descripción"
                value={service.description || "—"}
                block
              />
              <DetailRow label="Coste sin IVA" value={formatEUR(service.price)} mono />
              {profitMargin > 0 && (
                <DetailRow
                  label="Margen de beneficio"
                  value={`${profitMargin}% · ${formatEUR(benefit)}`}
                  mono
                />
              )}
              <DetailRow
                label="Precio de venta (sin IVA)"
                value={formatEUR(finalPrice)}
                mono
                highlight={profitMargin > 0}
              />
              <DetailRow label="IVA (21%)" value={formatEUR(iva)} mono />
              <DetailRow
                label="Precio con IVA"
                value={formatEUR(total)}
                mono
                highlight
              />
              <DetailRow
                label="Creado"
                value={new Date(service.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <DetailRow
                label="Actualizado"
                value={new Date(service.updatedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-zinc-200/80 bg-white px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="mb-4 text-[15px] font-bold tracking-tight text-zinc-950">
              Resumen
            </h2>
            <ul className="divide-y divide-zinc-100">
              <SummaryRow label="Nombre" value={service.name} ok />
              <SummaryRow
                label="Línea"
                value={businessLineLabels[service.businessLine]}
                ok
              />
              <SummaryRow
                label="Facturación"
                value={serviceBillingLabels[service.billing]}
                ok
              />
              <SummaryRow
                label="Descripción"
                value={service.description ? `${service.description.length} caracteres` : "—"}
                ok={!!service.description}
              />
              <SummaryRow
                label="Coste"
                value={formatEUR(service.price)}
                ok
              />
              {profitMargin > 0 && (
                <SummaryRow
                  label="Venta (sin IVA)"
                  value={formatEUR(finalPrice)}
                  ok
                />
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  highlight,
  block,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  block?: boolean;
}) {
  if (block) {
    return (
      <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
        <span className="text-[11px] font-semibold tracking-[0.02em] text-zinc-500 uppercase">
          {label}
        </span>
        <p className="whitespace-pre-line text-sm text-zinc-950">{value}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="text-[11px] font-semibold tracking-[0.02em] text-zinc-500 uppercase">
        {label}
      </span>
      <span
        className={
          highlight
            ? "text-base font-bold text-zinc-950"
            : "text-sm font-semibold text-zinc-900"
        }
      >
        {mono ? <span className="font-mono tabular-nums">{value}</span> : value}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="truncate text-right text-sm font-semibold text-zinc-950">
        {value}
      </span>
    </li>
  );
}
