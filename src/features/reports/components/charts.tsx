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
  RETURN: "#d97706",
};

export function MovementsChart({ data }: { data: MovementByType[] }) {
  const rows = data.map((d) => ({
    label: MOVEMENT_LABELS[d.type] ?? d.type,
    qty: d.total_qty,
    type: d.type,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="label" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip
          formatter={(v) => [`${v} หน่วย`, "จำนวน"]}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="qty" radius={[6, 6, 0, 0]}>
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
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" allowDecimals={false} fontSize={12} />
        <YAxis type="category" dataKey="category" width={110} fontSize={12} />
        <Tooltip
          formatter={(v) => [`${v} หน่วย`, "คงเหลือ"]}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="stock" fill="#2563eb" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
