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
        "group relative flex items-center gap-2.5 rounded-lg py-2 pr-2.5 text-[13px] font-medium transition-all duration-200",
        isActive
          ? "bg-[#3B1E8A] text-white shadow-sm shadow-[#3B1E8A]/25"
          : "text-zinc-900 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]",
        !open && "justify-center"
      )}
      style={open ? { paddingLeft: `${12 + depth * 14}px` } : undefined}
    >
      {isActive && open && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
      )}
      <item.icon
        className={cn(
          "size-[15px] shrink-0 transition-all duration-200 group-hover:scale-110",
          isActive
            ? "text-white"
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
