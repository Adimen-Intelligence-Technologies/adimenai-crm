import { CheckCircle2, DollarSign, ListChecks, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { KpiCard } from "@/components/admin/kpi-card";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";

const kpis = [
  { label: "Clientes activos", value: "1.248", delta: 8.2, icon: Users },
  { label: "Embudos abiertos", value: "37", delta: 3.1, icon: ListChecks },
  { label: "Tareas pendientes", value: "92", delta: -4.5, icon: CheckCircle2 },
  { label: "Ingresos del mes", value: "$48.3K", delta: 12.4, icon: DollarSign },
];

const activity = [
  { initials: "MR", name: "María Rodríguez", action: "movió un cliente a Negociación", time: "hace 5 min" },
  { initials: "LC", name: "Luis Castillo", action: "cerró un trato por $3.200", time: "hace 22 min" },
  { initials: "AS", name: "Ana Sánchez", action: "creó la tarea “Llamar a ACME”", time: "hace 1 h" },
  { initials: "JR", name: "Javier Rojas", action: "actualizó el embudo de Ventas Q3", time: "hace 3 h" },
];

const tasks = [
  { title: "Llamar a ACME Corp.", tag: "Ventas", priority: "Alta" as const },
  { title: "Enviar propuesta a Northwind", tag: "Ventas", priority: "Media" as const },
  { title: "Revisar contrato con Beta Studio", tag: "Legal", priority: "Alta" as const },
  { title: "Onboarding de 3 clientes nuevos", tag: "Operación", priority: "Baja" as const },
];

const priorityStyle: Record<string, string> = {
  Alta: "bg-rose-50 text-rose-700 border-rose-100",
  Media: "bg-amber-50 text-amber-700 border-amber-100",
  Baja: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title="Panel"
        description="Resumen de la actividad de tu empresa"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus />
            Nuevo cliente
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Actividad reciente"
          description="Últimos movimientos del equipo"
        >
          <ul className="flex flex-col divide-y divide-border">
            {activity.map((a) => (
              <li key={a.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar size="sm" className="ring-1 ring-border">
                  <AvatarFallback className="bg-foreground text-background text-[11px] font-semibold">
                    {a.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    <span className="font-medium text-foreground">{a.name}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Próximas tareas"
          description="Pendientes para esta semana"
        >
          <ul className="flex flex-col gap-2.5">
            {tasks.map((t) => (
              <li
                key={t.title}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.tag}</p>
                </div>
                <Badge
                  variant="outline"
                  className={priorityStyle[t.priority]}
                >
                  {t.priority}
                </Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
