"use client";

import { usePathname } from "next/navigation";
import { getBreadcrumb } from "@/lib/nav";
import { SidebarToggle } from "./sidebar-toggle";
import { TopbarActions } from "./topbar-actions";
import { TopbarSearch } from "./topbar-search";

export function Topbar() {
  const pathname = usePathname();
  const title = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 md:px-6">
      <SidebarToggle />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
        <p className="hidden text-xs text-zinc-500 sm:block">
          Gestiona tu empresa desde un solo lugar
        </p>
      </div>
      <div className="hidden flex-1 md:flex">
        <TopbarSearch />
      </div>
      <TopbarActions />
    </header>
  );
}
