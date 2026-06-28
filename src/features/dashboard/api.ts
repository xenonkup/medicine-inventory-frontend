import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  DashboardSummary,
  LowStockItem,
  NearExpiryItem,
} from "@/types";

export const dashboardApi = {
  async summary(): Promise<DashboardSummary> {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>(
      "/dashboard/summary",
    );
    return res.data.data;
  },

  async nearExpiry(): Promise<NearExpiryItem[]> {
    const res = await apiClient.get<ApiResponse<NearExpiryItem[]>>(
      "/dashboard/near-expiry",
    );
    return res.data.data;
  },

  async lowStock(): Promise<LowStockItem[]> {
    const res = await apiClient.get<ApiResponse<LowStockItem[]>>(
      "/dashboard/low-stock",
    );
    return res.data.data;
  },
};
