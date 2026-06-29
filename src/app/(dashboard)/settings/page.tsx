"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings, useUpdateSetting } from "@/features/settings/hooks";
import { useAuth } from "@/providers/auth-provider";

const NEAR_EXPIRY_KEY = "near_expiry_days";

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const { data: settings } = useSettings();
  const updateSetting = useUpdateSetting();

  const nearExpiry = settings?.find((s) => s.key === NEAR_EXPIRY_KEY);
  const [days, setDays] = useState("");

  useEffect(() => {
    if (nearExpiry) setDays(nearExpiry.value);
  }, [nearExpiry]);

  const onSave = () => {
    updateSetting.mutate({ key: NEAR_EXPIRY_KEY, value: days });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">กำหนดค่าการแจ้งเตือนและพารามิเตอร์ของระบบ</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>การแจ้งเตือนใกล้หมดอายุ</CardTitle>
          <CardDescription>
            กำหนดจำนวนวันล่วงหน้าที่จะนับว่ายา &ldquo;ใกล้หมดอายุ&rdquo;
            (มีผลกับแดชบอร์ดและรายการแจ้งเตือน)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="days">จำนวนวันล่วงหน้า</Label>
            <Input
              id="days"
              type="number"
              min={1}
              value={days}
              disabled={!isAdmin}
              onChange={(e) => setDays(e.target.value)}
              className="max-w-40"
            />
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขได้
              </p>
            )}
          </div>
        </CardContent>
        {isAdmin && (
          <CardFooter>
            <Button
              onClick={onSave}
              disabled={updateSetting.isPending || !days}
            >
              {updateSetting.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-lg">ค่าระบบทั้งหมด</CardTitle>
          <CardDescription>ค่าที่ตั้งไว้ในระบบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(settings ?? []).map((s) => (
            <div key={s.key} className="flex justify-between border-b py-1">
              <span className="font-mono text-muted-foreground">{s.key}</span>
              <span className="font-medium">{s.value}</span>
            </div>
          ))}
          {settings && settings.length === 0 && (
            <p className="text-muted-foreground">ยังไม่มีค่าที่ตั้งไว้</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
