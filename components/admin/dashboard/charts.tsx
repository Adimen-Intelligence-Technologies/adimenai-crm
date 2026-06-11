"use client";

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";

const ACCENT = "#3B1E8A";

function formatEURShort(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(".", ",")}M €`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")}k €`;
  return `${Math.round(n)} €`;
}

function formatEURFull(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCount(n: number): string {
  return `${n} presupuesto${n === 1 ? "" : "s"}`;
}

export type MonthDatum = {
  label: string;
  count: number;
  amount: number;
  amountLabel: string;
  countLabel: string;
  amountShort: string;
};

export function ChartMonthlyAmount({
  data,
  height = 260,
}: {
  data: MonthDatum[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-amount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
        <XAxis dataKey="label" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#71717A"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatEURShort(v)}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: "#A1A1AA", strokeDasharray: "3 3" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E4E4E7",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            fontSize: 12,
          }}
          formatter={(value) => [formatEURFull(Number(value) || 0), "Importe"]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          name="Importe"
          stroke={ACCENT}
          strokeWidth={2.5}
          fill="url(#fill-amount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ChartMonthlyCount({
  data,
  height = 240,
}: {
  data: MonthDatum[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
        <XAxis dataKey="label" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#71717A"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "#F4F4F5" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E4E4E7",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            fontSize: 12,
          }}
          formatter={(value) => [formatCount(Number(value) || 0), "Presupuestos"]}
        />
        <Bar dataKey="count" name="Presupuestos" fill={ACCENT} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export type BusinessLineDatum = {
  id: "adimenai" | "herrikonekt" | "hiopos";
  label: string;
  value: number;
  color: string;
};

export function ChartBusinessLines({
  data,
  height = 200,
}: {
  data: BusinessLineDatum[];
  height?: number;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E4E7" />
          <XAxis
            type="number"
            stroke="#71717A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#71717A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={92}
          />
          <Tooltip
            cursor={{ fill: "#F4F4F5" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E4E4E7",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: 12,
            }}
            formatter={(value) => [
              `${value} contacto${Number(value) === 1 ? "" : "s"}`,
              "Total",
            ]}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((d) => (
              <Cell key={d.id} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <ul className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.id} className="flex flex-col items-start gap-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                  {d.label}
                </span>
              </div>
              <p className="font-mono text-xl font-bold tabular-nums text-zinc-950">
                {d.value}
              </p>
              <p className="text-[11px] text-zinc-500">{pct}% del total</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
