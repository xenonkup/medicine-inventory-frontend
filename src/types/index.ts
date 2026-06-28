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

export interface Lot {
  id: string;
  medicine_id: string;
  lot_number: string;
  expiry_date: string;
  qty_received: number;
  qty_remaining: number;
  received_date: string;
}

export interface Allocation {
  lot_id: string;
  lot_number: string;
  expiry_date: string;
  deducted: number;
}

export interface StockOutResult {
  medicine_id: string;
  total_quantity: number;
  allocations: Allocation[];
}

export interface DashboardSummary {
  total_medicines: number;
  near_expiry_count: number;
  low_stock_count: number;
  today_movements: number;
  near_expiry_days: number;
}

export interface NearExpiryItem {
  medicine_id: string;
  medicine_name: string;
  lot_number: string;
  expiry_date: string;
  qty_remaining: number;
  days_left: number;
}

export interface LowStockItem {
  medicine_id: string;
  code: string;
  name: string;
  unit: string;
  stock_on_hand: number;
  reorder_level: number;
}

export type TxType = "IN" | "OUT" | "RETURN";

export interface StockTransaction {
  id: string;
  lot_id: string;
  medicine_id: string;
  type: TxType;
  quantity: number;
  reference_no?: string | null;
  note?: string | null;
  created_by: string;
  created_at: string;
}
