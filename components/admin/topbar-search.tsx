"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopbarSearch() {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Buscar clientes, tareas, embudos…"
        className="h-9 w-full pl-9"
        aria-label="Búsqueda global"
      />
    </div>
  );
}
