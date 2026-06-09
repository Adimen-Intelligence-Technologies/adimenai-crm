"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopbarSearch() {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Buscar contactos, tareas, embudos…"
        className="h-10 w-full rounded-full border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:bg-white"
        aria-label="Búsqueda global"
      />
    </div>
  );
}
