import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Role, UserProfile } from "@/types";

export interface CreateUserInput {
  username: string;
  password: string;
  full_name: string;
  role: Role;
}

export interface UpdateUserInput {
  full_name: string;
  role: Role;
}

export interface ListUsersResult {
  users: UserProfile[];
  total: number;
  page: number;
  pageSize: number;
}

export const usersApi = {
  async list(page = 1, pageSize = 20): Promise<ListUsersResult> {
    const res = await apiClient.get<ApiResponse<UserProfile[]>>("/users", {
      params: { page, page_size: pageSize },
    });
    return {
      users: res.data.data,
      total: res.data.meta?.total ?? 0,
      page: res.data.meta?.page ?? page,
      pageSize: res.data.meta?.page_size ?? pageSize,
    };
  },

  async create(input: CreateUserInput): Promise<UserProfile> {
    const res = await apiClient.post<ApiResponse<UserProfile>>("/users", input);
    return res.data.data;
  },

  async update(id: string, input: UpdateUserInput): Promise<UserProfile> {
    const res = await apiClient.put<ApiResponse<UserProfile>>(
      `/users/${id}`,
      input,
    );
    return res.data.data;
  },

  async setStatus(id: string, isActive: boolean): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(
      `/users/${id}/status`,
      { is_active: isActive },
    );
    return res.data.data;
  },

  async resetPassword(id: string, password: string): Promise<void> {
    await apiClient.patch<ApiResponse<{ message: string }>>(
      `/users/${id}/password`,
      { password },
    );
  },
};
