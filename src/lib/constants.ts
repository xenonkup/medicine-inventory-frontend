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

// Navigation items. `adminOnly` items are hidden from STAFF in the sidebar.
export interface NavItem {
  label: string;
  href: string;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "แดชบอร์ด", href: ROUTES.dashboard },
  { label: "จัดการยา", href: ROUTES.medicines, adminOnly: true },
  { label: "หมวดหมู่", href: ROUTES.categories, adminOnly: true },
  { label: "รับเข้า (Stock In)", href: ROUTES.stockIn },
  { label: "จ่ายออก (Stock Out)", href: ROUTES.stockOut },
  { label: "รับคืน (Return)", href: ROUTES.returns },
  { label: "รายงาน", href: ROUTES.reports, adminOnly: true },
  { label: "ผู้ใช้งาน", href: ROUTES.users, adminOnly: true },
  { label: "ตั้งค่า", href: ROUTES.settings, adminOnly: true },
];
