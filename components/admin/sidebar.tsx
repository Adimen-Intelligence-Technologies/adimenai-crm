"use client";

import { cn } from "@/lib/utils";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-context";

export function Sidebar() {
  const { open } = useSidebar();

  return (
    <aside
      aria-label="Menú lateral"
      className={cn(
        "relative hidden h-screen shrink-0 flex-col border-r border-white/10 bg-[#1C1135] text-white transition-[width] duration-200 ease-out md:flex",
        open ? "w-64" : "w-[68px]"
      )}
    >
      <SidebarHeader />
      <SidebarNav />
      <div className="border-t border-white/10 p-3">
        <SidebarFooter />
      </div>
    </aside>
  );
}
