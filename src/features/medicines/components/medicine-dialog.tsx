"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { schema, type FormValues } from "./schema/schema";
import { Save, Pill } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { useCategories } from "@/features/categories/hooks";
import {
  useCreateMedicine,
  useUpdateMedicine,
} from "@/features/medicines/hooks";
import type { Category, Medicine } from "@/types";

interface Props {
  medicine?: Medicine;
  trigger?: ReactNode;
  /** Set false when the trigger is not a native <button> (e.g. a menu item). */
  triggerNativeButton?: boolean;
  /** Control open state externally (omit to use internal state). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MedicineDialog({
  medicine,
  trigger,
  triggerNativeButton = true,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: Props) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp !== undefined ? openProp : openInternal;
  const setOpen = onOpenChangeProp ?? setOpenInternal;
  const { data: categoriesData } = useCategories();
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const isEdit = Boolean(medicine);

  const defaultValues: FormValues = {
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
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues);
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
  const categories = categoriesData?.categories.filter((c: Category) => c.is_active) ?? [];
  const categoryItems = Object.fromEntries(
    categories.map((c: Category) => [c.id, c.name]),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger
          nativeButton={triggerNativeButton}
          render={trigger as React.ReactElement}
        />
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>{isEdit ? "แก้ไขยา" : "เพิ่มยา"}</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลยาและจุดสั่งซื้อขั้นต่ำ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="รหัสยา"
              htmlFor="code"
              required
              error={errors.code?.message}
            >
              <Input
                id="code"
                className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
                {...register("code")}
              />
            </FormField>
            <FormField
              label="หน่วยนับ"
              htmlFor="unit"
              required
              error={errors.unit?.message}
            >
              <Input
                id="unit"
                placeholder="เม็ด, ขวด, กล่อง"
                className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
                {...register("unit")}
              />
            </FormField>
          </div>
          <FormField
            label="ชื่อยา"
            htmlFor="name"
            required
            error={errors.name?.message}
          >
            <Input
              id="name"
              className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
              {...register("name")}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="หมวดหมู่" required error={errors.category_id?.message}>
              <Select
                items={categoryItems}
                value={watch("category_id")}
                onValueChange={(v) =>
                  setValue("category_id", (v as string | null) ?? "", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl bg-muted/50 transition-colors data-[popup-open]:bg-background">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: Category) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              label="จุดสั่งซื้อขั้นต่ำ"
              htmlFor="reorder_level"
              required
              error={errors.reorder_level?.message}
            >
              <Input
                id="reorder_level"
                type="number"
                min={0}
                className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
                {...register("reorder_level", { valueAsNumber: true })}
              />
            </FormField>
          </div>
          <FormField label="คำอธิบาย" htmlFor="description" optional>
            <Input
              id="description"
              className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
              {...register("description")}
            />
          </FormField>
          <DialogFooter>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={pending}
            >
              {pending ? (
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
