"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MedicineSelect } from "@/features/inventory/components/medicine-select";
import { useStockOut } from "@/features/inventory/hooks";
import type { StockOutResult } from "@/types";

const schema = z.object({
  medicine_id: z.string().uuid("กรุณาเลือกยา"),
  quantity: z.number({ error: "กรุณากรอกจำนวน" }).int().positive("ต้องมากกว่า 0"),
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
      <div>
        <h1 className="text-2xl font-semibold">จ่ายออก (Stock Out)</h1>
        <p className="text-muted-foreground">
          ระบบจะตัดจากล็อตที่หมดอายุก่อนโดยอัตโนมัติ (FEFO)
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>บันทึกจ่ายออก</CardTitle>
          <CardDescription>ระบุยาและจำนวนที่ต้องการจ่าย</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>ยา</Label>
              <MedicineSelect
                value={watch("medicine_id")}
                onChange={(v) =>
                  setValue("medicine_id", v, { shouldValidate: true })
                }
              />
              {errors.medicine_id && (
                <p className="text-sm text-destructive">
                  {errors.medicine_id.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">จำนวน</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_no">เลขอ้างอิง (ไม่บังคับ)</Label>
                <Input id="reference_no" {...register("reference_no")} />
              </div>
            </div>
            <Button type="submit" disabled={stockOut.isPending}>
              {stockOut.isPending ? "กำลังจ่าย..." : "จ่ายออก"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>ผลการตัดสต็อก (FEFO)</CardTitle>
            <CardDescription>
              จ่ายทั้งหมด {result.total_quantity} หน่วย จาก {result.allocations.length} ล็อต
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขล็อต</TableHead>
                  <TableHead>วันหมดอายุ</TableHead>
                  <TableHead className="text-right">ตัดออก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.allocations.map((a) => (
                  <TableRow key={a.lot_id}>
                    <TableCell>{a.lot_number}</TableCell>
                    <TableCell>{a.expiry_date}</TableCell>
                    <TableCell className="text-right">{a.deducted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
