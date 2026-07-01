"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Search, ChevronDown, X, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { TablePager } from "@/components/shared/table-pager";
import { ActiveBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
import { useCategories, useDeleteCategory } from "@/features/categories/hooks";
import { useClientTable } from "@/hooks/use-client-table";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { exportToExcel } from "@/lib/export-excel";
import type { Category } from "@/types";

type StatusFilter = "all" | "active" | "inactive";
const STATUS_LABELS: Record<StatusFilter, string> = { all: "ทุกสถานะ", active: "ใช้งาน", inactive: "ปิดใช้งาน" };

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const debounced = useDebounce(search, 300);
  const { data, isLoading, isError } = useCategories(debounced);
  const deleteCategory = useDeleteCategory();

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCategory.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  const filtered = (data?.categories ?? []).filter((c: Category) => {
    if (statusFilter === "active" && !c.is_active) return false;
    if (statusFilter === "inactive" && c.is_active) return false;
    return true;
  });
  const categoryTable = useClientTable<Category>(filtered, {
    initialPageSize: 10,
  });

  const pageIds = categoryTable.pageItems.map((c) => c.id);
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
    const exportData = isSomeSelected ? filtered.filter((c: Category) => selectedIds.has(c.id)) : filtered;
    exportToExcel([{
      name: "หมวดหมู่ยา",
      headers: ["#", "ชื่อหมวดหมู่", "คำอธิบาย", "สถานะ"],
      rows: exportData.map((c: Category, i: number) => [
        i + 1,
        c.name,
        c.description ?? "",
        c.is_active ? "ใช้งาน" : "ปิดใช้งาน",
      ]),
    }], "categories");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="หมวดหมู่ยา"
        description="จัดการหมวดหมู่สำหรับจัดกลุ่มยา"
        icon={Tag}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs" onClick={handleExcelDownload} disabled={filtered.length === 0}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {isSomeSelected ? `Excel (${selectedIds.size})` : "Excel"}
            </Button>
            <CategoryDialog trigger={
              <Button className="rounded-xl"><Plus className="mr-2 h-4 w-4" />เพิ่มหมวดหมู่</Button>
            } />
          </div>
        }
      />

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
        onClick={() => setShowStatusMenu(false)}
      >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2 border-b p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาหมวดหมู่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl pl-9"
          />
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Status filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusMenu((v) => !v)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium",
              statusFilter !== "all"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {STATUS_LABELS[statusFilter]}
            {statusFilter !== "all" ? (
              <span role="button" tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setStatusFilter("all"); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setStatusFilter("all"); } }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20">
                <X className="h-3 w-3" />
              </span>
            ) : (
              <ChevronDown className="h-3 w-3 opacity-60" />
            )}
          </button>
          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.1 }}
                className="absolute left-0 top-9 z-50 min-w-[130px] overflow-hidden rounded-xl border bg-popover shadow-lg"
              >
                {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((f) => (
                  <button key={f} type="button"
                    onClick={() => { setStatusFilter(f); setShowStatusMenu(false); }}
                    className={cn("flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                      statusFilter === f && "bg-primary/10 text-primary font-medium")}
                  >{STATUS_LABELS[f]}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={5} columns={5} /></div>
        ) : isError ? (
          <div className="py-16"><EmptyState title="เกิดข้อผิดพลาด" description="ไม่สามารถโหลดข้อมูลได้" variant="error" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            {data && data.categories.length === 0 && !search ? (
              <EmptyState title="ยังไม่มีหมวดหมู่" description="เริ่มต้นสร้างหมวดหมู่เพื่อจัดกลุ่มยา" variant="no-items"
                action={<CategoryDialog trigger={<Button size="sm" className="rounded-xl"><Plus className="mr-1.5 h-3.5 w-3.5" />เพิ่มหมวดหมู่แรก</Button>} />} />
            ) : (
              <EmptyState title="ไม่พบรายการที่ค้นหา" description="ลองปรับเงื่อนไขการค้นหา" variant="no-items" />
            )}
          </div>
        ) : (
          <div className="mx-4 mt-4 rounded-xl border">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-[9%]" />
              <col className="w-[26%]" />
              <col className="w-[32%]" />
              <col className="w-[16%]" />
              <col className="w-[9%]" />
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-3">
                  <Checkbox checked={isAllPageSelected} onCheckedChange={toggleAll} aria-label="เลือกทั้งหมด" />
                </TableHead>
                <TableHead className="text-center text-xs font-semibold">#</TableHead>
                <TableHead className="text-center text-xs font-semibold">ชื่อหมวดหมู่</TableHead>
                <TableHead className="text-center text-xs font-semibold">คำอธิบาย</TableHead>
                <TableHead className="text-center text-xs font-semibold">สถานะ</TableHead>
                <TableHead className="text-center text-xs font-semibold"/>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryTable.pageItems.map((category: Category, index: number) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, delay: index * 0.02 }}
                  className="group border-b transition-colors last:border-0 hover:bg-muted/30"
                >
                  {/* checkbox */}
                  <TableCell className="px-3">
                    <Checkbox checked={selectedIds.has(category.id)} onCheckedChange={() => toggleRow(category.id)} aria-label={`เลือก ${category.name}`} />
                  </TableCell>
                  {/* # */}
                  <TableCell className="px-4 text-center">
                    <span className="text-xs font-medium text-muted-foreground">{categoryTable.start + index + 1}</span>
                  </TableCell>

                  {/* ชื่อ — 2 บรรทัด */}
                  <TableCell className="py-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{category.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {category.is_active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* คำอธิบาย */}
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {category.description || <span className="italic text-muted-foreground/40">ไม่มีคำอธิบาย</span>}
                  </TableCell>

                  {/* สถานะ */}
                  <TableCell className="text-center"><ActiveBadge active={category.is_active} /></TableCell>

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
                        <DropdownMenuItem onClick={() => setEditTarget(category)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(category.id)} disabled={!category.is_active}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />ปิดใช้งาน
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
      {data && filtered.length > 0 && (
        <div className="px-4 pb-4">
          <TablePager
            page={categoryTable.page}
            pageCount={categoryTable.pageCount}
            pageSize={categoryTable.pageSize}
            total={categoryTable.total}
            start={categoryTable.start}
            onPageChange={categoryTable.setPage}
            onPageSizeChange={categoryTable.setPageSize}
          />
        </div>
      )}
      </motion.div>

      <CategoryDialog
        category={editTarget ?? undefined}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="ปิดใช้งานหมวดหมู่?"
        description="การปิดใช้งานจะไม่สามารถใช้หมวดหมู่นี้สำหรับยาได้"
        confirmText="ปิดใช้งาน"
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleteCategory.isPending}
      />
    </div>
  );
}
