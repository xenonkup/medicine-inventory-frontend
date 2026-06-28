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
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { useSetUserStatus, useUsers } from "@/features/users/hooks";
import { ROLE_LABELS } from "@/lib/constants";

export default function UsersPage() {
  const { data, isLoading, isError } = useUsers();
  const setStatus = useSetUserStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">ผู้ใช้งาน</h1>
          <p className="text-muted-foreground">จัดการบัญชีผู้ใช้และสิทธิ์</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>ชื่อผู้ใช้</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">
                  ไม่สามารถโหลดข้อมูลผู้ใช้ได้
                </TableCell>
              </TableRow>
            )}
            {data?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge variant="outline" className="text-green-600">
                      ใช้งาน
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      ปิดใช้งาน
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={setStatus.isPending}
                    onClick={() =>
                      setStatus.mutate({
                        id: user.id,
                        isActive: !user.is_active,
                      })
                    }
                  >
                    {user.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data && data.users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  ยังไม่มีผู้ใช้
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
