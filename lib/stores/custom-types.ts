"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomTypeIcon } from "@/lib/schemas/client";

export type CustomTypeDef = {
  label: string;
  icon: CustomTypeIcon;
};

type State = {
  types: CustomTypeDef[];
  add: (label: string, icon: CustomTypeIcon) => void;
};

export const useCustomTypes = create<State>()(
  persist(
    (set) => ({
      types: [],
      add: (label, icon) =>
        set((s) => {
          if (s.types.some((t) => t.label === label)) return s;
          return { types: [...s.types, { label, icon }] };
        }),
    }),
    { name: "adimen-custom-types" }
  )
);
