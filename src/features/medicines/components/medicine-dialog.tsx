"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks";
import {
  useCreateMedicine,
  useUpdateMedicine,
} from "@/features/medicines/hooks";
import type { Medicine } from "@/types";

const schema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสยา").max(50),
  name: z.string().min(1, "กรุณากรอกชื่อยา").max(150),
  category_id: z.string().uuid("กรุณาเลือกหมวดหมู่"),
  unit: z.string().min(1, "กรุณากรอกหน่วยนับ").max(30),
  reorder_level: z
    .number({ error: "กรุณากรอกตัวเลข" })
    .int()
    .min(0, "ต้องไม่ติดลบ"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  medicine?: Medicine;
  trigger: ReactNode;
}

export function MedicineDialog({ medicine, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const { data: categoriesData } = useCategories();
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const isEdit = Boolean(medicine);

  const defaults: FormValues = {
    code: medicine?.code ?? "",
    name: medicine?.name ?? "",
    category_id: medicine?.category_id ?? "",
    unit: medicine?.unit ?? "",
    reorder_level: medicine?.reorder_level ?? 0,
    description: medicine?.description ?? "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (values: FormValues) => {
    const input = {
      ...values,
      description: values.description || null,
    };
    const onSuccess = () => setOpen(false);
    if (isEdit && medicine) {
      updateMedicine.mutate({ id: medicine.id, input }, { onSuccess });
    } else {
      createMedicine.mutate(input, {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      });
    }
  };

  const pending = createMedicine.isPending || updateMedicine.isPending;
  const categories = categoriesData?.categories.filter((c) => c.is_active) ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "แก้ไขยา" : "เพิ่มยา"}</DialogTitle>
          <DialogDescription>กรอกข้อมูลยาและจุดสั่งซื้อขั้นต่ำ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">รหัสยา</Label>
              <Input id="code" {...register("code")} />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">หน่วยนับ</Label>
              <Input id="unit" placeholder="เม็ด, ขวด, กล่อง" {...register("unit")} />
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อยา</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>หมวดหมู่</Label>
              <Select
                value={watch("category_id")}
                onValueChange={(v) =>
                  setValue("category_id", (v as string | null) ?? "", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-destructive">
                  {errors.category_id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">จุดสั่งซื้อขั้นต่ำ</Label>
              <Input
                id="reorder_level"
                type="number"
                min={0}
                {...register("reorder_level", { valueAsNumber: true })}
              />
              {errors.reorder_level && (
                <p className="text-sm text-destructive">
                  {errors.reorder_level.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">คำอธิบาย (ไม่บังคับ)</Label>
            <Input id="description" {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
