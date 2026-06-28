import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Category } from "@/types";

export interface CategoryInput {
  name: string;
  description?: string | null;
}

export interface ListCategoriesResult {
  categories: Category[];
  total: number;
}

export const categoriesApi = {
  async list(params?: { search?: string; activeOnly?: boolean }): Promise<ListCategoriesResult> {
    const res = await apiClient.get<ApiResponse<Category[]>>("/categories", {
      params: {
        search: params?.search || undefined,
        active: params?.activeOnly ? "true" : undefined,
        page_size: 100,
      },
    });
    return { categories: res.data.data, total: res.data.meta?.total ?? 0 };
  },

  async create(input: CategoryInput): Promise<Category> {
    const res = await apiClient.post<ApiResponse<Category>>("/categories", input);
    return res.data.data;
  },

  async update(id: string, input: CategoryInput): Promise<Category> {
    const res = await apiClient.put<ApiResponse<Category>>(
      `/categories/${id}`,
      input,
    );
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
