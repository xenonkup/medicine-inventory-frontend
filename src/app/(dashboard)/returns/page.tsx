"use client";

import { motion } from "framer-motion";
import { RotateCcw, Save, Boxes, FileText, Info } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { MedicineSelect } from "@/features/inventory/components/medicine-select";
import { useLots, useStockReturn } from "@/features/inventory/hooks";

const schema = z.object({
  medicine_id: z.string().uuid("กรุณาเลือกยา"),
  lot_id: z.string().uuid("กรุณาเลือกล็อต"),
  quantity: z
    .number({ error: "กรุณากรอกจำนวน" })
    .int()
    .positive("ต้องมากกว่า 0"),
  reference_no: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ReturnsPage() {
  const stockReturn = useStockReturn();
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
      lot_id: "",
      quantity: 0,
      reference_no: "",
    },
  });

  const medicineId = watch("medicine_id");
  const { data: lots } = useLots(medicineId);

  const lotLabel = (l: NonNullable<typeof lots>[number]) =>
    `${l.lot_number} — หมดอายุ ${l.expiry_date} (คงเหลือ ${l.qty_remaining}/${l.qty_received})`;
  const lotItems = Object.fromEntries(
    (lots ?? []).map((l) => [l.id, lotLabel(l)]),
  );

  const onSubmit = (values: FormValues) => {
    stockReturn.mutate(
      {
        lot_id: values.lot_id,
        quantity: values.quantity,
        reference_no: values.reference_no || null,
      },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="รับคืน"
        description="รับยาคืนเข้าล็อตเดิม (รับคืนได้เฉพาะล็อตที่ยังไม่หมดอายุ)"
        icon={RotateCcw}
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
            <div className="border-b bg-gradient-to-r from-warning/5 to-transparent p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">บันทึกรับคืน</h2>
                  <p className="text-sm text-muted-foreground">
                    เลือกยาแล้วเลือกล็อตที่ต้องการรับคืน
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
              <FormField
                label="ยา"
                required
                error={errors.medicine_id?.message}
              >
                <MedicineSelect
                  value={medicineId}
                  onChange={(v) => {
                    setValue("medicine_id", v, { shouldValidate: true });
                    setValue("lot_id", "");
                  }}
                />
              </FormField>

              <FormField label="ล็อต" required error={errors.lot_id?.message}>
                <Select
                  items={lotItems}
                  value={watch("lot_id")}
                  onValueChange={(v) =>
                    setValue("lot_id", (v as string | null) ?? "", {
                      shouldValidate: true,
                    })
                  }
                  disabled={!medicineId}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-muted/50 transition-colors data-[popup-open]:bg-background">
                    <SelectValue placeholder="เลือกล็อต" />
                  </SelectTrigger>
                  <SelectContent>
                    {(lots ?? []).map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {lotLabel(l)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="จำนวนที่รับคืน"
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
                      placeholder="เช่น RT-2026-001"
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
                  disabled={stockReturn.isPending}
                >
                  {stockReturn.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      กำลังบันทึก...
                    </span>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      บันทึกรับคืน
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
          <div className="rounded-2xl border border-warning/20 bg-warning/5 p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
                <Info className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">ข้อควรทราบ</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span>รับคืนได้เฉพาะล็อตที่ยังไม่หมดอายุเท่านั้น</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span>ยาคืนจะถูกเพิ่มเข้าล็อตเดิมที่เลือก</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span>ตรวจสอบสภาพยาก่อนรับคืนทุกครั้ง</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span>บันทึกเลขอ้างอิงเพื่อติดตามเอกสาร</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
