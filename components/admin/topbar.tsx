"use client";

import { SidebarToggle } from "./sidebar-toggle";
import { TopbarSearch } from "./topbar-search";
import { TopbarActions } from "./topbar-actions";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200/80 bg-white/80 px-3 backdrop-blur-sm sm:gap-3 sm:px-4 md:h-16 md:gap-4 md:px-6">
      <SidebarToggle />
      <div className="hidden flex-1 md:flex md:max-w-md">
        <TopbarSearch />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <TopbarActions />
      </div>
    </header>
  );
}
