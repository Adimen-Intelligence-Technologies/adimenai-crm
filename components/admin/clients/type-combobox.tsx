"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  herrikonektTypeEnum,
  herrikonektTypeIcons,
  herrikonektTypeLabels,
  type HerrikonektType,
} from "@/lib/schemas/client";

type Props = {
  value: HerrikonektType;
  onChange: (value: HerrikonektType) => void;
  placeholder?: string;
  id?: string;
};

export function TypeCombobox({ value, onChange, placeholder, id }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = herrikonektTypeEnum.options
    .map((t) => ({ id: t, label: herrikonektTypeLabels[t] }))
    .find((o) => o.id === value);

  const options = herrikonektTypeEnum.options
    .map((t) => ({ id: t, label: herrikonektTypeLabels[t] }))
    .filter((o) =>
      query.trim()
        ? o.label.toLowerCase().includes(query.trim().toLowerCase())
        : true
    );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function selectOption(t: HerrikonektType) {
    onChange(t);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          !selected && "text-zinc-400"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500">
                {(() => {
                  const Icon = herrikonektTypeIcons[selected.id];
                  return <Icon className="size-3" />;
                })()}
              </span>
              <span className="truncate text-zinc-900">{selected.label}</span>
            </>
          ) : (
            <span>{placeholder ?? "Selecciona…"}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-zinc-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-200 p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tipo…"
                className="h-8 pl-8 pr-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    setQuery("");
                  }
                  if (e.key === "Enter" && options[0]) {
                    e.preventDefault();
                    selectOption(options[0].id);
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <ul
            className="max-h-64 overflow-y-auto p-1"
            role="presentation"
          >
            {options.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500">
                Sin resultados para «{query}».
              </li>
            ) : (
              options.map((o) => {
                const Icon = herrikonektTypeIcons[o.id];
                const isSelected = o.id === value;
                return (
                  <li key={o.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectOption(o.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                          : "text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-md border",
                          isSelected
                            ? "border-[#3B1E8A]/20 bg-white text-[#3B1E8A]"
                            : "border-zinc-200 bg-zinc-50 text-zinc-500"
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <span className="flex-1 truncate">{o.label}</span>
                      {isSelected && (
                        <Check className="size-3.5 shrink-0 text-[#3B1E8A]" />
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
