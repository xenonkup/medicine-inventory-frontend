"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon, MoreHorizontal, Shield, UserCheck, UserX,
  Search, ChevronDown, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { useSetUserStatus, useUsers } from "@/features/users/hooks";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

type RoleFilter = "all" | "ADMIN" | "STAFF";
type StatusFilter = "all" | "active" | "inactive";

const ROLE_LABELS: Record<RoleFilter, string> = { all: "ทุก Role", ADMIN: "ผู้ดูแลระบบ", STAFF: "เจ้าหน้าที่" };
const STATUS_LABELS: Record<StatusFilter, string> = { all: "ทุกสถานะ", active: "ใช้งาน", inactive: "ปิดใช้งาน" };

function FilterPill({ label, active, onClick, onClear }: { label: string; active: boolean; onClick: () => void; onClear: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
        active ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")}>
      {label}
      {active ? (
        <span role="button" tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onClear(); } }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20">
          <X className="h-3 w-3" />
        </span>
      ) : (
        <ChevronDown className="h-3 w-3 opacity-60" />
      )}
    </button>
  );
}

export default function UsersPage() {
  const { data, isLoading, isError } = useUsers();
  const setStatus = useSetUserStatus();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<{ id: string; isActive: boolean; name: string } | null>(null);

  const handleToggle = () => {
    if (toggleTarget) {
      setStatus.mutate({ id: toggleTarget.id, isActive: !toggleTarget.isActive },
        { onSuccess: () => setToggleTarget(null) });
    }
  };

  const closeMenus = () => { setShowRoleMenu(false); setShowStatusMenu(false); };

  const filtered = (data?.users ?? []).filter((u: User) => {
    if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) &&
      !u.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter === "active" && !u.is_active) return false;
    if (statusFilter === "inactive" && u.is_active) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="ผู้ใช้งาน"
        description="จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง"
        icon={UsersIcon}
        actions={<CreateUserDialog />}
      />

      {/* Summary chips */}
      {data && (
        <div className="flex flex-wrap gap-2">
          {[
            { icon: UsersIcon, count: data.total, label: "ผู้ใช้ทั้งหมด", color: "bg-primary/10 text-primary" },
            { icon: UserCheck, count: data.users.filter((u) => u.is_active).length, label: "ใช้งานอยู่", color: "bg-success/10 text-success" },
            { icon: Shield, count: data.users.filter((u) => u.role === "ADMIN").length, label: "ผู้ดูแลระบบ", color: "bg-warning/10 text-warning" },
          ].map(({ icon: Icon, count, label, color }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">{count}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อหรือ username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 rounded-lg border-border bg-background pl-8 text-xs"
          />
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Role filter */}
        <div className="relative">
          <FilterPill label={ROLE_LABELS[roleFilter]} active={roleFilter !== "all"}
            onClick={() => { setShowRoleMenu((v) => !v); setShowStatusMenu(false); }}
            onClear={() => setRoleFilter("all")} />
          <AnimatePresence>
            {showRoleMenu && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.1 }}
                className="absolute left-0 top-9 z-50 min-w-[150px] overflow-hidden rounded-xl border bg-popover shadow-lg">
                {(Object.keys(ROLE_LABELS) as RoleFilter[]).map((f) => (
                  <button key={f} type="button" onClick={() => { setRoleFilter(f); setShowRoleMenu(false); }}
                    className={cn("flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                      roleFilter === f && "bg-primary/10 text-primary font-medium")}>
                    {ROLE_LABELS[f]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status filter */}
        <div className="relative">
          <FilterPill label={STATUS_LABELS[statusFilter]} active={statusFilter !== "all"}
            onClick={() => { setShowStatusMenu((v) => !v); setShowRoleMenu(false); }}
            onClear={() => setStatusFilter("all")} />
          <AnimatePresence>
            {showStatusMenu && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.1 }}
                className="absolute left-0 top-9 z-50 min-w-[130px] overflow-hidden rounded-xl border bg-popover shadow-lg">
                {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((f) => (
                  <button key={f} type="button" onClick={() => { setStatusFilter(f); setShowStatusMenu(false); }}
                    className={cn("flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                      statusFilter === f && "bg-primary/10 text-primary font-medium")}>
                    {STATUS_LABELS[f]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto">
          {data && <span className="text-xs text-muted-foreground">{filtered.length} รายการ</span>}
        </div>
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
        onClick={closeMenus}
      >
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={5} columns={4} /></div>
        ) : isError ? (
          <div className="py-16"><EmptyState title="เกิดข้อผิดพลาด" description="ไม่สามารถโหลดข้อมูลผู้ใช้ได้" variant="error" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title={data && data.users.length === 0 ? "ยังไม่มีผู้ใช้" : "ไม่พบรายการที่ค้นหา"}
              description={data && data.users.length === 0 ? "เริ่มต้นสร้างบัญชีผู้ใช้" : "ลองปรับเงื่อนไขการค้นหา"}
              variant="no-items" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อ-นามสกุล</TableHead>
                <TableHead className="w-36 text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อผู้ใช้</TableHead>
                <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">บทบาท</TableHead>
                <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-muted-foreground">สถานะ</TableHead>
                <TableHead className="w-12 px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user: User, index: number) => (
                <motion.tr key={user.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, delay: index * 0.02 }}
                  className="group border-b transition-colors last:border-0 hover:bg-muted/30">

                  {/* # */}
                  <TableCell className="w-10 px-4 text-center">
                    <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                  </TableCell>

                  {/* ชื่อ — 2 บรรทัด */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0 border border-border">
                        <AvatarFallback className={cn("text-[11px] font-bold",
                          user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{user.full_name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{user.role === "ADMIN" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* username */}
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{user.username}</span>
                  </TableCell>

                  {/* บทบาท */}
                  <TableCell>
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        <Shield className="h-3 w-3" />ผู้ดูแลระบบ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        เจ้าหน้าที่
                      </span>
                    )}
                  </TableCell>

                  {/* สถานะ */}
                  <TableCell>
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />ใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />ปิดใช้งาน
                      </span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem
                          onClick={() => setToggleTarget({ id: user.id, isActive: user.is_active, name: user.full_name })}
                          className={user.is_active ? "text-destructive focus:text-destructive" : "text-success focus:text-success"}>
                          {user.is_active
                            ? <><UserX className="mr-2 h-3.5 w-3.5" />ปิดใช้งาน</>
                            : <><UserCheck className="mr-2 h-3.5 w-3.5" />เปิดใช้งาน</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>รีเซ็ตรหัสผ่าน</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Footer */}
      {data && filtered.length > 0 && (
        <div className="px-1 text-xs text-muted-foreground">
          แสดง <span className="font-medium text-foreground">{filtered.length}</span> จาก <span className="font-medium text-foreground">{data.total}</span> รายการ
        </div>
      )}

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.isActive ? "ปิดใช้งานผู้ใช้?" : "เปิดใช้งานผู้ใช้?"}
        description={toggleTarget?.isActive
          ? `ผู้ใช้ "${toggleTarget.name}" จะไม่สามารถเข้าสู่ระบบได้`
          : `ผู้ใช้ "${toggleTarget?.name}" จะสามารถเข้าสู่ระบบได้อีกครั้ง`}
        confirmText={toggleTarget?.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
        variant={toggleTarget?.isActive ? "destructive" : "default"}
        onConfirm={handleToggle}
        loading={setStatus.isPending}
      />
    </div>
  );
}
