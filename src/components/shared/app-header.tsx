"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import {
  Bell,
  Moon,
  Search,
  Sun,
  LogOut,
  User as UserIcon,
  ChevronRight,
  AlertTriangle,
  PackageOpen,
  CheckCircle2,
} from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLogout } from "@/features/auth/hooks";
import { useNearExpiry, useLowStock } from "@/features/dashboard/hooks";
import { ROLE_LABELS, PAGE_TITLES } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import type { NearExpiryItem, LowStockItem } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const { data: nearExpiry } = useNearExpiry();
  const { data: lowStock } = useLowStock();
  const totalNotifications = (nearExpiry?.length ?? 0) + (lowStock?.length ?? 0);

  const pageInfo = useMemo(() => {
    const match = Object.entries(PAGE_TITLES).find(([path]) =>
      pathname === path || pathname.startsWith(path + "/")
    );
    return match ? match[1] : null;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md">
      {/* Breadcrumb */}
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                หน้าหลัก
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pageInfo && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    {pageInfo.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Spacer for mobile */}
      <div className="flex-1 md:hidden" />

      {/* Search */}
      <div className="relative hidden max-w-xs lg:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหายา, รหัส..."
          className="h-9 rounded-xl border-muted bg-muted/50 pl-9 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:bg-background"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                {totalNotifications > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {totalNotifications > 99 ? "99+" : totalNotifications}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="w-80 p-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">การแจ้งเตือน</p>
              {totalNotifications > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {totalNotifications} รายการ
                </span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {totalNotifications === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <p className="text-sm font-medium">ไม่มีการแจ้งเตือน</p>
                  <p className="text-xs text-muted-foreground">สต็อกและวันหมดอายุอยู่ในเกณฑ์ปกติ</p>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Near expiry */}
                  {(nearExpiry?.length ?? 0) > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 bg-amber-50 px-4 py-2 dark:bg-amber-950/20">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          ยาใกล้หมดอายุ ({nearExpiry!.length})
                        </p>
                      </div>
                      {nearExpiry!.map((item: NearExpiryItem) => (
                        <div key={`${item.medicine_id}-${item.lot_number}`} className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/40">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{item.medicine_name}</p>
                            <p className="text-[11px] text-muted-foreground">Lot: {item.lot_number} · เหลือ {item.qty_remaining} หน่วย</p>
                            <p className={`text-[11px] font-medium ${item.days_left <= 30 ? "text-destructive" : "text-amber-600"}`}>
                              หมดอายุใน {item.days_left} วัน
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Low stock */}
                  {(lowStock?.length ?? 0) > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 bg-red-50 px-4 py-2 dark:bg-red-950/20">
                        <PackageOpen className="h-3.5 w-3.5 text-destructive" />
                        <p className="text-xs font-semibold text-destructive">
                          สต็อกต่ำ ({lowStock!.length})
                        </p>
                      </div>
                      {lowStock!.map((item: LowStockItem) => (
                        <div key={item.medicine_id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/40">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                            <PackageOpen className="h-3.5 w-3.5 text-destructive" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">รหัส: {item.code}</p>
                            <p className="text-[11px] font-medium text-destructive">
                              คงเหลือ {item.stock_on_hand} {item.unit} (ขั้นต่ำ {item.reorder_level})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 text-muted-foreground transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-muted-foreground transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex h-9 items-center gap-2.5 rounded-xl px-2"
              >
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                    {user?.full_name ? getInitials(user.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium leading-none">
                    {user?.full_name ?? "ผู้ใช้"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {user ? ROLE_LABELS[user.role] : ""}
                  </p>
                </div>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {user?.username}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              โปรไฟล์
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
