"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  draft: "#A1A1AA",
  sent: "#F59E0B",
  accepted: "#10B981",
  rejected: "#EF4444",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export function ChartStatusDonut({
  data,
  height = 260,
}: {
  data: Record<string, number>;
  height?: number;
}) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      key,
      name: STATUS_LABELS[key] ?? key,
      value,
      color: STATUS_COLORS[key] ?? "#A1A1AA",
    }));

  const total = entries.reduce((acc, e) => acc + e.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-zinc-500"
        style={{ height }}
      >
        Sin datos
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entries}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {entries.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E4E4E7",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold tracking-tight text-zinc-950 tabular-nums">
            {total}
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
            Total
          </p>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {entries.map((e) => {
          const pct = Math.round((e.value / total) * 100);
          return (
            <li key={e.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: e.color }}
                />
                <span className="text-sm font-semibold text-zinc-900">{e.name}</span>
              </div>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-sm font-bold text-zinc-950">{e.value}</span>
                <span className="text-[11px] text-zinc-500">{pct}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
