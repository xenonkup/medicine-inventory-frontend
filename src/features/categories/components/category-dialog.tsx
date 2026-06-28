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
  useCreateCategory,
  useUpdateCategory,
} from "@/features/categories/hooks";
import type { Category } from "@/types";

const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่").max(100),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  category?: Category;
  trigger: ReactNode;
}

export function CategoryDialog({ category, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? "",
        description: category?.description ?? "",
      });
    }
  }, [open, category, reset]);

  const onSubmit = (values: FormValues) => {
    const input = {
      name: values.name,
      description: values.description || null,
    };
    const onSuccess = () => setOpen(false);
    if (isEdit && category) {
      updateCategory.mutate({ id: category.id, input }, { onSuccess });
    } else {
      createCategory.mutate(input, {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      });
    }
  };

  const pending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</DialogTitle>
          <DialogDescription>กำหนดชื่อและคำอธิบายหมวดหมู่ยา</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อหมวดหมู่</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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
