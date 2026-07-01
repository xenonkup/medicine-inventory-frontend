"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { useResetPassword } from "@/features/users/hooks";

const schema = z.object({
  password: z.string().min(6, "อย่างน้อย 6 ตัวอักษร"),
});

type FormValues = z.infer<typeof schema>;

interface ResetPasswordDialogProps {
  target: { id: string; name: string } | null;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ target, onOpenChange }: ResetPasswordDialogProps) {
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (!target) reset({ password: "" });
  }, [target, reset]);

  const onSubmit = (values: FormValues) => {
    if (!target) return;
    resetPassword.mutate(
      { id: target.id, password: values.password },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            รีเซ็ตรหัสผ่าน
          </DialogTitle>
          <DialogDescription>
            ตั้งรหัสผ่านใหม่สำหรับ &quot;{target?.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="รหัสผ่านใหม่"
            htmlFor="new_password"
            required
            error={errors.password?.message}
          >
            <Input
              id="new_password"
              type="password"
              className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
              {...register("password")}
            />
          </FormField>
          <DialogFooter>
            <Button type="submit" className="rounded-xl" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  กำลังบันทึก...
                </span>
              ) : (
                "บันทึก"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
