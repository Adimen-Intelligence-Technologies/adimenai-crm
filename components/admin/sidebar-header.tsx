"use client";

import { Logo } from "./logo";
import { useSidebar } from "./sidebar-context";

export function SidebarHeader() {
  const { open } = useSidebar();

  return (
    <div className="flex h-16 items-center border-b border-white/10 px-4">
      <Logo collapsed={!open} variant="light" />
    </div>
  );
}
