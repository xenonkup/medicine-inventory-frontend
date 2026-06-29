"use client";

import { motion } from "framer-motion";
import { PackagePlus, Save, Hash, Calendar, Boxes, FileText } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { MedicineSelect } from "@/features/inventory/components/medicine-select";
import { useStockIn } from "@/features/inventory/hooks";

const schema = z.object({
  medicine_id: z.string().uuid("กรุณาเลือกยา"),
  lot_number: z.string().min(1, "กรุณากรอกเลขล็อต").max(60),
  expiry_date: z.string().min(1, "กรุณาเลือกวันหมดอายุ"),
  quantity: z.number({ error: "กรุณากรอกจำนวน" }).int().positive("ต้องมากกว่า 0"),
  reference_no: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function StockInPage() {
  const stockIn = useStockIn();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      medicine_id: "",
      lot_number: "",
      expiry_date: "",
      quantity: 0,
      reference_no: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    stockIn.mutate(
      { ...values, reference_no: values.reference_no || null },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="รับเข้าคลัง"
        description="บันทึกการรับยาเข้าคลังเป็นล็อต"
        icon={PackagePlus}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-2"
        >
          <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-sm">
            <div className="border-b bg-gradient-to-r from-primary/5 to-transparent p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <PackagePlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">บันทึกรับเข้า</h2>
                  <p className="text-sm text-muted-foreground">
                    หากเลขล็อตนี้มีอยู่แล้ว ระบบจะเพิ่มจำนวนเข้าล็อตเดิม
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
              <FormField label="ยา" required error={errors.medicine_id?.message}>
                <MedicineSelect
                  value={watch("medicine_id")}
                  onChange={(v) =>
                    setValue("medicine_id", v, { shouldValidate: true })
                  }
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="เลขล็อต"
                  htmlFor="lot_number"
                  required
                  error={errors.lot_number?.message}
                >
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="lot_number"
                      placeholder="เช่น P2026-001"
                      className="h-11 rounded-xl bg-muted/50 pl-9 transition-colors focus-visible:bg-background"
                      {...register("lot_number")}
                    />
                  </div>
                </FormField>
                <FormField
                  label="วันหมดอายุ"
                  htmlFor="expiry_date"
                  required
                  error={errors.expiry_date?.message}
                >
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="expiry_date"
                      type="date"
                      className="h-11 rounded-xl bg-muted/50 pl-9 transition-colors focus-visible:bg-background"
                      {...register("expiry_date")}
                    />
                  </div>
                </FormField>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="จำนวน"
                  htmlFor="quantity"
                  required
                  error={errors.quantity?.message}
                >
                  <div className="relative">
                    <Boxes className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      placeholder="0"
                      className="h-11 rounded-xl bg-muted/50 pl-9 transition-colors focus-visible:bg-background"
                      {...register("quantity", { valueAsNumber: true })}
                    />
                  </div>
                </FormField>
                <FormField label="เลขอ้างอิง" htmlFor="reference_no" optional>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reference_no"
                      placeholder="เช่น PO-2026-001"
                      className="h-11 rounded-xl bg-muted/50 pl-9 transition-colors focus-visible:bg-background"
                      {...register("reference_no")}
                    />
                  </div>
                </FormField>
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-5">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => reset()}
                >
                  ล้างฟอร์ม
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl"
                  disabled={stockIn.isPending}
                >
                  {stockIn.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      กำลังบันทึก...
                    </span>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      บันทึกรับเข้า
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Info sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <div className="rounded-2xl border-0 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">คำแนะนำ</h3>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>เลขล็อตควรไม่ซ้ำกับล็อตที่มีวันหมดอายุต่างกัน</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>ระบบจะใช้ FEFO ในการจ่ายออกโดยอัตโนมัติ</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>ตรวจสอบวันหมดอายุให้ถูกต้องก่อนบันทึก</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>เลขอ้างอิงใช้สำหรับติดตามใบสั่งซื้อหรือเอกสาร</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
