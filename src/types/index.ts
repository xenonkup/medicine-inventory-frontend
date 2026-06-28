// Shared API contract types mirroring the Go backend's response envelope.

export type Role = "ADMIN" | "STAFF";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserProfile;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
}

export interface Medicine {
  id: string;
  code: string;
  name: string;
  category_id: string;
  category_name?: string;
  unit: string;
  reorder_level: number;
  stock_on_hand: number;
  description?: string | null;
  is_active: boolean;
}
