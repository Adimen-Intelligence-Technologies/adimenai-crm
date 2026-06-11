import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
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
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200/80 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-500">{label}</span>
        <span className="flex size-7 items-center justify-center rounded-md bg-[#3B1E8A]/10 text-[#3B1E8A]">
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums text-zinc-950">{value}</p>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[12px] font-medium",
          positive ? "text-emerald-600" : "text-rose-600"
        )}
      >
        {positive ? (
          <ArrowUpRight className="size-3" />
        ) : (
          <ArrowDownRight className="size-3" />
        )}
        {positive ? "+" : ""}
        {delta}% vs mes anterior
      </span>
    </div>
  );
}
