"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CategoryStockItem, MovementByType } from "@/types";

const MOVEMENT_LABELS: Record<string, string> = {
  IN: "รับเข้า",
  OUT: "จ่ายออก",
  RETURN: "รับคืน",
};
const MOVEMENT_COLORS: Record<string, string> = {
  IN: "#16a34a",
  OUT: "#dc2626",
  RETURN: "#f59e0b",
};

function ChartTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
  suffix: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      {label && <p className="mb-1 text-xs font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs">
          <span className="font-semibold">{entry.value.toLocaleString()}</span>
          <span className="ml-1 text-muted-foreground">{suffix}</span>
        </p>
      ))}
    </div>
  );
}

export function MovementsChart({ data }: { data: MovementByType[] }) {
  const rows = data.map((d) => ({
    label: MOVEMENT_LABELS[d.type] ?? d.type,
    qty: d.total_qty,
    type: d.type,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          allowDecimals={false}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={<ChartTooltip suffix="หน่วย" />}
        />
        <Bar dataKey="qty" radius={[8, 8, 0, 0]} maxBarSize={80}>
          {rows.map((r) => (
            <Cell key={r.type} fill={MOVEMENT_COLORS[r.type] ?? "#2563eb"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StockByCategoryChart({ data }: { data: CategoryStockItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          horizontal={false}
        />
        <XAxis
          type="number"
          allowDecimals={false}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          type="category"
          dataKey="category"
          width={120}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={<ChartTooltip suffix="หน่วย" />}
        />
        <Bar
          dataKey="stock"
          fill="var(--primary)"
          radius={[0, 8, 8, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
