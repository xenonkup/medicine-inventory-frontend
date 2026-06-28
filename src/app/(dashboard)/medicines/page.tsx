"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MedicineDialog } from "@/features/medicines/components/medicine-dialog";
import {
  useDeleteMedicine,
  useMedicines,
} from "@/features/medicines/hooks";
import { useDebounce } from "@/hooks/use-debounce";

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const { data, isLoading, isError } = useMedicines({ search: debounced });
  const deleteMedicine = useDeleteMedicine();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">จัดการยา</h1>
          <p className="text-muted-foreground">ข้อมูลหลักของยาในคลัง</p>
        </div>
        <MedicineDialog trigger={<Button>+ เพิ่มยา</Button>} />
      </div>

      <Input
        placeholder="ค้นหาด้วยชื่อยาหรือรหัส..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อยา</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>หน่วย</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead className="text-right">จุดสั่งซื้อ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-destructive">
                  ไม่สามารถโหลดข้อมูลได้
                </TableCell>
              </TableRow>
            )}
            {data?.medicines.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-sm">{m.code}</TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.category_name ?? "-"}</TableCell>
                <TableCell>{m.unit}</TableCell>
                <TableCell className="text-right">{m.stock_on_hand}</TableCell>
                <TableCell className="text-right">{m.reorder_level}</TableCell>
                <TableCell>
                  {m.is_active ? (
                    <Badge variant="outline" className="text-green-600">
                      ใช้งาน
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      ปิดใช้งาน
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="space-x-1 text-right">
                  <MedicineDialog
                    medicine={m}
                    trigger={
                      <Button variant="ghost" size="sm">
                        แก้ไข
                      </Button>
                    }
                  />
                  {m.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={deleteMedicine.isPending}
                      onClick={() => deleteMedicine.mutate(m.id)}
                    >
                      ปิดใช้งาน
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {data && data.medicines.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  ยังไม่มีรายการยา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
