"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-context";

export function Sidebar() {
  const { open, setOpen, isMobile } = useSidebar();

  // Bloquear scroll del body cuando el drawer mobile está abierto
  useEffect(() => {
    if (!isMobile) return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMobile, open]);

  // En mobile: drawer con overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className={cn(
            "fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-200",
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
        />
        {/* Drawer */}
        <aside
          aria-label="Menú lateral"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#3B1E8A]/10 bg-white text-zinc-900 shadow-xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarHeader />
          <SidebarNav />
          <div className="border-t border-zinc-200/80 p-3">
            <SidebarFooter />
          </div>
        </aside>
      </>
    );
  }

  // En desktop: rail fijo a la izquierda
  return (
    <aside
      aria-label="Menú lateral"
      className={cn(
        "relative hidden h-screen shrink-0 flex-col border-r border-[#3B1E8A]/10 bg-gradient-to-b from-white via-white to-[#3B1E8A]/[0.03] text-zinc-900 transition-[width] duration-200 ease-out md:flex",
        open ? "w-64" : "w-[68px]"
      )}
    >
      <SidebarHeader />
      <SidebarNav />
      <div className="border-t border-zinc-200/80 p-3">
        <SidebarFooter />
      </div>
    </aside>
  );
}
