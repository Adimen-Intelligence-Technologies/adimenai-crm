import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  FileText,
  ListChecks,
  Receipt,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { businessLineLabels, type BusinessLine } from "@/lib/schemas/client";
import { businessLineTheme } from "@/lib/theme";
import { presupuestoStatusLabels } from "@/lib/schemas/presupuesto";
import { getDashboardMetrics } from "@/lib/repositories/dashboard";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  const now = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formattedAmount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(metrics.presupuestos.totalAmount);

  return (
    <div className="flex animate-fade-in flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <p className="text-xl font-medium capitalize">
          {now}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Buenos días, AdimenAi 👋
        </h1>
        
      </header>

      <section aria-labelledby="kpi-heading" className="flex flex-col gap-4">
        <h2 id="kpi-heading" className="sr-only">
          Indicadores clave
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Contactos totales"
            value={metrics.clients.total.toLocaleString("es-ES")}
            icon={Users}
            href="/admin/clients"
          />
          <KpiCard
            label="Presupuestos"
            value={metrics.presupuestos.total.toLocaleString("es-ES")}
            icon={Receipt}
            href="/admin/presupuestos"
          />
          <KpiCard
            label="Importe facturable"
            value={formattedAmount}
            icon={DollarSign}
            href="/admin/presupuestos"
          />
          <KpiCard
            label="Tareas abiertas"
            value={metrics.tasks.open.toLocaleString("es-ES")}
            icon={ListChecks}
            href="/admin/tasks"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="recent-presupuestos">
          <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-md bg-[#3B1E8A]/10 text-[#3B1E8A]">
                  <Receipt className="size-3.5" />
                </span>
                <div>
                  <h3 id="recent-presupuestos" className="text-sm font-semibold text-zinc-950">
                    Presupuestos recientes
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Últimos movimientos en el módulo financiero
                  </p>
                </div>
              </div>
              <Link
                href="/admin/presupuestos"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                Ver todos
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
            {metrics.presupuestos.recent.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-zinc-500">No hay presupuestos aún.</p>
                <Link
                  href="/admin/presupuestos/nuevo"
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#3B1E8A] hover:text-[#2D1666]"
                >
                  Crear el primero
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {metrics.presupuestos.recent.map((p) => {
                  const theme = businessLineTheme[p.businessLine as BusinessLine];
                  const statusKey = p.status as keyof typeof presupuestoStatusLabels;
                  return (
                    <li key={p._id}>
                      <Link
                        href={`/admin/presupuestos/${p._id}`}
                        className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-zinc-50/60"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-semibold text-zinc-500">
                              {p.number}
                            </span>
                            {theme && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                  theme.badge
                                )}
                              >
                                {businessLineLabels[p.businessLine as BusinessLine]}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-sm font-medium text-zinc-900 group-hover:text-[#3B1E8A]">
                            {p.title || "Sin título"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold tabular-nums text-zinc-900">
                            {new Intl.NumberFormat("es-ES", {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            }).format(p.total)}
                          </span>
                          <PresupuestoStatusChip status={statusKey} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="lines-breakdown">
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
            <div className="flex items-center gap-2.5 border-b border-zinc-200/80 px-5 py-3.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#3B1E8A]/10 text-[#3B1E8A]">
                <Building2 className="size-3.5" />
              </span>
              <div>
                <h3 id="lines-breakdown" className="text-sm font-semibold text-zinc-950">
                  Distribución por línea
                </h3>
                <p className="text-[11px] text-zinc-500">Contactos activos</p>
              </div>
            </div>
            <ul className="flex-1 divide-y divide-zinc-100">
              <LineRow
                label={businessLineLabels.adimenai}
                value={metrics.clients.byLine.adimenai}
                total={metrics.clients.total}
                color="bg-[#3B1E8A]"
              />
              <LineRow
                label={businessLineLabels.herrikonekt}
                value={metrics.clients.byLine.herrikonekt}
                total={metrics.clients.total}
                color="bg-emerald-600"
              />
              <LineRow
                label={businessLineLabels.hiopos}
                value={metrics.clients.byLine.hiopos}
                total={metrics.clients.total}
                color="bg-red-600"
              />
            </ul>
            <div className="border-t border-zinc-100 px-5 py-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-zinc-500">Total</span>
                <span className="font-semibold tabular-nums text-zinc-900">
                  {metrics.clients.total.toLocaleString("es-ES")}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="recent-clients" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="recent-clients" className="text-base font-semibold tracking-tight text-zinc-950">
              Contactos recientes
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Últimos contactos añadidos a la base de datos
            </p>
          </div>
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Ver todos
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
        {metrics.clients.recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-5 py-12 text-center">
            <p className="text-sm text-zinc-500">Aún no hay contactos registrados.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
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
                      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50/60"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 group-hover:text-[#3B1E8A]">
                          {c.name}
                        </p>
                        <p className="truncate text-[12px] text-zinc-500">{c.city || "—"}</p>
                      </div>
                      {theme && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            theme.badge
                          )}
                        >
                          {businessLineLabels[c.businessLine as BusinessLine]}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-zinc-200/80 bg-white p-5 transition-all duration-150 hover:border-zinc-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-500">{label}</span>
        <span className="flex size-7 items-center justify-center rounded-md bg-[#3B1E8A]/10 text-[#3B1E8A] transition-transform group-hover:scale-105">
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums text-zinc-950">{value}</p>
    </Link>
  );
}

function LineRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li className="px-5 py-3.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="tabular-nums font-semibold text-zinc-900">{value}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn("h-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

function PresupuestoStatusChip({ status }: { status: keyof typeof presupuestoStatusLabels }) {
  const styles: Record<keyof typeof presupuestoStatusLabels, { color: string; icon: typeof Clock }> = {
    draft: { color: "bg-zinc-100 text-zinc-600", icon: FileText },
    sent: { color: "bg-amber-50 text-amber-700", icon: Clock },
    accepted: { color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    rejected: { color: "bg-rose-50 text-rose-700", icon: Circle },
  };
  const cfg = styles[status] ?? styles.draft;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("rounded border-transparent font-medium", cfg.color)}>
      <Icon className="size-3" />
      {presupuestoStatusLabels[status]}
    </Badge>
  );
}
