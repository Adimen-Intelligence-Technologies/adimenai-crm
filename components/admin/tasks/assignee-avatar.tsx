import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/schemas/sales-agent";

type Size = "sm" | "md";

const sizeClasses: Record<Size, { box: string; text: string }> = {
  sm: { box: "size-5", text: "text-[10px]" },
  md: { box: "size-7", text: "text-xs" },
};

export type AssigneeLike = {
  name: string;
  color: string;
};

export function AssigneeAvatar({
  assignee,
  size = "sm",
  showName = false,
  className,
}: {
  assignee: AssigneeLike | null | undefined;
  size?: Size;
  showName?: boolean;
  className?: string;
}) {
  const sizes = sizeClasses[size];

  if (!assignee) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400",
            sizes.box
          )}
          aria-label="Sin asignar"
          title="Sin asignar"
        >
          ?
        </span>
        {showName && <span className="text-xs text-zinc-500">Sin asignar</span>}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
          sizes.box,
          sizes.text
        )}
        style={{ backgroundColor: assignee.color }}
        aria-label={assignee.name}
        title={assignee.name}
      >
        {getInitials(assignee.name)}
      </span>
      {showName && (
        <span className="text-xs text-zinc-700">{assignee.name}</span>
      )}
    </span>
  );
}

