"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { navGroups, navFlat } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import { useSidebar } from "./sidebar-context";

export function SidebarNav() {
  const { open } = useSidebar();
  const [expanded, setExpanded] = useState(true);

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
                  onClick={() => setExpanded((v) => !v)}
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
                      expanded && "rotate-180"
                    )}
                  />
                </button>
              )}

              {(!isFolder || expanded) && (
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

        {open && <Separator className="bg-white/5" />}

        <ul className="flex flex-col gap-0.5">
          {navFlat.map((item) => (
            <li key={item.href}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  );
}
