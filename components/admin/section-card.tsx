import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, description, action, children, className }: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-zinc-200/80 bg-white",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-3.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-950">
            {title}
          </h3>
          {description && <p className="text-[12px] text-zinc-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
