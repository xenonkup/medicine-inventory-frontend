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
import { ROLE_LABELS, PAGE_TITLES } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";

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
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

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
