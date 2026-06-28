"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks";
import { ROLE_LABELS } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";

export function AppHeader() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <header className="flex h-14 items-center justify-end gap-2 border-b bg-background px-4">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2" />}>
          <span className="font-medium">{user?.full_name ?? "ผู้ใช้"}</span>
          <span className="text-xs text-muted-foreground">
            {user ? ROLE_LABELS[user.role] : ""}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout.mutate()}
            className="text-destructive"
          >
            ออกจากระบบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
