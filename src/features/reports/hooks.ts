"use client";

import { useQuery } from "@tanstack/react-query";

import { reportsApi } from "@/features/reports/api";

export function useMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: ["reports", "monthly", year, month],
    queryFn: () => reportsApi.monthly(year, month),
  });
}

export function useMovements(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: ["reports", "movements", from, to],
    queryFn: () => reportsApi.movements(from, to),
    enabled: enabled && Boolean(from) && Boolean(to),
  });
}

export function useStockByCategory() {
  return useQuery({
    queryKey: ["reports", "stock-by-category"],
    queryFn: () => reportsApi.stockByCategory(),
  });
}
