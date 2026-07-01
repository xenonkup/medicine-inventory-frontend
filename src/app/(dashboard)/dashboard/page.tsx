"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Pill,
  AlertTriangle,
  Clock,
  TrendingDown,
  ArrowUpRight,
  PackagePlus,
  PackageMinus,
  RotateCcw,
  BarChart3,
  Activity,
  ArrowRight,
  Search,
  Download,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TablePager } from "@/components/shared/table-pager";
import { useClientTable } from "@/hooks/use-client-table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  StatCard,
} from "@/components/shared/stat-card";
import {
  SectionCard,
} from "@/components/shared/page-header";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  useDashboardSummary,
  useLowStock,
  useNearExpiry,
} from "@/features/dashboard/hooks";
import { useMonthlyReport, useStockByCategory } from "@/features/reports/hooks";
import { useTransactions } from "@/features/inventory/hooks";
import type { StockTransaction, NearExpiryItem, LowStockItem, CategoryStockItem, MovementByType } from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { exportToExcel } from "@/lib/export-excel";
import { ROUTES } from "@/lib/constants";

const quickActions = [
  {
    label: "รับเข้าคลัง",
    icon: PackagePlus,
    href: ROUTES.stockIn,
    color: "text-success",
    bg: "bg-success/10 hover:bg-success/15",
  },
  {
    label: "จ่ายออก",
    icon: PackageMinus,
    href: ROUTES.stockOut,
    color: "text-destructive",
    bg: "bg-destructive/10 hover:bg-destructive/15",
  },
  {
    label: "รับคืน",
    icon: RotateCcw,
    href: ROUTES.returns,
    color: "text-warning",
    bg: "bg-warning/10 hover:bg-warning/15",
  },
  {
    label: "รายงาน",
    icon: BarChart3,
    href: ROUTES.reports,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/15",
  },
];

const TX_CONFIG = {
  IN:     { icon: PackagePlus,  iconColor: "text-success",     iconBg: "bg-success/10",     label: "รับเข้า" },
  OUT:    { icon: PackageMinus, iconColor: "text-destructive",  iconBg: "bg-destructive/10", label: "จ่ายออก" },
  RETURN: { icon: RotateCcw,   iconColor: "text-primary",      iconBg: "bg-primary/10",     label: "รับคืน" },
} as const;

function txToTimelineItem(tx: StockTransaction) {
  const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.IN;
  const ref = tx.reference_no ? ` · อ้างอิง ${tx.reference_no}` : "";
  const elapsed = (() => {
    const diff = Math.floor((Date.now() - new Date(tx.created_at).getTime()) / 1000);
    if (diff < 60) return `${diff} วินาทีที่แล้ว`;
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  })();
  return {
    id: tx.id,
    icon: cfg.icon,
    iconColor: cfg.iconColor,
    iconBg: cfg.iconBg,
    title: `${cfg.label} ${tx.medicine_name}`,
    description: `ล็อต ${tx.lot_number}${ref} — ${tx.quantity} หน่วย`,
    time: elapsed,
  };
}

type DonutDatum = {
  name: string;
  value: number;
  color: string;
};

const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

const movementLabels: Record<string, string> = {
  IN: "รับเข้าคลัง",
  OUT: "จ่ายออก",
  RETURN: "รับคืน",
};

const movementColors: Record<string, string> = {
  IN: "#16a34a",
  OUT: "#dc2626",
  RETURN: "#f59e0b",
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DonutDatum }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="mt-0.5 text-muted-foreground">
        {item.value.toLocaleString()} หน่วย
      </p>
    </div>
  );
}

