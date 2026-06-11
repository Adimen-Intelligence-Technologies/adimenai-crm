"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopbarSearch() {
  return (
    <div className="group relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-600"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Buscar en el panel…"
        className="h-9 w-full border-zinc-200/80 bg-zinc-100/60 pl-9 text-[13px] placeholder:text-zinc-400 focus-visible:bg-white"
        aria-label="Búsqueda global"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-0.5 rounded border border-zinc-200/80 bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-400 sm:inline-flex">
        ⌘K
      </kbd>
    </div>
  );
}
