import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CategoryStockItem,
  MonthlyReport,
  MovementReport,
} from "@/types";

export const reportsApi = {
  async monthly(year: number, month: number): Promise<MonthlyReport> {
    const res = await apiClient.get<ApiResponse<MonthlyReport>>(
      "/reports/monthly",
      { params: { year, month } },
    );
    return res.data.data;
  },

  async movements(from: string, to: string): Promise<MovementReport> {
    const res = await apiClient.get<ApiResponse<MovementReport>>(
      "/reports/movements",
      { params: { from, to } },
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
