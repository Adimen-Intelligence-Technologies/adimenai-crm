"use client";

import { useState, useRef, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Check, ChevronDown, Search, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  herrikonektTypeEnum,
  herrikonektTypeIcons,
  herrikonektTypeLabels,
  type CustomTypeIcon,
  type HerrikonektType,
} from "@/lib/schemas/client";
type CustomType = {
  label: string;
  icon: CustomTypeIcon;
};

type Props = {
  value: string;
  onChange: (value: string, customType?: CustomType) => void;
  placeholder?: string;
  id?: string;
  customTypes?: CustomType[];
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
};

export function TypeCombobox({ value, onChange, placeholder, id, customTypes = [], clearable = false, clearLabel = "Todas las categorías", onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const predefinedOptions = herrikonektTypeEnum.options
    .map((t) => ({
      id: t,
      label: herrikonektTypeLabels[t],
      isCustom: false as const,
      iconName: undefined as string | undefined,
      iconComponent: herrikonektTypeIcons[t],
    }));

  const customOptions = customTypes.map((ct) => ({
    id: ct.label,
    label: ct.label,
    isCustom: true as const,
    iconName: ct.icon,
    iconComponent: LucideIcons[ct.icon as keyof typeof LucideIcons] as
      | React.ComponentType<{ className?: string }>
      | undefined,
  }));

  const allOptions = [...predefinedOptions, ...customOptions];

  const selected = allOptions.find((o) => o.id === value);

  const filtered = allOptions.filter((o) =>
    query.trim()
      ? o.label.toLowerCase().includes(query.trim().toLowerCase())
      : true
  );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function selectOption(id: string, customType?: CustomType) {
    onChange(id, customType);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-0">
        <button
          type="button"
          id={id}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) setTimeout(() => inputRef.current?.focus(), 0);
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-9 flex-1 items-center justify-between rounded-l-md border border-r-0 border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            !selected && "text-zinc-400"
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected ? (
              <>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500">
                  {selected.isCustom && selected.iconComponent ? (
                    <selected.iconComponent className="size-3" />
                  ) : !selected.isCustom ? (
                    (() => {
                      const Icon = selected.iconComponent;
                      return Icon ? <Icon className="size-3" /> : null;
                    })()
                  ) : null}
                </span>
                <span className="truncate text-zinc-900">{selected.label}</span>
              </>
            ) : (
              <span>{placeholder ?? "Selecciona…"}</span>
            )}
          </span>
          <span className="flex items-center gap-0.5">
            {clearable && selected && (
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onClear?.();
                }}
                aria-label="Limpiar categoría"
                className="flex size-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-zinc-400 transition-transform",
                open && "rotate-180"
              )}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
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
                  if (e.key === "Escape") { setOpen(false); setQuery(""); }
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    selectOption(filtered[0].id);
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-64 overflow-y-auto p-1">
            {clearable && (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!selected}
                  onClick={() => {
                    onClear?.();
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors",
                    !selected
                      ? "bg-[#3B1E8A]/10 text-[#3B1E8A]"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md border",
                      !selected
                        ? "border-[#3B1E8A]/20 bg-white text-[#3B1E8A]"
                        : "border-zinc-200 bg-zinc-50 text-zinc-500"
                    )}
                  >
                    <Layers className="size-3.5" />
                  </span>
                  <span className="flex-1 truncate">{clearLabel}</span>
                  {!selected && <Check className="size-3.5 shrink-0 text-[#3B1E8A]" />}
                </button>
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500">
                Sin resultados para «{query}».
              </li>
            ) : (
              filtered.map((o) => {
                const isSelected = o.id === value;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        if (o.isCustom) {
                          const ct = customTypes.find((c) => c.label === o.id);
                          selectOption(o.id, ct);
                        } else {
                          selectOption(o.id);
                        }
                      }}
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
                        {o.isCustom && o.iconComponent ? (
                          <o.iconComponent className="size-3.5" />
                        ) : !o.isCustom && o.iconComponent ? (
                          <o.iconComponent className="size-3.5" />
                        ) : null}
                      </span>
                      <span className="flex-1 truncate">
                        {o.label}
                        {o.isCustom && (
                          <span className="ml-1.5 text-[10px] text-zinc-400">(personalizada)</span>
                        )}
                      </span>
                      {isSelected && <Check className="size-3.5 shrink-0 text-[#3B1E8A]" />}
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
