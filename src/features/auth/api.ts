import { apiClient } from "@/lib/api-client";
import type { ApiResponse, AuthResponse, UserProfile } from "@/types";

export interface LoginInput {
  username: string;
  password: string;
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      input,
    );
    return res.data.data;
  },

  async me(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<UserProfile>>("/auth/me");
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
