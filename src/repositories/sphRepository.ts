import { BaseRepository } from './baseRepository';
import { SPH, SPHStatus } from '../types/database.types';
import { PaginatedApiResponse, QueryParams } from '../types/api.types';
import { generateMockSPH } from '../services/mockData';
import { supabase, isConfigured } from '../services/supabaseClient';

export class SPHRepository extends BaseRepository {
  private static cachedMock: SPH[] | null = null;

  private static getMockData(): SPH[] {
    if (!this.cachedMock) {
      this.cachedMock = generateMockSPH();
    }
    return this.cachedMock;
  }

  public static async getPaginated(params: QueryParams): Promise<PaginatedApiResponse<SPH>> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    return this.callRpc<SPH>(
      'fn_query_sph_paginated',
      {
        p_page: page,
        p_limit: limit,
        p_search: params.search || null,
        p_status: params.filters?.status || null,
        p_brand: params.filters?.brand || null,
        p_sales: params.filters?.sales || null,
        p_date_start: params.filters?.date_start || null,
        p_date_end: params.filters?.date_end || null,
        p_sort_by: params.sortBy || 'created_at',
        p_sort_order: params.sortOrder || 'DESC'
      },
      async () => {
        let list = [...this.getMockData()];

        if (params.search && params.search.trim()) {
          const s = params.search.toLowerCase().trim();
          list = list.filter(item => 
            (item.no_sph && item.no_sph.toLowerCase().includes(s)) ||
            (item.nama_pt && item.nama_pt.toLowerCase().includes(s)) ||
            (item.sales && item.sales.toLowerCase().includes(s)) ||
            (item.brand && item.brand.toLowerCase().includes(s)) ||
            (item.deskripsi && item.deskripsi.toLowerCase().includes(s))
          );
        }

        if (params.filters?.status) {
          list = list.filter(item => item.status_sph === params.filters?.status);
        }
        if (params.filters?.brand) {
          list = list.filter(item => item.brand === params.filters?.brand);
        }
        if (params.filters?.sales) {
          list = list.filter(item => item.sales === params.filters?.sales);
        }

        const sortBy = (params.sortBy || 'created_at') as keyof SPH;
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
        const totalQuotationValue = list.reduce((acc, curr) => acc + (curr.harga_jual_akhir || 0), 0);

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
            totalQuotationValue
          }
        };
      }
    );
  }

  public static async create(record: Omit<SPH, 'created_at' | 'updated_at' | 'synced_at'>): Promise<SPH> {
    const newRecord: SPH = {
      ...record,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const { data, error } = await supabase.from('sph').insert(newRecord).select().single();
      if (error) throw error;
      return data;
    }

    const mock = this.getMockData();
    mock.unshift(newRecord);
    return newRecord;
  }

  public static async updateStatus(id: string, status: SPHStatus): Promise<boolean> {
    if (isConfigured) {
      const { error } = await supabase.from('sph').update({ status_sph: status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      return true;
    }
    const mock = this.getMockData();
    const item = mock.find(m => m.id === id);
    if (item) {
      item.status_sph = status;
      item.updated_at = new Date().toISOString();
    }
    return true;
  }

  public static async delete(id: string): Promise<boolean> {
    if (isConfigured) {
      const { error } = await supabase.from('sph').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const mock = this.getMockData();
    const idx = mock.findIndex(m => m.id === id);
    if (idx !== -1) mock.splice(idx, 1);
    return true;
  }
}
