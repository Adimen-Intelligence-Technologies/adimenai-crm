import { ListChecks, Users, type LucideIcon } from "lucide-react";

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
      { label: "Clientes", href: "/admin/clients", icon: Users },
      { label: "Tareas", href: "/admin/tasks", icon: ListChecks },
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
