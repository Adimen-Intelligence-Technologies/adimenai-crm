"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { useSidebar } from "./sidebar-context";

export function SidebarHeader() {
  const { open, toggle } = useSidebar();

  return (
    <div className="flex h-16 items-center justify-between border-b border-border px-4">
      <Logo collapsed={!open} variant="dark" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        {open ? <PanelLeftClose /> : <PanelLeftOpen />}
      </Button>
    </div>
  );
}
