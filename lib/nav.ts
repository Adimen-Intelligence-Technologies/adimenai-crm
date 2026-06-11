import { Database, DollarSign, Folder, ListChecks, Megaphone, Server, Users, type LucideIcon } from "lucide-react";

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
    label: "4. Comité administrativo",
    folder: true,
    folderIcon: Folder,
    items: [
      { label: "Gestión administrativa", href: "/admin/tasks", icon: ListChecks },
    ],
  },
  {
    label: "5. Financiero",
    folder: true,
    folderIcon: Folder,
    items: [
      { label: "Presupuestos", href: "/admin/presupuestos", icon: DollarSign },
    ],
  },
  {
    label: "6. Marketing",
    items: [{ label: "6. Marketing", href: "/admin/marketing", icon: Megaphone }],
  },
  {
    label: "8. Contactos",
    items: [{ label: "8. Contactos", href: "/admin/clients", icon: Users }],
  },
  {
    label: "Gestión BBDD",
    folder: true,
    folderIcon: Database,
    items: [
      { label: "Gestión Servicios", href: "/admin/gestion-servicios", icon: Server },
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
