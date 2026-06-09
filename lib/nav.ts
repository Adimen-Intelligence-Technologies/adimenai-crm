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
    label: "3. Constitutivo y Comercial",
    items: [
      { label: "Clientes", href: "/admin/clients", icon: Users },
    ],
  },
  {
    label: "4. Comité administrativo",
    items: [
      { label: "Gestión administrativa", href: "/admin/tasks", icon: ListChecks },
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
