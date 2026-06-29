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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicineSelect } from "@/features/inventory/components/medicine-select";
import { useLots, useStockReturn } from "@/features/inventory/hooks";

const schema = z.object({
  medicine_id: z.string().uuid("กรุณาเลือกยา"),
  lot_id: z.string().uuid("กรุณาเลือกล็อต"),
  quantity: z.number({ error: "กรุณากรอกจำนวน" }).int().positive("ต้องมากกว่า 0"),
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
  // Base UI needs `items` so the trigger shows the lot label, not the UUID.
  const lotItems = Object.fromEntries((lots ?? []).map((l) => [l.id, lotLabel(l)]));

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
      <div>
        <h1 className="text-2xl font-semibold">รับคืน (Return)</h1>
        <p className="text-muted-foreground">
          รับยาคืนเข้าล็อตเดิม (รับคืนได้เฉพาะล็อตที่ยังไม่หมดอายุ)
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>บันทึกรับคืน</CardTitle>
          <CardDescription>เลือกยาแล้วเลือกล็อตที่ต้องการรับคืน</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>ยา</Label>
              <MedicineSelect
                value={medicineId}
                onChange={(v) => {
                  setValue("medicine_id", v, { shouldValidate: true });
                  setValue("lot_id", "");
                }}
              />
              {errors.medicine_id && (
                <p className="text-sm text-destructive">
                  {errors.medicine_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>ล็อต</Label>
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
                <SelectTrigger className="w-full">
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
              {errors.lot_id && (
                <p className="text-sm text-destructive">{errors.lot_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">จำนวนที่รับคืน</Label>
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

            <Button type="submit" disabled={stockReturn.isPending}>
              {stockReturn.isPending ? "กำลังบันทึก..." : "บันทึกรับคืน"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
