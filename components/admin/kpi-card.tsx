import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
};

export function KpiCard({ label, value, delta, icon: Icon }: KpiCardProps) {
  const positive = delta >= 0;

  return (
    <Card className="gap-0 rounded-md border-zinc-200 py-5 shadow-none">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            {label}
          </span>
          <span className="text-2xl font-bold tracking-tight text-zinc-950">
            {value}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              positive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {positive ? "+" : ""}
            {delta}% vs mes anterior
          </span>
        </div>
        <span
          className="inline-flex size-10 items-center justify-center rounded-md bg-[#6C47FF]/10 text-[#6C47FF]"
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
