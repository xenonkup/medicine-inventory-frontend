"use client";

import { Badge } from "@/components/ui/badge";
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
  useDashboardSummary,
  useLowStock,
  useNearExpiry,
} from "@/features/dashboard/hooks";
import { StockByCategoryChart } from "@/features/reports/components/charts";
import { useStockByCategory } from "@/features/reports/hooks";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary } = useDashboardSummary();
  const { data: nearExpiry } = useNearExpiry();
  const { data: lowStock } = useLowStock();
  const { data: stockByCat } = useStockByCategory();

  const cards = [
    { title: "รายการยาทั้งหมด", value: summary?.total_medicines },
    {
      title: `ใกล้หมดอายุ (${summary?.near_expiry_days ?? 180} วัน)`,
      value: summary?.near_expiry_count,
      alert: (summary?.near_expiry_count ?? 0) > 0,
    },
    {
      title: "สต็อกต่ำ",
      value: summary?.low_stock_count,
      alert: (summary?.low_stock_count ?? 0) > 0,
    },
    { title: "การเคลื่อนไหววันนี้", value: summary?.today_movements },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">
          สวัสดี {user?.full_name ?? ""} — ภาพรวมคลังยา
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardDescription>{card.title}</CardDescription>
              <CardTitle
                className={`text-3xl ${card.alert ? "text-destructive" : ""}`}
              >
                {card.value ?? "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 สต็อกแยกตามหมวดหมู่</CardTitle>
          <CardDescription>ยอดคงเหลือปัจจุบันของแต่ละหมวดหมู่</CardDescription>
        </CardHeader>
        <CardContent>
          {stockByCat && <StockByCategoryChart data={stockByCat} />}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚠️ ยาใกล้หมดอายุ</CardTitle>
            <CardDescription>
              ภายใน {summary?.near_expiry_days ?? 180} วัน (ตัดออกก่อนด้วย FEFO)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ยา</TableHead>
                  <TableHead>ล็อต</TableHead>
                  <TableHead>หมดอายุ</TableHead>
                  <TableHead className="text-right">เหลือ</TableHead>
                  <TableHead className="text-right">วัน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(nearExpiry ?? []).map((it) => (
                  <TableRow key={`${it.medicine_id}-${it.lot_number}`}>
                    <TableCell className="font-medium">
                      {it.medicine_name}
                    </TableCell>
                    <TableCell>{it.lot_number}</TableCell>
                    <TableCell>{it.expiry_date}</TableCell>
                    <TableCell className="text-right">
                      {it.qty_remaining}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          it.days_left <= 30 ? "text-destructive" : "text-amber-600"
                        }
                      >
                        {it.days_left}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {nearExpiry && nearExpiry.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      ไม่มีรายการใกล้หมดอายุ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📉 สต็อกต่ำ</CardTitle>
            <CardDescription>ยาที่คงเหลือถึง/ต่ำกว่าจุดสั่งซื้อ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ยา</TableHead>
                  <TableHead className="text-right">คงเหลือ</TableHead>
                  <TableHead className="text-right">จุดสั่งซื้อ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(lowStock ?? []).map((it) => (
                  <TableRow key={it.medicine_id}>
                    <TableCell className="font-mono text-sm">{it.code}</TableCell>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell className="text-right text-destructive">
                      {it.stock_on_hand} {it.unit}
                    </TableCell>
                    <TableCell className="text-right">{it.reorder_level}</TableCell>
                  </TableRow>
                ))}
                {lowStock && lowStock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      ไม่มีรายการสต็อกต่ำ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
