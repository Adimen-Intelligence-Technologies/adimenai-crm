import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Circle, Clock, FileText, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { businessLineLabels, type BusinessLine } from "@/lib/schemas/client";
import { businessLineTheme } from "@/lib/theme";
import { presupuestoStatusLabels } from "@/lib/schemas/presupuesto";
import { getDashboardMetrics } from "@/lib/repositories/dashboard";
import { ChartMonthlyAmount, ChartMonthlyCount, ChartBusinessLines, type MonthDatum, type BusinessLineDatum } from "@/components/admin/dashboard/charts";
import { ChartStatusDonut } from "@/components/admin/dashboard/chart-status-donut";
import { cn } from "@/lib/utils";

function buildMonthData(raw: Array<{ month: string; label: string; count: number; amount: number }>): MonthDatum[] {
  return raw.map((m) => ({
    label: m.label,
    count: m.count,
    amount: m.amount,
    amountLabel: EUR.format(m.amount),
    countLabel: `${m.count} presupuesto${m.count === 1 ? "" : "s"}`,
    amountShort:
      m.amount >= 1000000
        ? `${(m.amount / 1000000).toFixed(1).replace(".", ",")}M €`
        : m.amount >= 1000
          ? `${(m.amount / 1000).toFixed(1).replace(".", ",")}k €`
          : `${Math.round(m.amount)} €`,
  }));
}

function buildBusinessLineData(
  byLine: { adimenai: number; herrikonekt: number; hiopos: number }
): BusinessLineDatum[] {
  return [
    { id: "adimenai", label: "AdimenAi", value: byLine.adimenai, color: businessLineTheme.adimenai.accent },
    { id: "herrikonekt", label: "Herrikonekt", value: byLine.herrikonekt, color: businessLineTheme.herrikonekt.accent },
    { id: "hiopos", label: "Hiopos", value: byLine.hiopos, color: businessLineTheme.hiopos.accent },
  ];
}

