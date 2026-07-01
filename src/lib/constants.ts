import {
  LayoutDashboard,
  Pill,
  Tag,
  PackagePlus,
  PackageMinus,
  RotateCcw,
  BarChart3,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  medicines: "/medicines",
  categories: "/categories",
  stockIn: "/stock-in",
  stockOut: "/stock-out",
  returns: "/returns",
  reports: "/reports",
  notifications: "/notifications",
  users: "/users",
  settings: "/settings",
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  STAFF: "เจ้าหน้าที่",
};

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "แดชบอร์ด", href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "จัดการยา", href: ROUTES.medicines, icon: Pill, adminOnly: true },
  { label: "หมวดหมู่", href: ROUTES.categories, icon: Tag, adminOnly: true },
  { label: "รับเข้า", href: ROUTES.stockIn, icon: PackagePlus },
  { label: "จ่ายออก", href: ROUTES.stockOut, icon: PackageMinus },
  { label: "รับคืน", href: ROUTES.returns, icon: RotateCcw },
  { label: "รายงาน", href: ROUTES.reports, icon: BarChart3, adminOnly: true },
  { label: "ผู้ใช้งาน", href: ROUTES.users, icon: Users, adminOnly: true },
  { label: "ตั้งค่า", href: ROUTES.settings, icon: Settings, adminOnly: true },
];

export const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  [ROUTES.dashboard]: {
    title: "แดชบอร์ด",
    description: "ภาพรวมคลังยา",
  },
  [ROUTES.medicines]: {
    title: "จัดการยา",
    description: "ข้อมูลหลักของยาในคลัง",
  },
  [ROUTES.categories]: {
    title: "หมวดหมู่ยา",
    description: "จัดการหมวดหมู่สำหรับจัดกลุ่มยา",
  },
  [ROUTES.stockIn]: {
    title: "รับเข้าคลัง",
    description: "บันทึกการรับยาเข้าคลังเป็นล็อต",
  },
  [ROUTES.stockOut]: {
    title: "จ่ายออกคลัง",
    description: "ระบบจะตัดจากล็อตที่หมดอายุก่อนโดยอัตโนมัติ (FEFO)",
  },
  [ROUTES.returns]: {
    title: "รับคืน",
    description: "รับยาคืนเข้าล็อตเดิม",
  },
  [ROUTES.reports]: {
    title: "รายงาน",
    description: "สรุปการเคลื่อนไหวสต็อกรายเดือน",
  },
  [ROUTES.users]: {
    title: "ผู้ใช้งาน",
    description: "จัดการบัญชีผู้ใช้และสิทธิ์",
  },
  [ROUTES.settings]: {
    title: "ตั้งค่าระบบ",
    description: "กำหนดค่าการแจ้งเตือนและพารามิเตอร์",
  },
};
