import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CategoryStockItem, MonthlyReport } from "@/types";

export const reportsApi = {
  async monthly(year: number, month: number): Promise<MonthlyReport> {
    const res = await apiClient.get<ApiResponse<MonthlyReport>>(
      "/reports/monthly",
      { params: { year, month } },
    );
    return res.data.data;
  },

  async stockByCategory(): Promise<CategoryStockItem[]> {
    const res = await apiClient.get<ApiResponse<CategoryStockItem[]>>(
      "/reports/stock-by-category",
    );
    return res.data.data;
  },
};
