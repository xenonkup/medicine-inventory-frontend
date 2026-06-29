"use client";

import { motion } from "framer-motion";
import { Cross, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/hooks";

const schema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (values: FormValues) => login.mutate(values);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Cross className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">PharmaCare</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold leading-tight tracking-tight"
          >
            ระบบบริหารคลังยา
            <br />
            <span className="text-primary-foreground/80">สำหรับโรงพยาบาล</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-primary-foreground/70"
          >
            จัดการคลังยาได้อย่างมีประสิทธิภาพ
            <br />
            ติดตามสต็อก หมดอายุ และรายงานทั้งหมดในที่เดียว
          </motion.p>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/50">
          © 2024 PharmaCare — Pharmacy Inventory System
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-white/3" />
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Cross className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">PharmaCare</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              เข้าสู่ระบบ
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบบริหารคลังยา
            </p>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    ชื่อผู้ใช้
                  </Label>
                  <Input
                    id="username"
                    placeholder="username"
                    autoComplete="username"
                    className="h-11 rounded-xl bg-muted/50 transition-colors focus-visible:bg-background"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    รหัสผ่าน
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 rounded-xl bg-muted/50 pr-10 transition-colors focus-visible:bg-background"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl font-medium"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      กำลังเข้าสู่ระบบ...
                    </span>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
