"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CUSTOM_TYPE_ICONS, type CustomTypeIcon } from "@/lib/schemas/client";
import { cn } from "@/lib/utils";

type Props = {
  onConfirm: (name: string, icon: CustomTypeIcon) => void;
};

export function CustomTypeDialog({ onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<CustomTypeIcon>("Star");
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio");
      return;
    }
    onConfirm(trimmed, selectedIcon);
    setName("");
    setSelectedIcon("Star");
    setError(null);
    setOpen(false);
  }

  function handleClose() {
    setOpen(false);
    setName("");
    setSelectedIcon("Star");
    setError(null);
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        className="shrink-0 text-zinc-400 hover:text-zinc-900"
        aria-label="Crear categoría personalizada"
      >
        <Plus className="size-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Nueva categoría personalizada</h2>
          <button type="button" onClick={handleClose} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              Nombre de la categoría
            </label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              placeholder="Ej: Clínica dental"
              className={cn(error && "border-rose-400")}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">
              Icono
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {CUSTOM_TYPE_ICONS.map((iconName) => {
                const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as
                  | React.ComponentType<{ className?: string }>
                  | undefined;
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-md border transition-colors",
                      isSelected
                        ? "border-[#3B1E8A] bg-[#3B1E8A]/10 text-[#3B1E8A]"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                    )}
                    title={iconName}
                  >
                    {IconComponent ? (
                      <IconComponent className="size-4" />
                    ) : (
                      <span className="text-[10px]">{iconName[0]}</span>
                    )}
                    {isSelected && (
                      <Check className="absolute -right-1 -top-1 size-3 text-[#3B1E8A]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleConfirm} className="bg-[#3B1E8A] text-white hover:bg-[#2D1666]">
              Crear categoría
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
