import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-zinc-200/80 bg-white px-3 py-1 text-sm transition-colors outline-none",
        "placeholder:text-zinc-400",
        "focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-rose-300 aria-invalid:ring-2 aria-invalid:ring-rose-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
