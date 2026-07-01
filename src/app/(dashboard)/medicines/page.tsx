"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Plus,
  Search,
  ChevronDown,
  X,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { TablePager } from "@/components/shared/table-pager";
import { StatusBadge, ActiveBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MedicineDialog } from "@/features/medicines/components/medicine-dialog";
import { useDeleteMedicine, useMedicines } from "@/features/medicines/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useClientTable } from "@/hooks/use-client-table";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { exportToExcel } from "@/lib/export-excel";
import type { Category, Medicine } from "@/types";

function getStockStatus(
  stockOnHand: number,
  reorderLevel: number,
  isActive: boolean
): "available" | "low_stock" | "out_of_stock" {
  if (!isActive) return "out_of_stock";
  if (stockOnHand === 0) return "out_of_stock";
  if (stockOnHand <= reorderLevel) return "low_stock";
  return "available";
}

type StockFilter = "all" | "available" | "low_stock" | "out_of_stock";
type StatusFilter = "all" | "active" | "inactive";

const STOCK_FILTER_LABELS: Record<StockFilter, string> = {
  all: "สต็อกทั้งหมด",
  available: "ปกติ",
  low_stock: "ใกล้หมด",
  out_of_stock: "หมด",
};

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "ทุกสถานะ",
  active: "ใช้งาน",
  inactive: "ปิดใช้งาน",
};

