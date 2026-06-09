import { cn } from "@/lib/utils";
import {
  taskScopeLabels,
  type TaskScope,
} from "@/lib/schemas/task";

const scopeStyles: Record<TaskScope, string> = {
  adimenai: "bg-[#6D28D9] text-white border-[#6D28D9]",
  herrikonekt: "bg-emerald-600 text-white border-emerald-600",
  hiopos: "bg-red-600 text-white border-red-600",
  general: "bg-zinc-200 text-zinc-700 border-zinc-200",
};

export function ScopeBadge({
  scope,
  className,
}: {
  scope: TaskScope;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        scopeStyles[scope],
        className
      )}
    >
      {taskScopeLabels[scope]}
    </span>
  );
}