const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();
  const monthly = buildMonthData(metrics.presupuestos.monthly);
  const businessLineData = buildBusinessLineData(metrics.clients.byLine);

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          Dashboard
        </h1>
        <p className="text-sm font-semibold text-zinc-900 capitalize">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {/* KPIs grandes */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Contactos"
          value={metrics.clients.total.toLocaleString("es-ES")}
          href="/admin/clients"
        />
        <KpiCard
          label="Presupuestos"
          value={metrics.presupuestos.total.toLocaleString("es-ES")}
          href="/admin/presupuestos"
        />
        <KpiCard
          label="Importe facturable"
          value={EUR.format(metrics.presupuestos.totalAmount)}
          href="/admin/presupuestos"
        />
        <KpiCard
          label="Tareas abiertas"
          value={metrics.tasks.open.toLocaleString("es-ES")}
          href="/admin/tasks"
        />
      </section>

      {/* Charts principales */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardShell className="lg:col-span-2" title="Presupuestos · últimos 6 meses">
          <div className="grid grid-cols-1 gap-4">
            <ChartMonthlyAmount data={monthly} height={260} />
            <div className="-mt-2 grid grid-cols-3 border-t border-zinc-100 pt-3">
              <ChartLegend label="Total 6m" value={EUR.format(
                monthly.reduce((a, m) => a + m.amount, 0)
              )} />
              <ChartLegend
                label="Promedio mensual"
                value={EUR.format(
                  monthly.reduce((a, m) => a + m.amount, 0) /
                    Math.max(1, monthly.length)
                )}
              />
              <ChartLegend
                label="Mejor mes"
                value={
                  monthly.length > 0
                    ? monthly.reduce(
                        (best, m) => (m.amount > best.amount ? m : best),
                        monthly[0]
                      ).label
                    : "—"
                }
              />
            </div>
          </div>
        </CardShell>

        <CardShell title="Estado de presupuestos">
          <ChartStatusDonut data={metrics.presupuestos.byStatus} />
        </CardShell>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardShell
          title="Contactos por línea de negocio"
          action={
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3B1E8A] hover:text-[#2D1666]"
            >
              Ver contactos
              <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          <ChartBusinessLines data={businessLineData} />
        </CardShell>

        <CardShell title="Volumen mensual" className="lg:col-span-2">
          <ChartMonthlyCount data={monthly} height={240} />
        </CardShell>

        <CardShell title="Top clientes por importe">
          {metrics.clients.topByTotal.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">Sin datos todavía.</p>
          ) : (
            <ul className="space-y-3">
              {metrics.clients.topByTotal.map((c, i) => {
                const max = metrics.clients.topByTotal[0].total || 1;
                const pct = Math.round((c.total / max) * 100);
                const theme = businessLineTheme[c.businessLine as BusinessLine];
                return (
                  <li key={c._id}>
                    <Link
                      href={`/admin/clients/${c._id}`}
                      className="group flex items-center gap-3"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-900">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-bold text-zinc-950 group-hover:text-[#3B1E8A]">
                            {c.name}
                          </p>
                          <span className="font-mono text-sm font-bold tabular-nums text-zinc-950">
                            {EUR.format(c.total)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className={cn("h-full transition-all", theme?.accent ? "" : "bg-zinc-900")}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: theme?.accent ?? "#3B1E8A",
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardShell>
      </section>

      {/* Listas inferiores */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardShell
          title="Presupuestos recientes"
          action={
            <Link
              href="/admin/presupuestos"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3B1E8A] hover:text-[#2D1666]"
            >
              Ver todos
              <ArrowUpRight className="size-3" />
            </Link>
          }
          className="lg:col-span-2"
          noPadding
        >
          {metrics.presupuestos.recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">No hay presupuestos aún.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {metrics.presupuestos.recent.map((p) => {
                const theme = businessLineTheme[p.businessLine as BusinessLine];
                const statusKey = p.status as keyof typeof presupuestoStatusLabels;
                return (
                  <li key={p._id}>
                    <Link
                      href={`/admin/presupuestos/${p._id}`}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-zinc-500">
                            {p.number}
                          </span>
                          {theme && (
                            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", theme.badge)}>
                              {businessLineLabels[p.businessLine as BusinessLine]}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-950 group-hover:text-[#3B1E8A]">
                          {p.title || "Sin título"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold tabular-nums text-zinc-950">
                          {EUR.format(p.total)}
                        </span>
                        <PresupuestoStatusChip status={statusKey} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardShell>

        <CardShell
          title="Contactos recientes"
          action={
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3B1E8A] hover:text-[#2D1666]"
            >
              Ver todos
              <ArrowUpRight className="size-3" />
            </Link>
          }
          noPadding
        >
          {metrics.clients.recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">Sin contactos.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {metrics.clients.recent.map((c) => {
                const theme = businessLineTheme[c.businessLine as BusinessLine];
                const initials = c.name
                  .split(" ")
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join("")
                  .toUpperCase();
                return (
                  <li key={c._id}>
                    <Link
                      href={`/admin/clients/${c._id}`}
                      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-900">
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-950 group-hover:text-[#3B1E8A]">
                          {c.name}
                        </p>
                        <p className="truncate text-[12px] text-zinc-900">{c.city || "—"}</p>
                      </div>
                      {theme && (
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", theme.badge)}>
                          {businessLineLabels[c.businessLine as BusinessLine]}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardShell>
      </section>
    </div>
  );
}

const ACCENT = "#3B1E8A";

function KpiCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white px-6 py-5 transition-colors duration-150 hover:border-zinc-300"
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="text-4xl font-semibold tracking-tight tabular-nums text-zinc-950">
        {value}
      </p>
    </Link>
  );
}

function CardShell({
  title,
  action,
  children,
  className,
  noPadding,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.02]",
        className
      )}
    >
      <header className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-4">
        <h2 className="text-base font-bold tracking-tight text-zinc-950">{title}</h2>
        {action}
      </header>
      <div className={cn(noPadding ? "" : "p-5")}>{children}</div>
    </section>
  );
}

function ChartLegend({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">{label}</p>
      <p className="mt-0.5 text-base font-bold tracking-tight text-zinc-950">{value}</p>
    </div>
  );
}

function PresupuestoStatusChip({ status }: { status: keyof typeof presupuestoStatusLabels }) {
  const styles: Record<keyof typeof presupuestoStatusLabels, { color: string; icon: typeof Clock }> = {
    draft: { color: "bg-zinc-100 text-zinc-900", icon: FileText },
    sent: { color: "bg-amber-50 text-amber-700", icon: Clock },
    accepted: { color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    rejected: { color: "bg-rose-50 text-rose-700", icon: Circle },
  };
  const cfg = styles[status] ?? styles.draft;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("rounded-md border-transparent font-semibold", cfg.color)}>
      <Icon className="size-3" />
      {presupuestoStatusLabels[status]}
    </Badge>
  );
}