function FilterPill({
  label,
  active,
  onClick,
  onClear,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
      {active ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onClear(); } }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
        >
          <X className="h-3 w-3" />
        </span>
      ) : (
        <ChevronDown className="h-3 w-3 opacity-60" />
      )}
    </button>
  );
}

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showStockMenu, setShowStockMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const debounced = useDebounce(search, 300);
  const { data, isLoading, isError } = useMedicines({
    search: debounced,
    categoryId: categoryId !== "all" ? categoryId : undefined,
  });
  const { data: catData } = useCategories();
  const deleteMedicine = useDeleteMedicine();

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMedicine.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const activeFiltersCount = [categoryId !== "all", stockFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

  const clearAllFilters = () => {
    setCategoryId("all");
    setStockFilter("all");
    setStatusFilter("all");
  };

  const filteredMedicines = (data?.medicines ?? []).filter((m: Medicine) => {
    const status = getStockStatus(m.stock_on_hand, m.reorder_level, m.is_active);
    if (stockFilter !== "all" && status !== stockFilter) return false;
    if (statusFilter === "active" && !m.is_active) return false;
    if (statusFilter === "inactive" && m.is_active) return false;
    return true;
  });
  const medicineTable = useClientTable<Medicine>(filteredMedicines, {
    initialPageSize: 10,
  });

  const pageIds = medicineTable.pageItems.map((m) => m.id);
  const isAllPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0;
  const toggleAll = () => {
    if (isAllPageSelected) {
      setSelectedIds((prev) => { const s = new Set(prev); pageIds.forEach((id) => s.delete(id)); return s; });
    } else {
      setSelectedIds((prev) => { const s = new Set(prev); pageIds.forEach((id) => s.add(id)); return s; });
    }
  };
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => { const s = new Set(prev); if (s.has(id)) { s.delete(id); } else { s.add(id); } return s; });

  const handleExcelDownload = () => {
    const exportData = isSomeSelected
      ? filteredMedicines.filter((m: Medicine) => selectedIds.has(m.id))
      : filteredMedicines;
    exportToExcel([{
      name: "รายการยา",
      headers: ["รหัส", "ชื่อยา", "หมวดหมู่", "หน่วย", "คงเหลือ", "จุดสั่งซื้อ", "สถานะ", "สต็อก"],
      rows: exportData.map((m: Medicine) => [
        m.code,
        m.name,
        m.category_name,
        m.unit,
        m.stock_on_hand,
        m.reorder_level,
        m.is_active ? "ใช้งาน" : "ปิดใช้งาน",
        getStockStatus(m.stock_on_hand, m.reorder_level, m.is_active) === "available"
          ? "ปกติ" : getStockStatus(m.stock_on_hand, m.reorder_level, m.is_active) === "low_stock"
          ? "ใกล้หมด" : "หมด",
      ]),
    }], "medicines");
  };

  const selectedCategory = catData?.categories.find((c: Category) => c.id === categoryId);
  const closeMenus = () => { setShowCategoryMenu(false); setShowStockMenu(false); setShowStatusMenu(false); };

  return (
    <div className="space-y-5">
      <PageHeader title="จัดการยา"
        description="ข้อมูลหลักของยาในคลัง"
        icon={Pill}
        actions={
          <MedicineDialog
            trigger={
              <Button className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มยา
              </Button>
            }
          />
        }
      />

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
        onClick={closeMenus}
      >
        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center gap-2 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อยาหรือรหัส..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 rounded-lg border-border bg-background pl-8 text-xs transition-colors focus-visible:bg-background"
            />
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Category filter */}
          <div className="relative">
            <FilterPill
              label={categoryId !== "all" ? (selectedCategory?.name ?? "หมวดหมู่") : "หมวดหมู่"}
              active={categoryId !== "all"}
              onClick={() => { setShowCategoryMenu((v) => !v); setShowStockMenu(false); setShowStatusMenu(false); }}
              onClear={() => setCategoryId("all")}
            />
            <AnimatePresence>
              {showCategoryMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 top-9 z-50 min-w-[160px] overflow-hidden rounded-xl border bg-popover shadow-lg"
                >
                  {[{ id: "all", name: "ทุกหมวดหมู่" }, ...(catData?.categories ?? [])].map((c) => (
                    <button key={c.id} type="button"
                      onClick={() => { setCategoryId(c.id); setShowCategoryMenu(false); }}
                      className={cn("flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                        categoryId === c.id && "bg-primary/10 text-primary font-medium")}
                    >{c.name}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stock filter */}
          <div className="relative">
            <FilterPill
              label={STOCK_FILTER_LABELS[stockFilter]}
              active={stockFilter !== "all"}
              onClick={() => { setShowStockMenu((v) => !v); setShowCategoryMenu(false); setShowStatusMenu(false); }}
              onClear={() => setStockFilter("all")}
            />
            <AnimatePresence>
              {showStockMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 top-9 z-50 min-w-[140px] overflow-hidden rounded-xl border bg-popover shadow-lg"
                >
                  {(Object.keys(STOCK_FILTER_LABELS) as StockFilter[]).map((f) => (
                    <button key={f} type="button"
                      onClick={() => { setStockFilter(f); setShowStockMenu(false); }}
                      className={cn("flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                        stockFilter === f && "bg-primary/10 text-primary font-medium")}
                    >{STOCK_FILTER_LABELS[f]}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status filter */}
          <div className="relative">
            <FilterPill
              label={STATUS_FILTER_LABELS[statusFilter]}
              active={statusFilter !== "all"}
              onClick={() => { setShowStatusMenu((v) => !v); setShowCategoryMenu(false); setShowStockMenu(false); }}
              onClear={() => setStatusFilter("all")}
            />
            <AnimatePresence>
              {showStatusMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 top-9 z-50 min-w-[130px] overflow-hidden rounded-xl border bg-popover shadow-lg"
                >
                  {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((f) => (
                    <button key={f} type="button"
                      onClick={() => { setStatusFilter(f); setShowStatusMenu(false); }}
                      className={cn("flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                        statusFilter === f && "bg-primary/10 text-primary font-medium")}
                    >{STATUS_FILTER_LABELS[f]}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeFiltersCount > 0 && (
            <button type="button" onClick={clearAllFilters}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
              ล้างตัวกรอง ({activeFiltersCount})
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={handleExcelDownload} disabled={filteredMedicines.length === 0}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {isSomeSelected ? `Excel (${selectedIds.size})` : "Excel"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={6} columns={7} /></div>
        ) : isError ? (
          <div className="py-16"><EmptyState title="เกิดข้อผิดพลาด" description="ไม่สามารถโหลดข้อมูลได้" variant="error" /></div>
        ) : filteredMedicines.length === 0 ? (
          <div className="py-16">
            {data && data.medicines.length === 0 && !search && activeFiltersCount === 0 ? (
              <EmptyState title="ยังไม่มีรายการยา" description="เริ่มต้นเพิ่มยาเข้าสู่ระบบ" variant="no-items"
                action={<MedicineDialog trigger={<Button size="sm" className="rounded-xl"><Plus className="mr-1.5 h-3.5 w-3.5" />เพิ่มยาแรก</Button>} />} />
            ) : (
              <EmptyState title="ไม่พบรายการที่ค้นหา" description="ลองปรับเงื่อนไขการค้นหาหรือตัวกรอง" variant="no-items" />
            )}
          </div>
        ) : (
          <div className="mx-4 mt-4 rounded-xl border">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-[6%]" />
                <col className="w-[19%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[11%]" />
                <col className="w-[13%]" />
                <col className="w-[5%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-3">
                    <Checkbox checked={isAllPageSelected} onCheckedChange={toggleAll} aria-label="เลือกทั้งหมด" />
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold">#</TableHead>
                  <TableHead className="text-center text-xs font-semibold">ยา</TableHead>
                  <TableHead className="text-center text-xs font-semibold">หมวดหมู่</TableHead>
                  <TableHead className="text-center text-xs font-semibold">หน่วย</TableHead>
                  <TableHead className="text-center text-xs font-semibold">คงเหลือ</TableHead>
                  <TableHead className="text-center text-xs font-semibold">สั่งซื้อ</TableHead>
                  <TableHead className="text-center text-xs font-semibold">สถานะ</TableHead>
                  <TableHead className="text-center text-xs font-semibold">สต็อก</TableHead>
                  <TableHead className="text-center text-xs font-semibold" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicineTable.pageItems.map((m: Medicine, index: number) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12, delay: index * 0.015 }}
                    className="group border-b transition-colors last:border-0 hover:bg-muted/30"
                  >
                    {/* checkbox */}
                    <TableCell className="px-3">
                      <Checkbox checked={selectedIds.has(m.id)} onCheckedChange={() => toggleRow(m.id)} aria-label={`เลือก ${m.name}`} />
                    </TableCell>
                    {/* # */}
                    <TableCell className="text-center">{medicineTable.start + index + 1}</TableCell>

                    {/* ยา — 2 บรรทัด */}
                    <TableCell className="py-3">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                          <Pill className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{m.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{m.code}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* หมวดหมู่ */}
                    <TableCell className="text-center">
                      <span>{m.category_name}</span>
                    </TableCell>

                    {/* หน่วย */}
                    <TableCell className="text-center">{m.unit}</TableCell>

                    {/* คงเหลือ */}
                    <TableCell className="text-center">
                      <span className={cn("text-sm font-bold tabular-nums",
                        m.stock_on_hand === 0 ? "text-destructive" :
                          m.stock_on_hand <= m.reorder_level ? "text-warning" : "text-foreground")}>
                        {m.stock_on_hand.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* จุดสั่งซื้อ */}
                    <TableCell className="text-center">
                      {m.reorder_level.toLocaleString()}
                    </TableCell>

                    {/* สถานะ */}
                    <TableCell className="text-center"><ActiveBadge active={m.is_active} /></TableCell>

                    {/* สต็อก */}
                    <TableCell className="text-center">
                      <StatusBadge status={getStockStatus(m.stock_on_hand, m.reorder_level, m.is_active)} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => setEditingMedicine(m)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            แก้ไข
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(m.id)}
                            disabled={!m.is_active}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            ปิดใช้งาน
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Footer */}
        {data && filteredMedicines.length > 0 && (
          <div className="px-4 pb-4">
            <TablePager
              page={medicineTable.page}
              pageCount={medicineTable.pageCount}
              pageSize={medicineTable.pageSize}
              total={medicineTable.total}
              start={medicineTable.start}
              onPageChange={medicineTable.setPage}
              onPageSizeChange={medicineTable.setPageSize}
            />
          </div>
        )}
      </motion.div>

      <MedicineDialog
        medicine={editingMedicine ?? undefined}
        open={!!editingMedicine}
        onOpenChange={(open) => !open && setEditingMedicine(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="ปิดใช้งานยา?"
        description="การปิดใช้งานจะไม่สามารถใช้ยารายการนี้ในระบบได้"
        confirmText="ปิดใช้งาน"
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleteMedicine.isPending}
      />
    </div>
  );
}
