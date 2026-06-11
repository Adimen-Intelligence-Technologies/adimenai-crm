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
        "group relative flex items-center gap-2.5 rounded-md py-1.5 pr-2.5 text-[13px] font-medium transition-colors duration-150",
        isActive
          ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
          : "text-zinc-900 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]",
        !open && "justify-center"
      )}
      style={open ? { paddingLeft: `${10 + depth * 12}px` } : undefined}
    >
      <item.icon
        className={cn(
          "size-[15px] shrink-0 transition-colors",
          isActive
            ? "text-[#3B1E8A]"
            : "text-zinc-500 group-hover:text-[#3B1E8A]"
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
