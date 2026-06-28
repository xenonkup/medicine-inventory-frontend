"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  inventoryApi,
  type StockInInput,
  type StockOutInput,
  type StockReturnInput,
} from "@/features/inventory/api";
import { getErrorMessage } from "@/lib/api-client";

// Movements affect derived stock, so invalidate medicines + lots + ledger.
function useInvalidateInventory() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["medicines"] });
    qc.invalidateQueries({ queryKey: ["lots"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
  };
}

export function useStockIn() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: StockInInput) => inventoryApi.stockIn(input),
    onSuccess: () => {
      invalidate();
      toast.success("รับเข้าสต็อกสำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useStockOut() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: StockOutInput) => inventoryApi.stockOut(input),
    onSuccess: () => {
      invalidate();
      toast.success("จ่ายออกสำเร็จ (FEFO)");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useStockReturn() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: StockReturnInput) => inventoryApi.stockReturn(input),
    onSuccess: () => {
      invalidate();
      toast.success("รับคืนสำเร็จ");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useLots(medicineId?: string) {
  return useQuery({
    queryKey: ["lots", medicineId],
    queryFn: () => inventoryApi.lotsByMedicine(medicineId!),
    enabled: Boolean(medicineId),
  });
}

export function useTransactions(params?: {
  medicineId?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ["transactions", params ?? {}],
    queryFn: () => inventoryApi.transactions(params),
  });
}
