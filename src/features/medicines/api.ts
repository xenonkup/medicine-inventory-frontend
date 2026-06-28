import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Medicine } from "@/types";

export interface MedicineInput {
  code: string;
  name: string;
  category_id: string;
  unit: string;
  reorder_level: number;
  description?: string | null;
}

export interface ListMedicinesParams {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export interface ListMedicinesResult {
  medicines: Medicine[];
  total: number;
  page: number;
  pageSize: number;
}

export const medicinesApi = {
  async list(params?: ListMedicinesParams): Promise<ListMedicinesResult> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const res = await apiClient.get<ApiResponse<Medicine[]>>("/medicines", {
      params: {
        search: params?.search || undefined,
        category_id: params?.categoryId || undefined,
        page,
        page_size: pageSize,
      },
    });
    return {
      medicines: res.data.data,
      total: res.data.meta?.total ?? 0,
      page: res.data.meta?.page ?? page,
      pageSize: res.data.meta?.page_size ?? pageSize,
    };
  },

  async create(input: MedicineInput): Promise<Medicine> {
    const res = await apiClient.post<ApiResponse<Medicine>>("/medicines", input);
    return res.data.data;
  },

  async update(id: string, input: MedicineInput): Promise<Medicine> {
    const res = await apiClient.put<ApiResponse<Medicine>>(
      `/medicines/${id}`,
      input,
    );
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/medicines/${id}`);
  },
};
