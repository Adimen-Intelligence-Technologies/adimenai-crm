"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxItem = {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  items: ComboboxItem[];
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  /** Permite limpiar y dejar el filtro en "todos" pasando string vacío */
  clearable?: boolean;
  clearLabel?: string;
};

export function SearchableCombobox({
  value,
  onChange,
  items,
  placeholder = "Buscar…",
  emptyLabel = "Sin resultados",
  className,
  disabled,
  clearable = true,
  clearLabel = "Todos",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = items.find((i) => i.value === value) ?? null;

  const filtered = query.trim()
    ? items.filter((i) => {
        const q = query.trim().toLowerCase();
        return (
          i.label.toLowerCase().includes(q) ||
          (i.sublabel?.toLowerCase().includes(q) ?? false)
        );
      })
    : items;

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function select(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-1.5 rounded-md border bg-white px-2.5 text-left text-[13px] shadow-xs transition-colors",
          "border-zinc-200/80 hover:border-zinc-300",
          "focus-visible:border-[#3B1E8A] focus-visible:ring-[#3B1E8A]/20 focus-visible:ring-2",
          open && "border-[#3B1E8A] ring-2 ring-[#3B1E8A]/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {selected ? (
            <>
              {selected.icon}
              <span className="truncate font-medium text-zinc-900">
                {selected.label}
              </span>
              {selected.badge}
            </>
          ) : (
            <span className="text-zinc-500">{placeholder}</span>
          )}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          {selected && clearable && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                select("");
              }}
              className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="size-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-3 text-zinc-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-50 mt-1 w-full min-w-[14rem] overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-200 p-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex h-7 w-full rounded-sm border border-zinc-200 bg-white pl-7 pr-7 text-xs outline-none focus:border-[#3B1E8A]"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    setQuery("");
                  }
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    select(filtered[0].value);
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-64 overflow-y-auto p-1">
            {clearable && (
              <li>
                <button
                  type="button"
                  onClick={() => select("")}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
                    !value
                      ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                      : "text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400">
                    ·
                  </span>
                  <span className="flex-1 truncate font-medium">{clearLabel}</span>
                  {!value && <Check className="size-3 shrink-0 text-[#3B1E8A]" />}
                </button>
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-zinc-500">
                {emptyLabel}
              </li>
            ) : (
              filtered.map((item) => {
                const isSelected = item.value === value;
                return (
                  <li key={item.value || "__empty"}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => select(item.value)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                          : "text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      {item.icon ? (
                        <span className="flex size-5 shrink-0 items-center justify-center">
                          {item.icon}
                        </span>
                      ) : (
                        <span className="size-5 shrink-0" />
                      )}
                      <span className="flex-1 truncate">
                        <span className="font-medium">{item.label}</span>
                        {item.sublabel && (
                          <span className="ml-1.5 text-[11px] text-zinc-500">
                            {item.sublabel}
                          </span>
                        )}
                      </span>
                      {item.badge}
                      {isSelected && (
                        <Check className="size-3 shrink-0 text-[#3B1E8A]" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
