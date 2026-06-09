import { cn } from "@/lib/utils";
import {
  taskAssigneeColors,
  taskAssigneeInitials,
  taskAssigneeLabels,
  type TaskAssignee,
} from "@/lib/schemas/task";

type Size = "sm" | "md";

const sizeClasses: Record<Size, { box: string; text: string }> = {
  sm: { box: "size-5", text: "text-[10px]" },
  md: { box: "size-7", text: "text-xs" },
};

export function AssigneeAvatar({
  assignee,
  size = "sm",
  showName = false,
  className,
}: {
  assignee: TaskAssignee;
  size?: Size;
  showName?: boolean;
  className?: string;
}) {
  const color = taskAssigneeColors[assignee];
  const initials = taskAssigneeInitials[assignee];
  const sizes = sizeClasses[size];

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
          sizes.box,
          sizes.text
        )}
        style={{ backgroundColor: color }}
        aria-label={taskAssigneeLabels[assignee]}
        title={taskAssigneeLabels[assignee]}
      >
        {initials}
      </span>
      {showName && (
        <span className="text-xs text-zinc-700">
          {taskAssigneeLabels[assignee]}
        </span>
      )}
    </span>
  );
}
