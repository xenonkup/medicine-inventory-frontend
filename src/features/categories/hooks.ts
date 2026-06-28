"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  categoriesApi,
  type CategoryInput,
} from "@/features/categories/api";
import { getErrorMessage } from "@/lib/api-client";

const CATEGORIES_KEY = ["categories"];

export function useCategories(search?: string) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, search ?? ""],
    queryFn: () => categoriesApi.list({ search }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoriesApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success("สร้างหมวดหมู่สำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      categoriesApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success("อัปเดตหมวดหมู่สำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success("ปิดใช้งานหมวดหมู่สำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
