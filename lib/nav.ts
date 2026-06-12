import { Activity, Briefcase, Database, DollarSign, Folder, LayoutDashboard, ListChecks, Megaphone, Server, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  folder?: boolean;
  folderIcon?: LucideIcon;
  items: (NavItem | NavGroup)[];
};

export const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Tareas",
    folder: true,
    folderIcon: Folder,
    items: [
      { label: "Gestión administrativa", href: "/admin/tasks", icon: ListChecks },
    ],
  },
  {
    label: "Comercial",
    folder: true,
    folderIcon: Folder,
    items: [
      { label: "Actividades", href: "/admin/activities", icon: Activity },
      { label: "Comerciales", href: "/admin/sales-agents", icon: Briefcase },
    ],
  },
  {
    label: "Financiero",
    folder: true,
    folderIcon: Folder,
    items: [
      { label: "Presupuestos", href: "/admin/presupuestos", icon: DollarSign },
    ],
  },

  {
    label: "Gestión BBDD",
    folder: true,
    folderIcon: Database,
    items: [
      { label: "Gestión Servicios", href: "/admin/gestion-servicios", icon: Server },
      { label: "Contactos", href: "/admin/clients", icon: Users },
    ],
  },
];

function flattenItems(items: (NavItem | NavGroup)[]): NavItem[] {
  const result: NavItem[] = [];
  for (const item of items) {
    if ("href" in item) {
      result.push(item);
    } else {
      result.push(...flattenItems(item.items));
    }
  }
  return result;
}

export function getBreadcrumb(pathname: string): string {
  const all = flattenItems(navGroups.flatMap((g) => g.items));
  const match = all.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(item.href + "/")
  );
  return match?.label ?? "Panel";
}
