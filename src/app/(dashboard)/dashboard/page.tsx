"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  StockByCategoryChart,
} from "@/features/reports/components/charts";
import { useStockByCategory } from "@/features/reports/hooks";
import { useAuth } from "@/providers/auth-provider";
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

const mockTimeline = [
  {
    id: "1",
    icon: PackagePlus,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    title: "รับเข้า Paracetamol 500mg",
    description: "ล็อต P2026-001 — 1000 เม็ด",
    time: "5 นาทีที่แล้ว",
  },
  {
    id: "2",
    icon: PackageMinus,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    title: "จ่ายออก Amoxicillin 250mg",
    description: "อ้างอิง RX-2024-0892 — 30 เม็ด",
    time: "15 นาทีที่แล้ว",
  },
  {
    id: "3",
    icon: AlertTriangle,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    title: "แจ้งเตือนยาใกล้หมดอายุ",
    description: "Ibuprofen 400mg — เหลือ 15 วัน",
    time: "1 ชั่วโมงที่แล้ว",
  },
  {
    id: "4",
    icon: RotateCcw,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "รับคืน Omeprazole 20mg",
    description: "ล็อต O2026-003 — 10 เม็ด",
    time: "2 ชั่วโมงที่แล้ว",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary } = useDashboardSummary();
  const { data: nearExpiry } = useNearExpiry();
  const { data: lowStock } = useLowStock();
  const { data: stockByCat } = useStockByCategory();

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

      {/* Charts + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Stock by Category Chart */}
        <SectionCard
          title="สต็อกแยกตามหมวดหมู่"
          description="ยอดคงเหลือปัจจุบันของแต่ละหมวดหมู่"
          wrapperClassName="lg:col-span-3"
        >
          {stockByCat ? (
            <StockByCategoryChart data={stockByCat} />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
              กำลังโหลดข้อมูล...
            </div>
          )}
        </SectionCard>

        {/* Quick Actions */}
        <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm">
          <CardContent className="p-6 h-full flex flex-col">
            <h3 className="mb-5 text-base font-semibold">เมนูลัด</h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} className="block">
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex flex-col items-center justify-center gap-3 rounded-2xl min-h-[110px] h-full transition-colors ${action.bg}`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/70 shadow-sm">
                        <Icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <span className="text-sm font-medium text-foreground text-center leading-tight">
                        {action.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables + Timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Near Expiry */}
        <SectionCard
          title="ยาใกล้หมดอายุ"
          description={`ภายใน ${summary?.near_expiry_days ?? 180} วัน`}
          wrapperClassName="lg:col-span-2"
          action={
            nearExpiry && nearExpiry.length > 0 ? (
              <Badge variant="outline" className="rounded-full text-[11px]">
                {nearExpiry.length} รายการ
              </Badge>
            ) : undefined
          }
          className=""
        >
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20 text-xs font-semibol text-center">#</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">ยา</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">ล็อต</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">หมดอายุ</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">เหลือ</TableHead>
                  <TableHead className="w-20 text-xs font-semibold">วันที่เหลือ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(nearExpiry ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      ไม่มีรายการใกล้หมดอายุ
                    </TableCell>
                  </TableRow>
                ) : (
                  (nearExpiry ?? []).map((it, index) => (
                    <TableRow
                      key={`${it.medicine_id}-${it.lot_number}`}
                      className="group"
                    >
                      <TableCell className="text-center">
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        {it.medicine_name}
                      </TableCell>

                      <TableCell>
                        {it.lot_number}
                      </TableCell>

                      <TableCell>
                        {it.expiry_date}
                      </TableCell>

                      <TableCell>
                        {it.qty_remaining}
                      </TableCell>

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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        {/* Activity Timeline */}
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
            <ActivityTimeline items={mockTimeline} />
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Table */}
      <SectionCard
        title="สต็อกต่ำ"
        description="ยาที่คงเหลือถึง/ต่ำกว่าจุดสั่งซื้อ"
        action={
          <Link href={ROUTES.medicines}>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl">
              ดูทั้งหมด
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        }
      >
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20 text-center">#</TableHead>
                <TableHead className="w-20 text-xs font-semibold">ยา</TableHead>
                <TableHead className="w-20 text-xs font-semibold">หน่วย</TableHead>
                <TableHead className="w-20 text-xs font-semibold">คงเหลือ</TableHead>
                <TableHead className="w-20 text-xs font-semibold">จุดสั่งซื้อ</TableHead>
                <TableHead className="w-20 text-xs font-semibold">สถานะ</TableHead>
                <TableHead className="w-20 text-xs font-semibold">รหัส</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(lowStock ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    ไม่มีรายการสต็อกต่ำ
                  </TableCell>
                </TableRow>
              ) : (
                (lowStock ?? []).map((it, index) => (
                  <TableRow key={it.medicine_id}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>

                    <TableCell>{it.code}</TableCell>

                    <TableCell>
                      {it.name}
                    </TableCell>

                    <TableCell>{it.unit}</TableCell>

                    <TableCell>
                      {it.stock_on_hand}
                    </TableCell>

                    <TableCell>
                      {it.reorder_level}
                    </TableCell>

                    <TableCell>
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
      </SectionCard>
    </div>
  );
}
