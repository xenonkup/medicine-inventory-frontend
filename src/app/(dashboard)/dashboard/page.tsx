"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

// Phase 1 placeholder dashboard. KPI cards (near-expiry, low-stock, today's
// movements) are wired to real data in Phase 4.
const PLACEHOLDER_CARDS = [
  { title: "รายการยาทั้งหมด", hint: "Medicine Management (Phase 2)" },
  { title: "ใกล้หมดอายุ (180 วัน)", hint: "Near-Expiry (Phase 4)" },
  { title: "สต็อกต่ำ", hint: "Low-Stock (Phase 4)" },
  { title: "การเคลื่อนไหววันนี้", hint: "Stock movement (Phase 3)" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">
          สวัสดี {user?.full_name ?? ""} — ยินดีต้อนรับเข้าสู่ระบบบริหารคลังยา
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEHOLDER_CARDS.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-3xl">—</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
