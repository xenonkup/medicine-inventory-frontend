"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, Tag } from "lucide-react";

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
import { FormField } from "@/components/shared/form-field";
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
  trigger?: ReactNode;
  /** Set false when the trigger is not a native <button> (e.g. a menu item). */
  triggerNativeButton?: boolean;
  /** Control open state externally (omit to use internal state). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CategoryDialog({
  category,
  trigger,
  triggerNativeButton = true,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: Props) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp !== undefined ? openProp : openInternal;
  const setOpen = onOpenChangeProp ?? setOpenInternal;
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
      {trigger && (
        <DialogTrigger
          nativeButton={triggerNativeButton}
          render={trigger as React.ReactElement}
        />
      )}
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {isEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
              </DialogTitle>
              <DialogDescription>
                กำหนดชื่อและคำอธิบายหมวดหมู่ยา
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="ชื่อหมวดหมู่"
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
