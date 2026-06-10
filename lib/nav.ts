import { Folder, ListChecks, Megaphone, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  folder?: boolean;
  folderIcon?: LucideIcon;
  items: NavItem[];
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
    label: "6. Marketing",
    items: [{ label: "6. Marketing", href: "/admin/marketing", icon: Megaphone }],
  },
  {
    label: "8. Contactos",
    items: [{ label: "8. Contactos", href: "/admin/clients", icon: Users }],
  },
  {
    label: "14. Know-How",
    folder: true,
    folderIcon: Folder,
    items: [],
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
