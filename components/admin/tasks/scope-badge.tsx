import { cn } from "@/lib/utils";
import { businessLineTheme } from "@/lib/theme";

const knownScopes = ["adimenai", "herrikonekt", "hiopos"] as const;

export function ScopeBadge({
  scope,
  className,
}: {
  scope: string;
  className?: string;
}) {
  const key = scope.toLowerCase();
  const isKnown = knownScopes.includes(key as typeof knownScopes[number]);
  const theme = isKnown
    ? businessLineTheme[key as keyof typeof businessLineTheme]
    : null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        theme
          ? `${theme.badge} border-transparent`
          : "border-zinc-200 bg-zinc-100 text-zinc-700",
        className
      )}
    >
      {scope}
    </span>
  );
}
