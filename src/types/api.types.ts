import { PaginationState } from './table.types';

export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: PaginationState;
  metrics?: Record<string, any>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export interface DashboardMetrics {
  totalPerhitunganCount: number;
  totalPerhitunganRevenue: number;
  avgOverallMargin: number;
  totalSPHCount: number;
  totalSPHValue: number;
  totalSPHDeal: number;
  totalMasterProduk: number;
  totalSalesUsers: number;
  syncs24hSuccess: number;
  lastRefreshedAt: string;
}
