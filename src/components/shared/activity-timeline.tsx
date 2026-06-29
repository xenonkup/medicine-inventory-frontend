"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group flex gap-3"
          >
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                  item.iconBg
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", item.iconColor)} />
              </div>
              {index < items.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/60">
                {item.time}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
