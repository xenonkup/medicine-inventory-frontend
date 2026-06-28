"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
import {
  useCategories,
  useDeleteCategory,
} from "@/features/categories/hooks";

export default function CategoriesPage() {
  const { data, isLoading, isError } = useCategories();
  const deleteCategory = useDeleteCategory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">หมวดหมู่ยา</h1>
          <p className="text-muted-foreground">จัดการหมวดหมู่สำหรับจัดกลุ่มยา</p>
        </div>
        <CategoryDialog trigger={<Button>+ เพิ่มหมวดหมู่</Button>} />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อหมวดหมู่</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                  ไม่สามารถโหลดข้อมูลได้
                </TableCell>
              </TableRow>
            )}
            {data?.categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {category.description || "-"}
                </TableCell>
                <TableCell>
                  {category.is_active ? (
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
                  <CategoryDialog
                    category={category}
                    trigger={
                      <Button variant="ghost" size="sm">
                        แก้ไข
                      </Button>
                    }
                  />
                  {category.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={deleteCategory.isPending}
                      onClick={() => deleteCategory.mutate(category.id)}
                    >
                      ปิดใช้งาน
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {data && data.categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  ยังไม่มีหมวดหมู่
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
