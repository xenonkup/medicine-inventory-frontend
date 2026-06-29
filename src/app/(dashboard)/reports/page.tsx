"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  PackagePlus,
  PackageMinus,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SectionCard } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  MovementsChart,
  StockByCategoryChart,
} from "@/features/reports/components/charts";
import {
  useMonthlyReport,
  useStockByCategory,
} from "@/features/reports/hooks";

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
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: report } = useMonthlyReport(year, month);
  const { data: stockByCat } = useStockByCategory();

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
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs">
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              พิมพ์
            </Button>
          </div>
        }
      />

      {/* Month navigator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl border bg-card p-1.5 shadow-sm">
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
          <span className="min-w-[140px] text-center text-sm font-medium">
            {MONTHS[month - 1]} {year}
          </span>
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
      >
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="text-xs font-semibold">ประเภท</TableHead>
                <TableHead className="w-40 text-right text-xs font-semibold">จำนวนรายการ</TableHead>
                <TableHead className="w-36 text-right text-xs font-semibold">รวมหน่วย</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(report?.movements ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                    ไม่มีข้อมูลเดือนนี้
                  </TableCell>
                </TableRow>
              ) : (
                (report?.movements ?? []).map((m) => (
                  <TableRow key={m.type} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2 w-2 rounded-full ${m.type === "IN" ? "bg-success" :
                            m.type === "OUT" ? "bg-destructive" : "bg-warning"
                          }`} />
                        <span className="text-sm font-medium">{TYPE_LABELS[m.type] ?? m.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{m.count.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums">{m.total_qty.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
