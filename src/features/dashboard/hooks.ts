"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/features/dashboard/api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardApi.summary(),
  });
}

export function useNearExpiry() {
  return useQuery({
    queryKey: ["dashboard", "near-expiry"],
    queryFn: () => dashboardApi.nearExpiry(),
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: () => dashboardApi.lowStock(),
  });
}
