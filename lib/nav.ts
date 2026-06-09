import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  ListChecks,
  CalendarDays,
  BarChart3,
  Workflow,
  Plug,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { label: "Panel", href: "/admin", icon: LayoutDashboard },
      { label: "Clientes", href: "/admin/clients", icon: Users },
      { label: "Embudos", href: "/admin/pipelines", icon: KanbanSquare },
      { label: "Tareas", href: "/admin/tasks", icon: ListChecks },
      { label: "Calendario", href: "/admin/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Análisis",
    items: [
      { label: "Reportes", href: "/admin/reports", icon: BarChart3 },
      { label: "Automatizaciones", href: "/admin/automations", icon: Workflow },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Integraciones", href: "/admin/integrations", icon: Plug },
      { label: "Ajustes", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function getBreadcrumb(pathname: string): string {
  const all = navGroups.flatMap((g) => g.items);
  const match = all.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  );
  return match?.label ?? "Panel";
}
