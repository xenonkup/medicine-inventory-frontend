"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const PAGE_SIZES = [10, 20, 30];

interface Props {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  start: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Reusable pagination footer: row-count summary, page-size selector
// (10 / 20 / 30), and prev/next navigation.
export function TablePager({
  page,
  pageCount,
  pageSize,
  total,
  start,
  onPageChange,
  onPageSizeChange,
}: Props) {
  if (total === 0) return null;

  const from = start + 1;
  const to = Math.min(start + pageSize, total);

  return (
    <div className="flex flex-col gap-3 px-1 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground">
        แสดง {from}-{to} จาก {total} รายการ
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">แถวต่อหน้า</span>
          <div className="flex items-center gap-1">
            {PAGE_SIZES.map((size) => (
              <Button
                key={size}
                variant={size === pageSize ? "default" : "outline"}
                size="sm"
                className="h-7 w-9 rounded-lg px-0 text-xs"
                onClick={() => onPageSizeChange(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-lg px-2 text-xs"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            ก่อนหน้า
          </Button>
          <span className="min-w-[64px] text-center text-xs text-muted-foreground">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-lg px-2 text-xs"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            ถัดไป
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
