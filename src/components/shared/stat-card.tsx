"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { useEffect } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}: StatCardProps) {
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (latest) =>
    Number.isNaN(latest) ? "0" : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    const numericValue = typeof value === "number" ? value : 0;
    const controls = animate(motionValue, numericValue, {
      duration: 0.8,
      ease: "easeOut",
    });
    return controls.stop;
  }, [motionValue, value]);

  const isString = typeof value === "string";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn("group", className)}
    >
      <Card className="overflow-hidden border-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                {isString ? (
                  <span className="text-2xl font-bold tracking-tight">
                    {value}
                  </span>
                ) : (
                  <motion.span className="text-2xl font-bold tracking-tight">
                    {displayValue}
                  </motion.span>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trend && (
                <p
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
                  <span className="text-muted-foreground">จากเดือนก่อน</span>
                </p>
              )}
            </div>
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
                iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
