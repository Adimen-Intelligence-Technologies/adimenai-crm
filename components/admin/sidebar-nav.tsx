"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";
import { useSidebar } from "./sidebar-context";

export function SidebarNav() {
  const { open } = useSidebar();

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav aria-label="Navegación principal" className="flex flex-col gap-6">
        {navGroups.map((group, gi) => (
          <div key={group.label} className="flex flex-col gap-1">
            {open && (
              <h3
                className={cn(
                  "px-3 pb-2 text-[11px] font-semibold tracking-[0.08em] uppercase",
                  "text-white/40"
                )}
              >
                {group.label}
              </h3>
            )}
            {gi > 0 && open && <Separator className="mb-2 bg-white/5" />}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}
