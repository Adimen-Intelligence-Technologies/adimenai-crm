"use client";

import { usePathname } from "next/navigation";
import { getBreadcrumb } from "@/lib/nav";
import { TopbarActions } from "./topbar-actions";
import { TopbarSearch } from "./topbar-search";

export function Topbar() {
  const pathname = usePathname();
  const title = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="hidden text-xs text-muted-foreground sm:block">
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
