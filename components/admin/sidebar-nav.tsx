"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import { useSidebar } from "./sidebar-context";

export function SidebarNav() {
  const { open } = useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav aria-label="Navegación principal" className="flex flex-col gap-6">
        {navGroups.map((group) => {
          const isFolder = group.folder && open;

          return (
            <div key={group.label} className="flex flex-col gap-1">
              {isFolder && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGroups((prev) => ({
                      ...prev,
                      [group.label]: !prev[group.label],
                    }))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "text-white/70 hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  {group.folderIcon && (
                    <group.folderIcon className="size-[18px] shrink-0 text-white/60" />
                  )}
                  <span className="flex-1 truncate text-left">
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-white/40 transition-transform",
                      expandedGroups[group.label] && "rotate-180"
                    )}
                  />
                </button>
              )}

              {(!isFolder || expandedGroups[group.label]) && (
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <NavLink item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
