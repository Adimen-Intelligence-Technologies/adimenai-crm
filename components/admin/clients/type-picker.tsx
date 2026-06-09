"use client";

import { cn } from "@/lib/utils";
import {
  herrikonektSubTypeByType,
  herrikonektTypeEnum,
  herrikonektTypeIcons,
  herrikonektTypeLabels,
  type HerrikonektType,
} from "@/lib/schemas/client";

type Props = {
  value: HerrikonektType;
  onChange: (value: HerrikonektType) => void;
};

export function TypePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Tipo de comercio"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {herrikonektTypeEnum.options.map((t) => {
          const Icon = herrikonektTypeIcons[t];
          const selected = t === value;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(t)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                selected
                  ? "border-[#3B1E8A] bg-[#3B1E8A]/5 text-[#3B1E8A]"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md border",
                  selected
                    ? "border-[#3B1E8A]/20 bg-white text-[#3B1E8A]"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500"
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="truncate font-medium">
                {herrikonektTypeLabels[t]}
              </span>
            </button>
          );
        })}
      </div>
      {herrikonektSubTypeByType[value] && (
        <p className="text-xs text-zinc-500">
          Subtipo disponible: {herrikonektSubTypeByType[value].length} opciones
        </p>
      )}
    </div>
  );
}
