import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StockStatus = "available" | "low_stock" | "out_of_stock" | "near_expiry" | "expired";

interface StatusBadgeProps {
  status: StockStatus;
  className?: string;
}

const STATUS_CONFIG: Record<StockStatus, { label: string; className: string }> = {
  available: {
    label: "พร้อมใช้งาน",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/15",
  },
  low_stock: {
    label: "สต็อกต่ำ",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/15",
  },
  out_of_stock: {
    label: "หมดสต็อก",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
  },
  near_expiry: {
    label: "ใกล้หมดอายุ",
    className: "bg-[oklch(0.75_0.183_55)]/10 text-[oklch(0.75_0.183_55)] border-[oklch(0.75_0.183_55)]/20",
  },
  expired: {
    label: "หมดอายุ",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
        config.className,
        className
      )}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </Badge>
  );
}

// Simple active/inactive badge
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
        active
          ? "bg-success/10 text-success border-success/20"
          : "bg-muted text-muted-foreground border-border"
      )}
    >
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          active ? "bg-success" : "bg-muted-foreground"
        )}
      />
      {active ? "ใช้งาน" : "ปิดใช้งาน"}
    </Badge>
  );
}

// Role badge
export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant={role === "ADMIN" ? "default" : "secondary"}
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
    >
      {role === "ADMIN" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"}
    </Badge>
  );
}
