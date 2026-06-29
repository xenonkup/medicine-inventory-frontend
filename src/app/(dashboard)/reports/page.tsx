"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: report } = useMonthlyReport(year, month);
  const { data: stockByCat } = useStockByCategory();

  const kpis = [
    { label: "รับเข้า", value: report?.total_in, color: "text-green-600" },
    { label: "จ่ายออก", value: report?.total_out, color: "text-red-600" },
    { label: "รับคืน", value: report?.total_return, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">รายงาน</h1>
          <p className="text-muted-foreground">สรุปการเคลื่อนไหวสต็อกรายเดือน</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 1) {
                setMonth(12);
                setYear((y) => y - 1);
              } else setMonth((m) => m - 1);
            }}
          >
            ◀
          </Button>
          <span className="min-w-32 text-center font-medium">
            {MONTHS[month - 1]} {year}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (month === 12) {
                setMonth(1);
                setYear((y) => y + 1);
              } else setMonth((m) => m + 1);
            }}
          >
            ▶
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardDescription>{k.label} (หน่วย)</CardDescription>
              <CardTitle className={`text-3xl ${k.color}`}>
                {k.value ?? "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">การเคลื่อนไหวเดือนนี้</CardTitle>
            <CardDescription>จำนวนหน่วยแยกตามประเภท</CardDescription>
          </CardHeader>
          <CardContent>
            {report && <MovementsChart data={report.movements} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สต็อกแยกตามหมวดหมู่</CardTitle>
            <CardDescription>คงเหลือปัจจุบัน (สแน็ปช็อต)</CardDescription>
          </CardHeader>
          <CardContent>
            {stockByCat && <StockByCategoryChart data={stockByCat} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ตารางสรุป</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภท</TableHead>
                <TableHead className="text-right">จำนวนรายการ</TableHead>
                <TableHead className="text-right">รวมหน่วย</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(report?.movements ?? []).map((m) => (
                <TableRow key={m.type}>
                  <TableCell className="font-medium">
                    {TYPE_LABELS[m.type] ?? m.type}
                  </TableCell>
                  <TableCell className="text-right">{m.count}</TableCell>
                  <TableCell className="text-right">{m.total_qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
