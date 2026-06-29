"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserPlus, Save } from "lucide-react";

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
import { useCreateUser } from "@/features/users/hooks";
import type { Role } from "@/types";

const schema = z.object({
  username: z.string().min(3, "อย่างน้อย 3 ตัวอักษร").max(50),
  password: z.string().min(6, "อย่างน้อย 6 ตัวอักษร"),
  full_name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  role: z.enum(["ADMIN", "STAFF"]),
});

type FormValues = z.infer<typeof schema>;

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", full_name: "", role: "STAFF" },
  });

  const onSubmit = (values: FormValues) => {
    createUser.mutate(values, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl">
            <UserPlus className="mr-2 h-4 w-4" />
            เพิ่มผู้ใช้
          </Button>
        }
      />
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
          <DialogDescription>
            กำหนดชื่อผู้ใช้ รหัสผ่าน และบทบาท
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="ชื่อ-นามสกุล"
            htmlFor="full_name"
            required
            error={errors.full_name?.message}
          >
            <Input
              id="full_name"
              className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
              {...register("full_name")}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="ชื่อผู้ใช้"
              htmlFor="username"
              required
              error={errors.username?.message}
            >
              <Input
                id="username"
                className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
                {...register("username")}
              />
            </FormField>
            <FormField
              label="รหัสผ่าน"
              htmlFor="password"
              required
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                className="h-10 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
                {...register("password")}
              />
            </FormField>
          </div>
          <FormField label="บทบาท" required>
            <Select
              items={{
                STAFF: "เจ้าหน้าที่ (Staff)",
                ADMIN: "ผู้ดูแลระบบ (Admin)",
              }}
              value={watch("role")}
              onValueChange={(v) =>
                setValue("role", (v as Role | null) ?? "STAFF")
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl bg-muted/50 transition-colors data-[popup-open]:bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">เจ้าหน้าที่ (Staff)</SelectItem>
                <SelectItem value="ADMIN">ผู้ดูแลระบบ (Admin)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <DialogFooter>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={createUser.isPending}
            >
              {createUser.isPending ? (
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
