"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  usersApi,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/features/users/api";
import { getErrorMessage } from "@/lib/api-client";

const USERS_KEY = ["users"];

export function useUsers(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...USERS_KEY, page, pageSize],
    queryFn: () => usersApi.list(page, pageSize),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("สร้างผู้ใช้สำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("อัปเดตผู้ใช้สำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.setStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("เปลี่ยนสถานะผู้ใช้สำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersApi.resetPassword(id, password),
    onSuccess: () => {
      toast.success("รีเซ็ตรหัสผ่านสำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
