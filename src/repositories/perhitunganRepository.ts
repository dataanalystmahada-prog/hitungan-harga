import { BaseRepository } from './baseRepository';
import { Perhitungan } from '../types/database.types';
import { PaginatedApiResponse, QueryParams } from '../types/api.types';
import { generateMockPerhitungan } from '../services/mockData';
import { supabase, isConfigured } from '../services/supabaseClient';

export class PerhitunganRepository extends BaseRepository {
  private static cachedMock: Perhitungan[] | null = null;

  private static getMockData(): Perhitungan[] {
    if (!this.cachedMock) {
      this.cachedMock = generateMockPerhitungan();
    }
    return this.cachedMock;
  }

  /**
   * Fetch server-side paginated, searched, and filtered perhitungan records
   */
  public static async getPaginated(params: QueryParams): Promise<PaginatedApiResponse<Perhitungan>> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    return this.callRpc<Perhitungan>(
      'fn_query_perhitungan_paginated',
      {
        p_page: page,
        p_limit: limit,
        p_search: params.search || null,
        p_sales: params.filters?.sales || null,
        p_produk: params.filters?.produk || null,
        p_proses_logo: params.filters?.proses_logo || null,
        p_date_start: params.filters?.date_start || null,
        p_date_end: params.filters?.date_end || null,
        p_sort_by: params.sortBy || 'created_at',
        p_sort_order: params.sortOrder || 'DESC'
      },
      async () => {
        // High-performance In-Memory mock simulation
        let list = [...this.getMockData()];

        // Search
        if (params.search && params.search.trim()) {
          const s = params.search.toLowerCase().trim();
          list = list.filter(item => 
            (item.produk && item.produk.toLowerCase().includes(s)) ||
            (item.kode && item.kode.toLowerCase().includes(s)) ||
            (item.sales && item.sales.toLowerCase().includes(s)) ||
            (item.proses_logo && item.proses_logo.toLowerCase().includes(s))
          );
        }

        // Filters
        if (params.filters?.sales) {
          list = list.filter(item => item.sales === params.filters?.sales);
        }
        if (params.filters?.produk) {
          list = list.filter(item => item.produk === params.filters?.produk);
        }
        if (params.filters?.proses_logo) {
          list = list.filter(item => item.proses_logo === params.filters?.proses_logo);
        }

        // Sorting
        const sortBy = (params.sortBy || 'created_at') as keyof Perhitungan;
        const sortOrder = params.sortOrder || 'DESC';
        list.sort((a, b) => {
          const valA = a[sortBy] ?? '';
          const valB = b[sortBy] ?? '';
          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder === 'ASC' ? valA - valB : valB - valA;
          }
          return sortOrder === 'ASC' 
            ? String(valA).localeCompare(String(valB)) 
            : String(valB).localeCompare(String(valA));
        });

        const totalFiltered = list.length;
        const offset = (page - 1) * limit;
        const paginatedData = list.slice(offset, offset + limit);

        const totalRevenue = list.reduce((acc, curr) => acc + (curr.total_harga_jual || 0), 0);
        const avgMargin = list.length > 0 ? (list.reduce((acc, curr) => acc + (curr.margin || 0), 0) / list.length) : 0;

        return {
          data: paginatedData,
          pagination: {
            page,
            limit,
            totalRecords: this.getMockData().length,
            filteredRecords: totalFiltered,
            totalPages: Math.ceil(totalFiltered / limit),
          },
          metrics: {
            totalRevenue,
            avgMargin: Number(avgMargin.toFixed(2))
          }
        };
      }
    );
  }

  /**
   * Filter and sanitize payload so only valid table columns are sent to Supabase
   */
  private static sanitize(record: any): Partial<Perhitungan> {
    const allowedKeys: (keyof Perhitungan)[] = [
      'id',
      'tanggal',
      'sales',
      'produk',
      'kode',
      'proses_logo',
      'qty',
      'modal_produk',
      'modal_logo',
      'margin',
      'harga_jual',
      'total_harga_jual',
      'harga_jual_net',
      'diskon',
      'created_at',
      'updated_at',
      'synced_at',
    ];

    const clean: any = {};
    for (const key of allowedKeys) {
      if (record[key] !== undefined) {
        clean[key] = record[key];
      }
    }
    return clean;
  }

  /**
   * Save a single calculation
   */
  public static async create(record: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>): Promise<Perhitungan> {
    const newRecord: Perhitungan = {
      ...(this.sanitize(record) as any),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const { data, error } = await supabase.from('perhitungan').insert(newRecord).select().single();
      if (error) throw error;
      return data;
    }

    // Mock storage
    const mock = this.getMockData();
    mock.unshift(newRecord);
    return newRecord;
  }

  /**
   * Save multiple calculations at once (Batch Multi-Product)
   */
  public static async createBatch(records: Omit<Perhitungan, 'created_at' | 'updated_at' | 'synced_at'>[]): Promise<Perhitungan[]> {
    const prepared = records.map(r => ({
      ...(this.sanitize(r) as any),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    }));

    if (isConfigured) {
      const { data, error } = await supabase.from('perhitungan').insert(prepared).select();
      if (error) throw error;
      return data || [];
    }

    const mock = this.getMockData();
    mock.unshift(...prepared);
    return prepared;
  }

  /**
   * Update calculation record
   */
  public static async update(id: string, updates: Partial<Perhitungan>): Promise<Perhitungan> {
    const cleanUpdates = this.sanitize(updates);
    const updatedPayload = {
      ...cleanUpdates,
      updated_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const { data, error } = await supabase
        .from('perhitungan')
        .update(updatedPayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const mock = this.getMockData();
    const idx = mock.findIndex(m => m.id === id);
    if (idx !== -1) {
      mock[idx] = {
        ...mock[idx],
        ...updatedPayload,
      };
      return mock[idx];
    }
    throw new Error('Data perhitungan tidak ditemukan');
  }

  /**
   * Delete calculation
   */
  public static async delete(id: string): Promise<boolean> {
    if (isConfigured) {
      const { error } = await supabase.from('perhitungan').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const mock = this.getMockData();
    const idx = mock.findIndex(m => m.id === id);
    if (idx !== -1) mock.splice(idx, 1);
    return true;
  }
}
