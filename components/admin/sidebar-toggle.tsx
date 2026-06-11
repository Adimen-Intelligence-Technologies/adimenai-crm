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
      className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    >
      {open ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
    </Button>
  );
}