function DonutChartCard({
  data,
  isLoading,
}: {
  data?: DonutDatum[];
  isLoading?: boolean;
}) {
  const rows = data?.filter((item) => item.value > 0) ?? [];
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        ไม่มีข้อมูลสำหรับแสดงกราฟ
      </div>
    );
  }

  return (
    <div className="grid min-h-[220px] gap-5 md:grid-cols-[minmax(220px,0.9fr)_minmax(220px,1.1fr)] md:items-center">
      <div className="relative mx-auto h-[220px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<DonutTooltip />} />
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              stroke="var(--card)"
              strokeWidth={4}
            >
              {rows.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{total.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">รวม</span>
        </div>
      </div>
      <div className="grid gap-2">
        {rows.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-sm text-muted-foreground">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
          </div>
        ))}
        <div className="mt-1 rounded-xl bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {rows.length.toLocaleString()}
          </span>{" "}
          รายการ แสดงรวม{" "}
          <span className="font-medium text-foreground">
            {total.toLocaleString()}
          </span>{" "}
          หน่วย
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary } = useDashboardSummary();
  const { data: nearExpiry } = useNearExpiry();
  const { data: lowStock } = useLowStock();
  const { data: stockByCat, isLoading: isStockByCategoryLoading } = useStockByCategory();
  const { data: txData } = useTransactions();
  const recentTimeline = (txData?.items ?? []).slice(0, 5).map(txToTimelineItem);
  const currentDate = new Date();
  const { data: monthlyReport, isLoading: isMonthlyReportLoading } =
    useMonthlyReport(currentDate.getFullYear(), currentDate.getMonth() + 1);

  const expiryTable = useClientTable<NearExpiryItem>(nearExpiry ?? [], {
    searchableText: (i) => `${i.medicine_name} ${i.lot_number}`,
    initialPageSize: 10,
  });
  const lowStockTable = useClientTable<LowStockItem>(lowStock ?? [], {
    searchableText: (i) => `${i.code} ${i.name}`,
    initialPageSize: 10,
  });

  const [expirySelected, setExpirySelected] = useState<Set<string>>(new Set());
  const [lowSelected, setLowSelected] = useState<Set<string>>(new Set());

  const expiryPageKeys = expiryTable.pageItems.map((i) => `${i.medicine_id}-${i.lot_number}`);
  const isAllExpirySelected = expiryPageKeys.length > 0 && expiryPageKeys.every((k) => expirySelected.has(k));
  const toggleAllExpiry = () => {
    if (isAllExpirySelected) {
      setExpirySelected((p) => { const s = new Set(p); expiryPageKeys.forEach((k) => s.delete(k)); return s; });
    } else {
      setExpirySelected((p) => { const s = new Set(p); expiryPageKeys.forEach((k) => s.add(k)); return s; });
    }
  };
  const toggleExpiry = (key: string) =>
    setExpirySelected((p) => { const s = new Set(p); if (s.has(key)) { s.delete(key); } else { s.add(key); } return s; });

  const lowPageKeys = lowStockTable.pageItems.map((i) => i.medicine_id);
  const isAllLowSelected = lowPageKeys.length > 0 && lowPageKeys.every((k) => lowSelected.has(k));
  const toggleAllLow = () => {
    if (isAllLowSelected) {
      setLowSelected((p) => { const s = new Set(p); lowPageKeys.forEach((k) => s.delete(k)); return s; });
    } else {
      setLowSelected((p) => { const s = new Set(p); lowPageKeys.forEach((k) => s.add(k)); return s; });
    }
  };
  const toggleLow = (key: string) =>
    setLowSelected((p) => { const s = new Set(p); if (s.has(key)) { s.delete(key); } else { s.add(key); } return s; });
  const stockByCategoryDonut =
    stockByCat?.map((item: CategoryStockItem, index: number) => ({
      name: item.category,
      value: item.stock,
      color: chartColors[index % chartColors.length],
    })) ?? [];
  const movementDonut =
    monthlyReport?.movements.map((item: MovementByType) => ({
      name: movementLabels[item.type] ?? item.type,
      value: item.total_qty,
      color: movementColors[item.type] ?? "#2563eb",
    })) ?? [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            ภาพรวมรายวัน
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          สวัสดี, {user?.full_name ?? ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ยินดีต้อนรับกลับสู่ระบบบริหารคลังยา PharmaCare
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="รายการยาทั้งหมด"
          value={summary?.total_medicines ?? 0}
          icon={Pill}
          description="ยาในระบบทั้งหมด"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="ใกล้หมดอายุ"
          value={summary?.near_expiry_count ?? 0}
          icon={Clock}
          description={`ภายใน ${summary?.near_expiry_days ?? 180} วัน`}
          iconBg="bg-warning/10"
          iconColor="text-warning"
        />
        <StatCard
          title="สต็อกต่ำ"
          value={summary?.low_stock_count ?? 0}
          icon={TrendingDown}
          description="ต่ำกว่าจุดสั่งซื้อ"
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
        />
        <StatCard
          title="หมดอายุแล้ว"
          value={0}
          icon={AlertTriangle}
          description="ต้องจัดการทิ้ง"
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
        />
        <StatCard
          title="เคลื่อนไหววันนี้"
          value={summary?.today_movements ?? 0}
          icon={Activity}
          description="รับ-จ่าย-รับคืน"
          iconBg="bg-success/10"
          iconColor="text-success"
        />
      </div>

      {/* Donut Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="สต็อกแยกตามหมวดหมู่"
          description="สัดส่วนยอดคงเหลือปัจจุบันของแต่ละหมวดหมู่"
        >
          <DonutChartCard
            data={stockByCategoryDonut}
            isLoading={isStockByCategoryLoading}
          />
        </SectionCard>

        <SectionCard
          title="ความเคลื่อนไหวเดือนนี้"
          description="สัดส่วนจำนวนรับเข้า จ่ายออก และรับคืน"
        >
          <DonutChartCard
            data={movementDonut}
            isLoading={isMonthlyReportLoading}
          />
        </SectionCard>
      </div>

      {/* Tables */}
      <div className="grid gap-6">

        {/* Near Expiry */}
        <SectionCard
          title="ยาใกล้หมดอายุ"
          description={`ภายใน ${summary?.near_expiry_days ?? 180} วัน`}
          action={
            <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs"
              disabled={!nearExpiry?.length}
              onClick={() => {
                const src = (nearExpiry ?? []) as NearExpiryItem[];
                const exportData = expirySelected.size > 0
                  ? src.filter((it: NearExpiryItem) => expirySelected.has(`${it.medicine_id}-${it.lot_number}`))
                  : src;
                exportToExcel([{
                  name: "ยาใกล้หมดอายุ",
                  headers: ["#", "ยา", "ล็อต", "หมดอายุ", "เหลือ (หน่วย)", "วันที่เหลือ"],
                  rows: exportData.map((it: NearExpiryItem, i: number) => [i + 1, it.medicine_name, it.lot_number, it.expiry_date, it.qty_remaining, it.days_left]),
                }], "near_expiry");
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {expirySelected.size > 0 ? `Excel (${expirySelected.size})` : "Excel"}
            </Button>
          }
        >
          <div className="relative mb-3 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหายา / ล็อต..."
              value={expiryTable.search}
              onChange={(e) => expiryTable.setSearch(e.target.value)}
              className="h-9 rounded-xl pl-9"
            />
          </div>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 px-3">
                    <Checkbox checked={isAllExpirySelected} onCheckedChange={toggleAllExpiry} aria-label="เลือกทั้งหมด" />
                  </TableHead>
                  <TableHead className="w-20 text-xs font-semibold text-center">#</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">ยา</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">ล็อต</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">หมดอายุ</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">เหลือ</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">วันที่เหลือ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiryTable.total === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                      ไม่มีรายการใกล้หมดอายุ
                    </TableCell>
                  </TableRow>
                ) : (
                  expiryTable.pageItems.map((it, index) => {
                    const key = `${it.medicine_id}-${it.lot_number}`;
                    return (
                    <TableRow key={key} className="group">
                      <TableCell className="px-3">
                        <Checkbox checked={expirySelected.has(key)} onCheckedChange={() => toggleExpiry(key)} aria-label={`เลือก ${it.medicine_name}`} />
                      </TableCell>
                      <TableCell className="text-center">
                        {expiryTable.start + index + 1}
                      </TableCell>

                      <TableCell>{it.medicine_name}</TableCell>

                      <TableCell>{it.lot_number}</TableCell>

                      <TableCell>{it.expiry_date}</TableCell>

                      <TableCell>{it.qty_remaining}</TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full text-[11px] font-semibold ${it.days_left <= 30
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-warning/30 bg-warning/10 text-warning"
                            }`}
                        >
                          {it.days_left} วัน
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );})
                )}
              </TableBody>
            </Table>
          </div>
          <TablePager
            page={expiryTable.page}
            pageCount={expiryTable.pageCount}
            pageSize={expiryTable.pageSize}
            total={expiryTable.total}
            start={expiryTable.start}
            onPageChange={expiryTable.setPage}
            onPageSizeChange={expiryTable.setPageSize}
          />
        </SectionCard>

      </div>
      {/* Low Stock Table */}
      <SectionCard
        title="สต็อกต่ำ"
        description="ยาที่คงเหลือถึง/ต่ำกว่าจุดสั่งซื้อ"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs"
              disabled={!lowStock?.length}
              onClick={() => {
                const src = (lowStock ?? []) as LowStockItem[];
                const exportData = lowSelected.size > 0
                  ? src.filter((it: LowStockItem) => lowSelected.has(it.medicine_id))
                  : src;
                exportToExcel([{
                  name: "สต็อกต่ำ",
                  headers: ["#", "รหัส", "ยา", "หน่วย", "คงเหลือ", "จุดสั่งซื้อ", "สถานะ"],
                  rows: exportData.map((it: LowStockItem, i: number) => [i + 1, it.code, it.name, it.unit, it.stock_on_hand, it.reorder_level, it.stock_on_hand === 0 ? "หมดสต็อก" : "ใกล้หมด"]),
                }], "low_stock");
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {lowSelected.size > 0 ? `Excel (${lowSelected.size})` : "Excel"}
            </Button>
            <Link href={ROUTES.medicines}>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl">
                ดูทั้งหมด
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        }
      >
        <div className="relative mb-3 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหารหัส / ชื่อยา..."
            value={lowStockTable.search}
            onChange={(e) => lowStockTable.setSearch(e.target.value)}
            className="h-9 rounded-xl pl-9"
          />
        </div>
        <div className="rounded-xl border">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-3">
                  <Checkbox checked={isAllLowSelected} onCheckedChange={toggleAllLow} aria-label="เลือกทั้งหมด" />
                </TableHead>
                <TableHead className="text-center text-xs font-semibold">#</TableHead>
                <TableHead className="text-center text-xs font-semibold">รหัส</TableHead>
                <TableHead className="text-center text-xs font-semibold">ยา</TableHead>
                <TableHead className="text-center text-xs font-semibold">หน่วย</TableHead>
                <TableHead className="text-center text-xs font-semibold">คงเหลือ</TableHead>
                <TableHead className="text-center text-xs font-semibold">จุดสั่งซื้อ</TableHead>
                <TableHead className="text-center text-xs font-semibold">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockTable.total === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    ไม่มีรายการสต็อกต่ำ
                  </TableCell>
                </TableRow>
              ) : (
                lowStockTable.pageItems.map((it, index) => (
                  <TableRow key={it.medicine_id}>
                    <TableCell className="px-3">
                      <Checkbox checked={lowSelected.has(it.medicine_id)} onCheckedChange={() => toggleLow(it.medicine_id)} aria-label={`เลือก ${it.name}`} />
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {lowStockTable.start + index + 1}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">{it.code}</TableCell>
                    <TableCell className="text-center font-medium">{it.name}</TableCell>
                    <TableCell className="text-center">{it.unit}</TableCell>
                    <TableCell className="text-center">{it.stock_on_hand}</TableCell>
                    <TableCell className="text-center">{it.reorder_level}</TableCell>
                    <TableCell className="text-center">
                      <StatusBadge
                        status={
                          it.stock_on_hand === 0
                            ? "out_of_stock"
                            : "low_stock"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <TablePager
          page={lowStockTable.page}
          pageCount={lowStockTable.pageCount}
          pageSize={lowStockTable.pageSize}
          total={lowStockTable.total}
          start={lowStockTable.start}
          onPageChange={lowStockTable.setPage}
          onPageSizeChange={lowStockTable.setPageSize}
        />
      </SectionCard>
      {/* Bottom Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="flex h-full flex-col p-6">
            <h3 className="mb-5 text-base font-semibold">เมนูลัด</h3>
            <div className="grid flex-1 grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} className="block">
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex h-full min-h-[110px] flex-col items-center justify-center gap-3 rounded-2xl transition-colors ${action.bg}`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/70 shadow-sm">
                        <Icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <span className="text-center text-sm font-medium leading-tight text-foreground">
                        {action.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">กิจกรรมล่าสุด</h3>
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                  ดูทั้งหมด
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            {recentTimeline.length > 0 ? (
              <ActivityTimeline items={recentTimeline} />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีกิจกรรม</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
