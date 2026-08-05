import { supabase, isConfigured, isMockFallbackEnabled } from '../services/supabaseClient';
import { PaginatedApiResponse, QueryParams } from '../types/api.types';

export class BaseRepository {
  /**
   * Safe RPC execution with error handling & fallback
   */
  protected static async callRpc<T>(
    rpcName: string,
    params: Record<string, any>,
    fallbackFn: () => Promise<PaginatedApiResponse<T>>
  ): Promise<PaginatedApiResponse<T>> {
    if (!isConfigured) {
      if (isMockFallbackEnabled) {
        return fallbackFn();
      }
      throw new Error('Supabase URL & Key belum dikonfigurasi di file .env');
    }

    try {
      const { data, error } = await supabase.rpc(rpcName, params);
      if (error) {
        console.warn(`Supabase RPC [${rpcName}] failed:`, error.message);
        if (isMockFallbackEnabled) {
          return fallbackFn();
        }
        throw error;
      }
      return data as PaginatedApiResponse<T>;
    } catch (err: any) {
      if (isMockFallbackEnabled) {
        return fallbackFn();
      }
      throw err;
    }
  }

  /**
   * Safe direct table query with server-side pagination (limit & offset)
   */
  protected static async fetchPaginated<T>(
    tableName: string,
    queryParams: QueryParams,
    selectCols: string = '*',
    fallbackFn: () => Promise<PaginatedApiResponse<T>>
  ): Promise<PaginatedApiResponse<T>> {
    if (!isConfigured) {
      if (isMockFallbackEnabled) {
        return fallbackFn();
      }
      throw new Error('Supabase belum dikonfigurasi.');
    }

    try {
      const page = queryParams.page || 1;
      const limit = queryParams.limit || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from(tableName)
        .select(selectCols, { count: 'exact' });

      // Apply search filter if provided
      if (queryParams.search && queryParams.search.trim()) {
        const s = queryParams.search.trim();
        // Uses textSearch or ilike
        query = query.or(`produk.ilike.%${s}%,kode.ilike.%${s}%,sales.ilike.%${s}%`);
      }

      // Apply dynamic field filters
      if (queryParams.filters) {
        Object.entries(queryParams.filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            query = query.eq(key, val);
          }
        });
      }

      // Apply sorting
      if (queryParams.sortBy) {
        query = query.order(queryParams.sortBy, { ascending: queryParams.sortOrder === 'ASC' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply strict pagination bounds
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) {
        console.warn(`Supabase query on [${tableName}] error:`, error.message);
        if (isMockFallbackEnabled) return fallbackFn();
        throw error;
      }

      const totalRecords = count || 0;
      return {
        data: (data || []) as T[],
        pagination: {
          page,
          limit,
          totalRecords,
          filteredRecords: totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        }
      };
    } catch (err: any) {
      if (isMockFallbackEnabled) return fallbackFn();
      throw err;
    }
  }
}
