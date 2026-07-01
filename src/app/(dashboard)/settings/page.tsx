"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Calendar, Save, Sliders } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { useSettings, useUpdateSetting } from "@/features/settings/hooks";
import { useAuth } from "@/providers/auth-provider";
import type { Setting } from "@/types";

const NEAR_EXPIRY_KEY = "near_expiry_days";

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const { data: settings } = useSettings();
  const updateSetting = useUpdateSetting();

  const nearExpiry = settings?.find((s: Setting) => s.key === NEAR_EXPIRY_KEY);
  const [days, setDays] = useState("");

  useEffect(() => {
    if (nearExpiry) setDays(nearExpiry.value);
  }, [nearExpiry]);

  const onSave = () => {
    updateSetting.mutate({ key: NEAR_EXPIRY_KEY, value: days });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตั้งค่าระบบ"
        description="กำหนดค่าการแจ้งเตือนและพารามิเตอร์ของระบบ"
        icon={SettingsIcon}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-2"
        >
          <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-sm">
            <div className="border-b bg-gradient-to-r from-primary/5 to-transparent p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">
                    การแจ้งเตือนใกล้หมดอายุ
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    กำหนดจำนวนวันล่วงหน้าที่จะนับว่ายา &ldquo;ใกล้หมดอายุ&rdquo;
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-5 p-6">
              <FormField
                label="จำนวนวันล่วงหน้า"
                htmlFor="days"
                required
              >
                <div className="relative max-w-[180px]">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="days"
                    type="number"
                    min={1}
                    value={days}
                    disabled={!isAdmin}
                    onChange={(e) => setDays(e.target.value)}
                    className="h-11 rounded-xl bg-muted/50 pl-9 transition-colors focus-visible:bg-background"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    วัน
                  </span>
                </div>
              </FormField>

              {!isAdmin ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-warning/20 bg-warning/5 p-3">
                  <Sliders className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p className="text-xs text-muted-foreground">
                    เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขการตั้งค่านี้ได้
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 border-t pt-5">
                  <Button
                    onClick={onSave}
                    className="rounded-xl"
                    disabled={updateSetting.isPending || !days}
                  >
                    {updateSetting.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        กำลังบันทึก...
                      </span>
                    ) : (
                      <>
                        <Save className="mr-1.5 h-4 w-4" />
                        บันทึก
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </div>
        </motion.div>

        {/* Info sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <div className="rounded-2xl border-0 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">ผลกระทบ</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              การตั้งค่านี้มีผลต่อ:
            </p>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>การ์ด &ldquo;ใกล้หมดอายุ&rdquo;บนแดชบอร์ด</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>ตารางยาใกล้หมดอายุในหน้าแดชบอร์ด</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>การแจ้งเตือนรายการใกล้หมดอายุ</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* All settings */}
      {settings && settings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border-0 bg-card shadow-sm"
        >
          <div className="border-b p-6">
            <h2 className="text-base font-semibold">ค่าระบบทั้งหมด</h2>
            <p className="text-sm text-muted-foreground">
              ค่าที่ตั้งไว้ในระบบทั้งหมด
            </p>
          </div>
          <CardContent className="divide-y p-0">
            {settings.map((s: Setting) => (
              <div
                key={s.key}
                className="flex items-center justify-between px-6 py-3.5"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {s.key}
                </span>
                <span className="text-sm font-medium">{s.value}</span>
              </div>
            ))}
          </CardContent>
        </motion.div>
      )}
    </div>
  );
}
