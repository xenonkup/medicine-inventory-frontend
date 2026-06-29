"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Cross } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SidebarNavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        active
          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
          : "text-muted-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-primary"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center">
        <Icon className="h-[18px] w-[18px] shrink-0" />
      </span>
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  // Responsive: collapse on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out md:relative md:z-0",
          collapsed ? "w-[68px]" : "w-[260px]",
          "max-md:fixed",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Cross className="h-4 w-4" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <h1 className="text-base font-semibold tracking-tight whitespace-nowrap">
                  PharmaCare
                </h1>
                <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                  Inventory System
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <SidebarNavLink
                  key={item.href}
                  item={item}
                  active={active}
                  collapsed={collapsed}
                />
              );
            })}
          </div>
        </nav>

        <Separator />

        {/* Collapse toggle */}
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-xl"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-2 text-xs"
                >
                  ย่อแถบข้าง
                </motion.span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile expand button when collapsed */}
      {collapsed && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-3 top-[4.5rem] z-40 h-8 w-8 rounded-lg shadow-md md:hidden"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </>
  );
}
