import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Setting } from "@/types";

export const settingsApi = {
  async list(): Promise<Setting[]> {
    const res = await apiClient.get<ApiResponse<Setting[]>>("/settings");
    return res.data.data;
  },

  async update(key: string, value: string): Promise<Setting> {
    const res = await apiClient.put<ApiResponse<Setting>>(`/settings/${key}`, {
      value,
    });
    return res.data.data;
  },
};
