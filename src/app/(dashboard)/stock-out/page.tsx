"use client";

import { motion } from "framer-motion";
import {
  PackageMinus,
  Save,
  Boxes,
  FileText,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { MedicineSelect } from "@/features/inventory/components/medicine-select";
import { useStockOut } from "@/features/inventory/hooks";
import type { StockOutResult } from "@/types";

const schema = z.object({
  medicine_id: z.string().uuid("กรุณาเลือกยา"),
  quantity: z
    .number({ error: "กรุณากรอกจำนวน" })
    .int()
    .positive("ต้องมากกว่า 0"),
  reference_no: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function StockOutPage() {
  const stockOut = useStockOut();
  const [result, setResult] = useState<StockOutResult | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { medicine_id: "", quantity: 0, reference_no: "" },
  });

  const onSubmit = (values: FormValues) => {
    stockOut.mutate(
      { ...values, reference_no: values.reference_no || null },
      {
        onSuccess: (res) => {
          setResult(res);
          reset();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="จ่ายออกคลัง"
        description="ระบบจะตัดจากล็อตที่หมดอายุก่อนโดยอัตโนมัติ (FEFO)"
        icon={PackageMinus}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-sm">
            <div className="border-b bg-gradient-to-r from-destructive/5 to-transparent p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <PackageMinus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">บันทึกจ่ายออก</h2>
                  <p className="text-sm text-muted-foreground">
                    ระบุยาและจำนวนที่ต้องการจ่าย
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
                  value={watch("medicine_id")}
                  onChange={(v) =>
                    setValue("medicine_id", v, { shouldValidate: true })
                  }
                />
              </FormField>
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
                <FormField
                  label="เลขอ้างอิง"
                  htmlFor="reference_no"
                  optional
                >
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reference_no"
                      placeholder="เช่น RX-2026-001"
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
                  variant="destructive"
                  className="rounded-xl"
                  disabled={stockOut.isPending}
                >
                  {stockOut.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      กำลังจ่าย...
                    </span>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      จ่ายออก
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Result */}
        <div>
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-2xl border-0 bg-card shadow-sm"
            >
              <div className="border-b bg-gradient-to-r from-success/5 to-transparent p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">
                      ผลการตัดสต็อก (FEFO)
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      จ่ายทั้งหมด {result.total_quantity} หน่วย จาก{" "}
                      {result.allocations.length} ล็อต
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/30">
                        <TableHead className="text-xs font-semibold">
                          เลขล็อต
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          วันหมดอายุ
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold">
                          ตัดออก
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.allocations.map((a, i) => (
                        <motion.tr
                          key={a.lot_id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b transition-colors last:border-0 hover:bg-muted/50"
                        >
                          <TableCell className="font-mono text-xs">
                            {a.lot_number}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {a.expiry_date}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-destructive">
                            −{a.deducted}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 p-8 text-center"
            >
              <div className="mb-4 rounded-2xl bg-muted/50 p-4 text-muted-foreground/60">
                <Layers className="h-10 w-10" />
              </div>
              <h3 className="text-sm font-semibold">ยังไม่มีผลการจ่ายออก</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                กรอกฟอร์มด้านซ้ายเพื่อจ่ายยาออกคลัง ผลการตัดสต็อก FEFO จะแสดงที่นี่
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
