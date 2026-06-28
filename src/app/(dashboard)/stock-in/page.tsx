"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
      <div>
        <h1 className="text-2xl font-semibold">รับเข้า (Stock In)</h1>
        <p className="text-muted-foreground">บันทึกการรับยาเข้าคลังเป็นล็อต</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>บันทึกรับเข้า</CardTitle>
          <CardDescription>
            หากเลขล็อตนี้มีอยู่แล้ว ระบบจะเพิ่มจำนวนเข้าล็อตเดิม
          </CardDescription>
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
                <Label htmlFor="lot_number">เลขล็อต</Label>
                <Input id="lot_number" {...register("lot_number")} />
                {errors.lot_number && (
                  <p className="text-sm text-destructive">
                    {errors.lot_number.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">วันหมดอายุ</Label>
                <Input id="expiry_date" type="date" {...register("expiry_date")} />
                {errors.expiry_date && (
                  <p className="text-sm text-destructive">
                    {errors.expiry_date.message}
                  </p>
                )}
              </div>
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

            <Button type="submit" disabled={stockIn.isPending}>
              {stockIn.isPending ? "กำลังบันทึก..." : "บันทึกรับเข้า"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
