"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  PackagePlus,
  PackageMinus,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/shared/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePager } from "@/components/shared/table-pager";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  MovementsChart,
  StockByCategoryChart,
} from "@/features/reports/components/charts";
import {
  useMonthlyReport,
  useMovements,
  useStockByCategory,
} from "@/features/reports/hooks";
import { useClientTable } from "@/hooks/use-client-table";
import { exportToExcel } from "@/lib/export-excel";
import type { MovementByType, CategoryStockItem } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  IN: "รับเข้า",
  OUT: "จ่ายออก",
  RETURN: "รับคืน",
};
const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export default function ReportsPage() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");

  const [mode, setMode] = useState<"month" | "range">("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [from, setFrom] = useState(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
  );
  const [to, setTo] = useState(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  );

  const { data: monthly } = useMonthlyReport(year, month);
  const { data: ranged } = useMovements(from, to, mode === "range");
  const report = mode === "range" ? ranged : monthly;

  const { data: stockByCat } = useStockByCategory();
  const movementTable = useClientTable<MovementByType>(report?.movements ?? [], {
    initialPageSize: 10,
  });

  const handleExcelDownload = () => {
    const periodLabel = mode === "month"
      ? `${MONTHS[month - 1]}_${year}`
      : `${from}_to_${to}`;

    const sheets = [];

    // Sheet 1: Movement summary
    if (report?.movements?.length) {
      sheets.push({
        name: "สรุปการเคลื่อนไหว",
        headers: ["ประเภท", "จำนวนรายการ", "รวมหน่วย"],
        rows: report.movements.map((m: MovementByType) => [
          TYPE_LABELS[m.type] ?? m.type,
          m.count,
          m.total_qty,
        ]),
      });
    }

    // Sheet 2: Stock by category
    if (stockByCat?.length) {
      sheets.push({
        name: "สต็อกตามหมวดหมู่",
        headers: ["หมวดหมู่", "คงเหลือ (หน่วย)"],
        rows: stockByCat.map((s: CategoryStockItem) => [s.category, s.stock]),
      });
    }

    if (sheets.length === 0) return;
    exportToExcel(sheets, `report_${periodLabel}`);
  };

  const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const monthItems = Object.fromEntries(MONTHS.map((m, i) => [String(i + 1), m]));
  const yearItems = Object.fromEntries(years.map((y) => [String(y), String(y)]));

  const kpis = [
    {
      label: "รับเข้า",
      value: report?.total_in ?? 0,
      icon: PackagePlus,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "จ่ายออก",
      value: report?.total_out ?? 0,
      icon: PackageMinus,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "รับคืน",
      value: report?.total_return ?? 0,
      icon: RotateCcw,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="รายงาน"
        description="สรุปการเคลื่อนไหวสต็อกรายเดือน"
        icon={BarChart3}
      />

      {/* Filters: by month or by date range */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("month")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              mode === "month"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            รายเดือน
          </button>
          <button
            type="button"
            onClick={() => setMode("range")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              mode === "range"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ช่วงวันที่
          </button>
        </div>

        {mode === "month" ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => {
                  if (month === 1) {
                    setMonth(12);
                    setYear((y) => y - 1);
                  } else setMonth((m) => m - 1);
                }}
                aria-label="เดือนก่อนหน้า"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                items={monthItems}
                value={String(month)}
                onValueChange={(v) => setMonth(Number((v as string | null) ?? month))}
              >
                <SelectTrigger className="h-9 w-[130px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                items={yearItems}
                value={String(year)}
                onValueChange={(v) => setYear(Number((v as string | null) ?? year))}
              >
                <SelectTrigger className="h-9 w-[100px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => {
                  if (month === 12) {
                    setMonth(1);
                    setYear((y) => y + 1);
                  } else setMonth((m) => m + 1);
                }}
                aria-label="เดือนถัดไป"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <DatePicker
              value={from}
              max={to || undefined}
              onChange={setFrom}
              placeholder="ตั้งแต่วันที่"
            />
            <span className="text-sm text-muted-foreground">ถึง</span>
            <DatePicker
              value={to}
              min={from || undefined}
              onChange={setTo}
              placeholder="ถึงวันที่"
            />
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <div className="overflow-hidden rounded-2xl border-0 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.label} (หน่วย)
                    </p>
                    <p className={`text-3xl font-bold tracking-tight ${kpi.color}`}>
                      {(kpi.value ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="การเคลื่อนไหวเดือนนี้"
          description="จำนวนหน่วยแยกตามประเภท"
        >
          {report && report.movements.length > 0 ? (
            <MovementsChart data={report.movements} />
          ) : (
            <div className="flex h-[280px] items-center justify-center">
              <EmptyState
                title="ไม่มีข้อมูลเดือนนี้"
                description="ยังไม่มีการเคลื่อนไหวสต็อกในเดือนที่เลือก"
                variant="no-data"
                className="py-0"
              />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="สต็อกแยกตามหมวดหมู่"
          description="คงเหลือปัจจุบัน (สแน็ปช็อต)"
        >
          {stockByCat && stockByCat.length > 0 ? (
            <StockByCategoryChart data={stockByCat} />
          ) : (
            <div className="flex h-[280px] items-center justify-center">
              <EmptyState
                title="ไม่มีข้อมูล"
                description="ยังไม่มีข้อมูลสต็อกแยกตามหมวดหมู่"
                variant="no-data"
                className="py-0"
              />
            </div>
          )}
        </SectionCard>
      </div>

      {/* Summary table */}
      <SectionCard
        title="ตารางสรุป"
        description="สรุปการเคลื่อนไหวแยกตามประเภท"
        action={
          <Button
            variant="outline" size="sm" className="h-8 rounded-xl text-xs"
            onClick={handleExcelDownload}
            disabled={!report?.movements?.length && !stockByCat?.length}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Excel
          </Button>
        }
      >
        <div className="rounded-xl border">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="text-center text-xs font-semibold">ประเภท</TableHead>
                <TableHead className="text-center text-xs font-semibold">จำนวนรายการ</TableHead>
                <TableHead className="text-center text-xs font-semibold">รวมหน่วย</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movementTable.total === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                    ไม่มีข้อมูลเดือนนี้
                  </TableCell>
                </TableRow>
              ) : (
                movementTable.pageItems.map((m: MovementByType) => (
                  <TableRow key={m.type} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center justify-center gap-2.5">
                        <div className={`h-2 w-2 rounded-full ${m.type === "IN" ? "bg-success" :
                            m.type === "OUT" ? "bg-destructive" : "bg-warning"
                          }`} />
                        <span className="text-sm font-medium">{TYPE_LABELS[m.type] ?? m.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm tabular-nums">{m.count.toLocaleString()}</TableCell>
                    <TableCell className="text-center text-sm font-semibold tabular-nums">{m.total_qty.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {movementTable.total > 0 && (
          <TablePager
            page={movementTable.page}
            pageCount={movementTable.pageCount}
            pageSize={movementTable.pageSize}
            total={movementTable.total}
            start={movementTable.start}
            onPageChange={movementTable.setPage}
            onPageSizeChange={movementTable.setPageSize}
          />
        )}
      </SectionCard>
    </div>
  );
}
