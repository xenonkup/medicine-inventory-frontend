"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  medicinesApi,
  type ListMedicinesParams,
  type MedicineInput,
} from "@/features/medicines/api";
import { getErrorMessage } from "@/lib/api-client";

const MEDICINES_KEY = ["medicines"];

export function useMedicines(params?: ListMedicinesParams) {
  return useQuery({
    queryKey: [...MEDICINES_KEY, params ?? {}],
    queryFn: () => medicinesApi.list(params),
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MedicineInput) => medicinesApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDICINES_KEY });
      toast.success("เพิ่มยาสำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MedicineInput }) =>
      medicinesApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDICINES_KEY });
      toast.success("อัปเดตยาสำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicinesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDICINES_KEY });
      toast.success("ปิดใช้งานยาสำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
