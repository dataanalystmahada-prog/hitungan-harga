import { BaseRepository } from './baseRepository';
import { SPH, SPHStatus } from '../types/database.types';
import { PaginatedApiResponse, QueryParams } from '../types/api.types';
import { generateMockSPH } from '../services/mockData';
import { supabase, isConfigured } from '../services/supabaseClient';

const SPH_CACHE_KEY = 'MAHADA_SPH_META_CACHE';

function getLocalSphMetaCache(): Record<string, Partial<SPH>> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SPH_CACHE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalSphMetaCache(id: string, meta: Partial<SPH>) {
  try {
    if (typeof window === 'undefined') return;
    const current = getLocalSphMetaCache();
    current[id] = { ...(current[id] || {}), ...meta };
    localStorage.setItem(SPH_CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save to SPH meta cache:', e);
  }
}

function removeLocalSphMetaCache(ids: string[]) {
  try {
    if (typeof window === 'undefined') return;
    const current = getLocalSphMetaCache();
    ids.forEach(id => delete current[id]);
    localStorage.setItem(SPH_CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to remove from SPH meta cache:', e);
  }
}

export class SPHRepository extends BaseRepository {
  private static cachedMock: SPH[] | null = null;

  private static getMockData(): SPH[] {
    if (!this.cachedMock) {
      this.cachedMock = generateMockSPH();
    }
    return this.cachedMock;
  }

  private static getRomanMonth(date: Date): string {
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romanMonths[date.getMonth()];
  }

  public static async getPaginated(params: QueryParams): Promise<PaginatedApiResponse<SPH>> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    const fallbackFn = async (): Promise<PaginatedApiResponse<SPH>> => {
      let list = [...this.getMockData()];

      if (params.search && params.search.trim()) {
        const s = params.search.toLowerCase().trim();
        list = list.filter(item => 
          (item.no_sph && item.no_sph.toLowerCase().includes(s)) ||
          (item.nama_pt && item.nama_pt.toLowerCase().includes(s)) ||
          (item.sales && item.sales.toLowerCase().includes(s)) ||
          (item.brand && item.brand.toLowerCase().includes(s)) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(s)) ||
          (item.produk && item.produk.toLowerCase().includes(s))
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
          totalPages: Math.ceil(totalFiltered / Math.max(1, limit)),
        },
        metrics: {
          totalQuotationValue
        }
      };
    };

    let result: PaginatedApiResponse<SPH>;

    if (isConfigured) {
      try {
        result = await this.fetchPaginated<SPH>('sph', params, '*', fallbackFn);
      } catch (err) {
        result = await this.callRpc<SPH>(
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
          fallbackFn
        );
      }
    } else {
      result = await fallbackFn();
    }

    // Hydrate cached client metadata for SPH
    const localMeta = getLocalSphMetaCache();
    const enrichedData = (result.data || []).map(row => {
      const cached = localMeta[row.id];
      return {
        ...row,
        nama_pt: (row.nama_pt || cached?.nama_pt || '').trim(),
        items: row.items || cached?.items,
        ongkir: row.ongkir !== undefined ? row.ongkir : cached?.ongkir,
        ppn: row.ppn !== undefined ? row.ppn : cached?.ppn,
        is_ppn: row.is_ppn !== undefined ? row.is_ppn : cached?.is_ppn,
        show_diskon: row.show_diskon !== undefined ? row.show_diskon : cached?.show_diskon,
        show_ppn: row.show_ppn !== undefined ? row.show_ppn : cached?.show_ppn,
        show_ongkir: row.show_ongkir !== undefined ? row.show_ongkir : cached?.show_ongkir,
      };
    });

    const totalQuotationValue = enrichedData.reduce((acc, curr) => acc + (curr.harga_jual_akhir || 0), 0);

    return {
      ...result,
      data: enrichedData,
      metrics: {
        totalQuotationValue: result.metrics?.totalQuotationValue ?? totalQuotationValue,
      }
    };
  }

  public static async create(record: Omit<SPH, 'created_at' | 'updated_at' | 'synced_at'>): Promise<SPH> {
    const newRecord: SPH = {
      ...record,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    };

    if (newRecord.id) {
      saveLocalSphMetaCache(newRecord.id, {
        nama_pt: newRecord.nama_pt,
        items: newRecord.items,
        deskripsi: newRecord.deskripsi,
        brand: newRecord.brand,
        ongkir: newRecord.ongkir,
        ppn: newRecord.ppn,
        is_ppn: newRecord.is_ppn,
        show_diskon: newRecord.show_diskon,
        show_ppn: newRecord.show_ppn,
        show_ongkir: newRecord.show_ongkir,
      });
    }

    if (isConfigured) {
      try {
        const { data, error } = await supabase.from('sph').insert(newRecord).select().single();
        if (error) throw error;
        return { 
          ...data, 
          nama_pt: newRecord.nama_pt || data?.nama_pt, 
          items: newRecord.items || data?.items,
          ongkir: newRecord.ongkir ?? data?.ongkir,
          ppn: newRecord.ppn ?? data?.ppn,
          is_ppn: newRecord.is_ppn ?? data?.is_ppn,
          show_diskon: newRecord.show_diskon ?? data?.show_diskon,
          show_ppn: newRecord.show_ppn ?? data?.show_ppn,
          show_ongkir: newRecord.show_ongkir ?? data?.show_ongkir,
        };
      } catch (err: any) {
        if (err.message && (err.message.includes('items') || err.message.includes('column'))) {
          const fallback = { ...newRecord };
          delete fallback.items;
          delete fallback.ongkir;
          delete fallback.ppn;
          delete fallback.is_ppn;
          delete fallback.show_diskon;
          delete fallback.show_ppn;
          delete fallback.show_ongkir;
          const { data, error } = await supabase.from('sph').insert(fallback).select().single();
          if (error) throw error;
          return { 
            ...data, 
            nama_pt: newRecord.nama_pt, 
            items: newRecord.items,
            ongkir: newRecord.ongkir,
            ppn: newRecord.ppn,
            is_ppn: newRecord.is_ppn,
            show_diskon: newRecord.show_diskon,
            show_ppn: newRecord.show_ppn,
            show_ongkir: newRecord.show_ongkir,
          };
        }
        throw err;
      }
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
    removeLocalSphMetaCache([id]);
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

  public static async getNextSequence(brandCode: string, date: Date): Promise<string> {
    const year = date.getFullYear();
    const romanMonth = this.getRomanMonth(date);
    const pattern = `SPH %/${brandCode}/${romanMonth}/${year}`;

    let lastSeq = 0;

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('sph')
          .select('no_sph')
          .like('no_sph', pattern)
          .order('no_sph', { ascending: false })
          .limit(1);
        
        if (!error && data && data.length > 0) {
          const parts = (data[0].no_sph || '').split('/');
          if (parts.length > 0) {
            const seqPart = parts[0].replace('SPH ', '').trim();
            const parsed = parseInt(seqPart, 10);
            if (!isNaN(parsed)) lastSeq = parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to query sequence from Supabase:', err);
      }
    } else {
      const mock = this.getMockData();
      const regex = new RegExp(`^SPH (\\d{4})/${brandCode}/${romanMonth}/${year}$`);
      const matches = mock.filter(m => m.no_sph && regex.test(m.no_sph));
      if (matches.length > 0) {
        matches.sort((a, b) => (b.no_sph || '').localeCompare(a.no_sph || ''));
        const parts = (matches[0].no_sph || '').split('/');
        const seqPart = parts[0].replace('SPH ', '').trim();
        const parsed = parseInt(seqPart, 10);
        if (!isNaN(parsed)) lastSeq = parsed;
      }
    }

    const nextSeq = String(lastSeq + 1).padStart(4, '0');
    return `SPH ${nextSeq}/${brandCode}/${romanMonth}/${year}`;
  }
}
