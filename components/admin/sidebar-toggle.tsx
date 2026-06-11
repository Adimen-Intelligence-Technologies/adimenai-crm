"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";

export function SidebarToggle() {
  const { open, toggle } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      className="text-zinc-700 hover:bg-[#3B1E8A]/10 hover:text-[#3B1E8A]"
    >
      {open ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
    </Button>
  );
}
