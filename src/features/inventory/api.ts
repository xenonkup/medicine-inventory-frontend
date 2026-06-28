import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  Lot,
  StockOutResult,
  StockTransaction,
} from "@/types";

export interface StockInInput {
  medicine_id: string;
  lot_number: string;
  expiry_date: string;
  quantity: number;
  reference_no?: string | null;
}

export interface StockOutInput {
  medicine_id: string;
  quantity: number;
  reference_no?: string | null;
}

export interface StockReturnInput {
  lot_id: string;
  quantity: number;
  reference_no?: string | null;
}

export const inventoryApi = {
  async stockIn(input: StockInInput): Promise<Lot> {
    const res = await apiClient.post<ApiResponse<Lot>>("/stock/in", input);
    return res.data.data;
  },

  async stockOut(input: StockOutInput): Promise<StockOutResult> {
    const res = await apiClient.post<ApiResponse<StockOutResult>>(
      "/stock/out",
      input,
    );
    return res.data.data;
  },

  async stockReturn(input: StockReturnInput): Promise<Lot> {
    const res = await apiClient.post<ApiResponse<Lot>>("/stock/return", input);
    return res.data.data;
  },

  async lotsByMedicine(medicineId: string): Promise<Lot[]> {
    const res = await apiClient.get<ApiResponse<Lot[]>>(
      `/medicines/${medicineId}/lots`,
    );
    return res.data.data;
  },

  async transactions(params?: {
    medicineId?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: StockTransaction[]; total: number }> {
    const res = await apiClient.get<ApiResponse<StockTransaction[]>>(
      "/stock/transactions",
      {
        params: {
          medicine_id: params?.medicineId || undefined,
          type: params?.type || undefined,
          page: params?.page ?? 1,
          page_size: params?.pageSize ?? 50,
        },
      },
    );
    return { items: res.data.data, total: res.data.meta?.total ?? 0 };
  },
};
