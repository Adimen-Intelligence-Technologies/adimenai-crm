"use client";

import { Logo } from "./logo";
import { useSidebar } from "./sidebar-context";

export function SidebarHeader() {
  const { open } = useSidebar();

  return (
    <div className="flex h-14 items-center border-b border-zinc-200/80 px-4 md:h-16">
      <Logo collapsed={!open} variant="dark" />
    </div>
  );
}
