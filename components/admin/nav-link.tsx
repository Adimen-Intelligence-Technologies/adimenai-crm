"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";
import { useSidebar } from "./sidebar-context";

type Props = {
  item: NavItem;
  depth?: number;
};

export function NavLink({ item, depth = 0 }: Props) {
  const pathname = usePathname();
  const { open } = useSidebar();

  const isActive =
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  const link = (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-white/70 hover:bg-white/[0.08] hover:text-white",
        isActive && "bg-white/[0.10] text-white",
        !open && "justify-center px-0"
      )}
      style={open && depth > 0 ? { paddingLeft: `${12 + depth * 12}px` } : undefined}
    >
      <item.icon
        className={cn(
          "size-[18px] shrink-0",
          isActive
            ? "text-[#A18CFF]"
            : "text-white/60 group-hover:text-white"
        )}
      />
      {open && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (open) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
