"use client";

import { SidebarToggle } from "./sidebar-toggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 md:px-6">
      <SidebarToggle />
    </header>
  );
}
